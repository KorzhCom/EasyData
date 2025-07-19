import { expect } from "@olton/latte";

import {
    AggrCalculationError,
    AggrCalculationOptions,
    AggregatesCalculator,
    AggregatesContainer,
    AggregationColumnStore,
    GroupKey,
    GroupTotals,
    DataGroup
} from '../src/data/aggr_structures';

// Tests for AggregationColumnStore
describe('AggregationColumnStore Interface', () => {
    let columnStore: AggregationColumnStore;

    beforeEach(() => {
        columnStore = {
            getColumnIds: (from: number, to?: number): string[] => {
                const result: string[] = [];
                const toValue = to !== undefined ? to : from;
                for (let i = from; i <= toValue; i++) {
                    result.push(`col${i}`);
                }
                return result;
            },
            validateColumns: (colIds: string[]): boolean => {
                return colIds.every(col => typeof col === 'string' && col.startsWith('col'));
            },
            validateAggregate: (colId: string, funcId: string): boolean => {
                const validFuncs = ['sum', 'avg', 'min', 'max', 'count'];
                return colId.startsWith('col') && validFuncs.includes(funcId);
            }
        };
    });

    it('should return an array of column identifiers in specified range', () => {
        const columns = columnStore.getColumnIds(1, 3);
        expect(columns).toBeArrayEqual(['col1', 'col2', 'col3']);
    });

    it('should return a single column identifier if only starting index is specified', () => {
        const columns = columnStore.getColumnIds(5);
        expect(columns).toBeArrayEqual(['col5']);
    });

    it('should check the column validity', () => {
        expect(columnStore.validateColumns(['col1', 'col2'])).toBe(true);
        expect(columnStore.validateColumns(['col1', 'invalid'])).toBe(false);
    });

    it('should check the aggregate function validity for column', () => {
        expect(columnStore.validateAggregate('col1', 'sum')).toBe(true);
        expect(columnStore.validateAggregate('col2', 'avg')).toBe(true);
        expect(columnStore.validateAggregate('col3', 'invalid')).toBe(false);
        expect(columnStore.validateAggregate('invalid', 'sum')).toBe(false);
    });
});

// Tests for AggregatesContainer
describe('AggregatesContainer Interface', () => {
    let container: AggregatesContainer;

    beforeEach(() => {
        const storage = new Map<number, Map<string, GroupTotals>>();
        
        container = {
            setAggregateData: (level: number, data: Map<string, GroupTotals>) => {
                storage.set(level, data);
            },
            getAggregateData: async (level: number, key: GroupKey): Promise<GroupTotals> => {
                const levelData = storage.get(level);
                if (!levelData) return {};
                
                const keyStr = JSON.stringify(key);
                return levelData.get(keyStr) || {};
            },
            updateAggregateData: (level: number, groupKey: GroupKey, values: GroupTotals) => {
                let levelData = storage.get(level);
                if (!levelData) {
                    levelData = new Map<string, GroupTotals>();
                    storage.set(level, levelData);
                }
                
                const keyStr = JSON.stringify(groupKey);
                levelData.set(keyStr, values);
            }
        };
    });

    it('should save aggregate data for a specific level', () => {
        const data = new Map<string, GroupTotals>();
        data.set(JSON.stringify({col1: 'value1'}), {sum: 100, count: 10});
        
        container.setAggregateData(1, data);

        // Check this through getAggregateData
        return container.getAggregateData(1, {col1: 'value1'})
            .then(totals => {
                expect(totals).toBeObject({sum: 100, count: 10});
            });
    });

    it('should return an empty object for a non-existent level', () => {
        return container.getAggregateData(999, {col1: 'value1'})
            .then(totals => {
                expect(totals).toBeObject({});
            });
    });

    it('should update aggregate data', () => {
        container.updateAggregateData(1, {col1: 'value1'}, {sum: 100});
        container.updateAggregateData(1, {col1: 'value1'}, {sum: 200});
        
        return container.getAggregateData(1, {col1: 'value1'})
            .then(totals => {
                expect(totals).toBeObject({sum: 200});
            });
    });

    it('should create a new level when updating data for a non-existent level', () => {
        container.updateAggregateData(2, {col2: 'value2'}, {avg: 50});
        
        return container.getAggregateData(2, {col2: 'value2'})
            .then(totals => {
                expect(totals).toBeObject({avg: 50});
            });
    });
});

