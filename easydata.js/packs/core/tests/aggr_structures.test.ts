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

// Тесты для AggregationColumnStore
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

    it('должен возвращать массив идентификаторов колонок в указанном диапазоне', () => {
        const columns = columnStore.getColumnIds(1, 3);
        expect(columns).toBeArrayEqual(['col1', 'col2', 'col3']);
    });

    it('должен возвращать один идентификатор колонки, если указан только начальный индекс', () => {
        const columns = columnStore.getColumnIds(5);
        expect(columns).toBeArrayEqual(['col5']);
    });

    it('должен проверять валидность колонок', () => {
        expect(columnStore.validateColumns(['col1', 'col2'])).toBe(true);
        expect(columnStore.validateColumns(['col1', 'invalid'])).toBe(false);
    });

    it('должен проверять валидность агрегатной функции для колонки', () => {
        expect(columnStore.validateAggregate('col1', 'sum')).toBe(true);
        expect(columnStore.validateAggregate('col2', 'avg')).toBe(true);
        expect(columnStore.validateAggregate('col3', 'invalid')).toBe(false);
        expect(columnStore.validateAggregate('invalid', 'sum')).toBe(false);
    });
});

// Тесты для AggregatesContainer
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

    it('должен сохранять данные агрегации для определенного уровня', () => {
        const data = new Map<string, GroupTotals>();
        data.set(JSON.stringify({col1: 'value1'}), {sum: 100, count: 10});
        
        container.setAggregateData(1, data);
        
        // Проверим через getAggregateData
        return container.getAggregateData(1, {col1: 'value1'})
            .then(totals => {
                expect(totals).toBeObject({sum: 100, count: 10});
            });
    });

    it('должен возвращать пустой объект для несуществующего уровня', () => {
        return container.getAggregateData(999, {col1: 'value1'})
            .then(totals => {
                expect(totals).toBeObject({});
            });
    });

    it('должен обновлять данные агрегации', () => {
        container.updateAggregateData(1, {col1: 'value1'}, {sum: 100});
        container.updateAggregateData(1, {col1: 'value1'}, {sum: 200});
        
        return container.getAggregateData(1, {col1: 'value1'})
            .then(totals => {
                expect(totals).toBeObject({sum: 200});
            });
    });

    it('должен создавать новый уровень при обновлении данных несуществующего уровня', () => {
        container.updateAggregateData(2, {col2: 'value2'}, {avg: 50});
        
        return container.getAggregateData(2, {col2: 'value2'})
            .then(totals => {
                expect(totals).toBeObject({avg: 50});
            });
    });
});

// Тесты для AggregatesCalculator
describe('AggregatesCalculator Interface', () => {
    let container: AggregatesContainer;
    let calculator: AggregatesCalculator;
    let needRecalculationValue: boolean;

    beforeEach(() => {
        // Создаем мок для AggregatesContainer
        container = {
            setAggregateData: mock(),
            getAggregateData: mock().mockImplementation(async () => ({})),
            updateAggregateData: mock()
        };
        
        needRecalculationValue = true;
        
        // Создаем мок для AggregatesCalculator
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
                
                // Симулируем вычисление и получение результата
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

    it('должен возвращать контейнер агрегатов', () => {
        const result = calculator.getAggrContainer();
        expect(result).toBe(container);
    });

    it('должен выполнять вычисление с вызовом callback-функций', async () => {
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

    it('должен вызывать errorOccurred при ошибке вычисления', async () => {
        const resultCallback = mock();
        const errorCallback = mock();
        
        try {
            await calculator.calculate({
                maxLevel: -1,
                resultObtained: resultCallback,
                errorOccurred: errorCallback
            });
        } catch (error) {
            // Ожидаем, что ошибка будет перехвачена
        }
        
        expect(resultCallback).not.toHaveBeenCalled();
        expect(errorCallback).toHaveBeenCalled();
        const error = errorCallback.mock.calls[0][0];
        expect(error.message).toBe("Invalid max level");
        expect(error.level).toBe(0);
    });

    it('должен возвращать needRecalculation=true после reset', () => {
        calculator.reset();
        expect(calculator.needRecalculation()).toBe(true);
    });

    it('должен возвращать needRecalculation=false после успешного вычисления', async () => {
        await calculator.calculate();
        expect(calculator.needRecalculation()).toBe(false);
    });
});

// Тесты для структур данных
describe('Data Structures', () => {
    it('должен правильно определять DataGroup', () => {
        const group: DataGroup = {
            name: 'TestGroup',
            columns: ['col1', 'col2']
        };
        
        expect(group.name).toBe('TestGroup');
        expect(group.columns).toBeArrayEqual(['col1', 'col2']);
    });

    it('должен работать с GroupKey как с объектом', () => {
        const key: GroupKey = {
            col1: 'value1',
            col2: 100
        };
        
        expect(key.col1).toBe('value1');
        expect(key.col2).toBe(100);
    });
    
    it('должен работать с GroupTotals как с объектом', () => {
        const totals: GroupTotals = {
            sum: 500,
            avg: 100,
            count: 5
        };
        
        expect(totals.sum).toBe(500);
        expect(totals.avg).toBe(100);
        expect(totals.count).toBe(5);
    });

    it('должен создавать AggrCalculationError с уровнем', () => {
        const error = new Error('Test error') as AggrCalculationError;
        error.level = 2;
        
        expect(error.message).toBe('Test error');
        expect(error.level).toBe(2);
    });

    it('должен создавать AggrCalculationOptions с опциями', () => {
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