// Tests for AggregatesCalculator
describe('AggregatesCalculator Interface', () => {
    let container: AggregatesContainer;
    let calculator: AggregatesCalculator;
    let needRecalculationValue: boolean;

    beforeEach(() => {
        // Create mock for AggregatesContainer
        container = {
            setAggregateData: mock(),
            getAggregateData: mock().mockImplementation(async () => ({})),
            updateAggregateData: mock()
        };
        
        needRecalculationValue = true;
        
        // Create a mock for AggregatesCalculator
        calculator = {
            getAggrContainer: () => container,
            
            calculate: async (options?: AggrCalculationOptions): Promise<void> => {
                if (options?.maxLevel !== undefined && options.maxLevel < 0) {
                    const error: AggrCalculationError = new Error("Invalid max level") as AggrCalculationError;
                    error.level = 0;
                    
                    if (options.errorOccurred) {
                        options.errorOccurred(error);
                    }
                    throw error;
                }
                
                // Simulate calculation and obtaining result
                const result = { sum: 100, count: 10 };
                if (options?.resultObtained) {
                    options.resultObtained(result, 1);
                }
                
                needRecalculationValue = false;
            },
            
            needRecalculation: () => needRecalculationValue,
            
            reset: () => {
                needRecalculationValue = true;
            }
        };
    });

    it('should return an aggregate container', () => {
        const result = calculator.getAggrContainer();
        expect(result).toBe(container);
    });

    it('should perform a calculation with callback functions', async () => {
        const resultCallback = mock();
        const errorCallback = mock();
        
        await calculator.calculate({
            resultObtained: resultCallback,
            errorOccurred: errorCallback
        });
        
        expect(resultCallback).toHaveBeenCalledWith({ sum: 100, count: 10 }, 1);
        expect(errorCallback).not.toHaveBeenCalled();
        expect(calculator.needRecalculation()).toBe(false);
    });

    it('should call the errorOccurred on calculation error', async () => {
        const resultCallback = mock();
        const errorCallback = mock();
        
        try {
            await calculator.calculate({
                maxLevel: -1,
                resultObtained: resultCallback,
                errorOccurred: errorCallback
            });
        } catch (error) {
            // Expect the error to be caught
        }
        
        expect(resultCallback).not.toHaveBeenCalled();
        expect(errorCallback).toHaveBeenCalled();
        const error = errorCallback.mock.calls[0][0];
        expect(error.message).toBe("Invalid max level");
        expect(error.level).toBe(0);
    });

    it('should return needRecalculation=true after reset', () => {
        calculator.reset();
        expect(calculator.needRecalculation()).toBe(true);
    });

    it('should return needRecalculation=false after successful calculation', async () => {
        await calculator.calculate();
        expect(calculator.needRecalculation()).toBe(false);
    });
});

// Tests for data structures
describe('Data Structures', () => {
    it('should correctly define a DataGroup', () => {
        const group: DataGroup = {
            name: 'TestGroup',
            columns: ['col1', 'col2']
        };
        
        expect(group.name).toBe('TestGroup');
        expect(group.columns).toBeArrayEqual(['col1', 'col2']);
    });

    it('should work with GroupKey as an object', () => {
        const key: GroupKey = {
            col1: 'value1',
            col2: 100
        };
        
        expect(key.col1).toBe('value1');
        expect(key.col2).toBe(100);
    });

    it('should work with GroupTotals as an object', () => {
        const totals: GroupTotals = {
            sum: 500,
            avg: 100,
            count: 5
        };
        
        expect(totals.sum).toBe(500);
        expect(totals.avg).toBe(100);
        expect(totals.count).toBe(5);
    });

    it('should create an AggrCalculationError with a level', () => {
        const error = new Error('Test error') as AggrCalculationError;
        error.level = 2;
        
        expect(error.message).toBe('Test error');
        expect(error.level).toBe(2);
    });

    it('should create an AggrCalculationOptions with options', () => {
        const options: AggrCalculationOptions = {
            maxLevel: 3,
            resultObtained: mock(),
            errorOccurred: mock()
        };
        
        expect(options.maxLevel).toBe(3);
        expect(typeof options.resultObtained).toBe('function');
        expect(typeof options.errorOccurred).toBe('function');
    });
});
