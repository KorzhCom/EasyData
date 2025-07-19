import { 
    AggregationSettings, 
    AggregationSettingsData 
} from '../src/data/aggr_settings';
import { AggregationColumnStore, DataGroup, GroupDescriptor } from '../src/data/aggr_structures';
import { DataRow } from '../src/data/data_row';

describe('AggregationSettings', () => {
    let columnStore: AggregationColumnStore;
    let settings: AggregationSettings;

    beforeEach(() => {
        // Creating a mock for AggregationColumnStore
        columnStore = mock<AggregationColumnStore>({
            getColumnIds: (from, to) => {
                const result = [];
                for (let i = from; i <= to; i++) {
                    result.push(`col${i}`);
                }
                return result;
            },
            validateColumns: (columns) => {
                // Simple check - all columns must start with 'col'
                return columns.every(col => typeof col === 'string' && col.startsWith('col'));
            },
            validateAggregate: (colId, funcId) => {
                // Check - valid functions: 'sum', 'avg', 'min', 'max', 'count'
                const validFuncs = ['sum', 'avg', 'min', 'max', 'count'];
                return typeof colId === 'string' && 
                       colId.startsWith('col') && 
                       validFuncs.includes(funcId);
            }
        });

        settings = new AggregationSettings(columnStore);
    });

    it('should create instance with default values', () => {
        expect(settings.COUNT_FIELD_NAME).toBe('GRPRECCNT');
        expect(settings.groups).toBeArray();
        expect(settings.groups).toBeEmpty();
        expect(settings.caseSensitiveGroups).toBe(false);
        expect(settings.isEmpty()).toBe(true);
        expect(settings.isValid()).toBe(false);
    });

    it('should add group correctly', () => {
        const groupDescriptor: GroupDescriptor = {
            columns: ['col1', 'col2'],
            title: 'Test Group'
        };

        settings.addGroup(groupDescriptor);

        expect(settings.hasGroups()).toBe(true);
        expect(settings.isEmpty()).toBe(false);
        expect(settings.getInternalGroups().length).toBe(1);
        expect(settings.getInternalGroups()[0].columns).toBeArrayEqual(['col1', 'col2']);
    });

    it('should add group using from-to range', () => {
        const groupDescriptor: GroupDescriptor = {
            from: 1,
            to: 3,
            title: 'Test Group'
        };

        settings.addGroup(groupDescriptor);

        expect(settings.hasGroups()).toBe(true);
        expect(settings.getInternalGroups()[0].columns).toBeArrayEqual(['col1', 'col2', 'col3']);
    });

    it('should throw error when adding invalid columns to group', () => {
        const groupDescriptor: GroupDescriptor = {
            columns: ['invalid1', 'invalid2'],
            title: 'Invalid Group'
        };

        expect(() => {
            settings.addGroup(groupDescriptor);
        }).toThrow("Invalid columns");
    });

    it('should add aggregate column correctly', () => {
        settings.addAggregateColumn('col4', 'sum');

        expect(settings.hasAggregates()).toBe(true);
        expect(settings.getAggregates().length).toBe(1);
        expect(settings.getAggregates()[0].colId).toBe('col4');
        expect(settings.getAggregates()[0].funcId).toBe('sum');
    });

    it('should throw error when adding invalid aggregate function', () => {
        expect(() => {
            settings.addAggregateColumn('col5', 'invalid_func');
        }).toThrow('Invalid aggregation function');
    });

    it('should throw error when adding same column to different groups', () => {
        settings.addGroup({ columns: ['col1', 'col2'] });

        expect(() => {
            settings.addGroup({ columns: ['col2', 'col3'] });
        }).toThrow("Can't add same columns to different groups/aggregates");
    });

    it('should throw error when adding column to both group and aggregate', () => {
        settings.addGroup({ columns: ['col1', 'col2'] });

        expect(() => {
            settings.addAggregateColumn('col1', 'sum');
        }).toThrow("Can't add same columns to different groups/aggregates");
    });

    it('should add grand totals correctly', () => {
        settings.addGrandTotals();

        expect(settings.hasGrandTotals()).toBe(true);
    });

    it('should add counts correctly', () => {
        settings.addCounts();

        expect(settings.hasRecordCount()).toBe(true);
    });

    it('should check if settings are valid', () => {
        // Non-existent groups and aggregates -> invalid
        expect(settings.isValid()).toBe(false);

        // Only groups -> invalid
        settings.addGroup({ columns: ['col1'] });
        expect(settings.isValid()).toBe(false);

        // Groups and aggregates -> valid
        settings.addAggregateColumn('col2', 'sum');
        expect(settings.isValid()).toBe(true);

        // Only aggregates and totals -> valid
        settings.clear();
        settings.addAggregateColumn('col1', 'sum');
        settings.addGrandTotals();
        expect(settings.isValid()).toBe(true);
    });

    it('should clear all settings', () => {
        settings.addGroup({ columns: ['col1'] });
        settings.addAggregateColumn('col2', 'sum');
        settings.addGrandTotals();
        settings.addCounts();

        settings.clear();

        expect(settings.isEmpty()).toBe(true);
        expect(settings.hasGroups()).toBe(false);
        expect(settings.hasAggregates()).toBe(false);
        expect(settings.hasGrandTotals()).toBe(false);
        expect(settings.hasRecordCount()).toBe(false);
    });

    it('should save settings to data and load them back', () => {
        settings.addGroup({ columns: ['col1', 'col2'], title: 'Group 1' });
        settings.addAggregateColumn('col3', 'sum');
        settings.addGrandTotals();
        settings.addCounts();
        settings.caseSensitiveGroups = true;

        const data = settings.saveToData();
        
        const newSettings = new AggregationSettings(columnStore);
        newSettings.loadFromData(data);

        expect(newSettings.hasGroups()).toBe(true);
        expect(newSettings.hasAggregates()).toBe(true);
        expect(newSettings.hasGrandTotals()).toBe(true);
        expect(newSettings.hasRecordCount()).toBe(true);
        expect(newSettings.caseSensitiveGroups).toBe(true);
        expect(newSettings.getInternalGroups()[0].columns).toBeArrayEqual(['col1', 'col2']);
    });

    it('should build group key correctly', () => {
        const group: DataGroup = { columns: ['col1', 'col2'] };
        const row = mock<DataRow>({
            getValue: (colId) => {
                if (colId === 'col1') return 'Value1';
                if (colId === 'col2') return 'Value2';
                return null;
            }
        });

        const key = settings.buildGroupKey(group, row);
        
        expect(key).toBeObject({ col1: 'value1', col2: 'value2' });
    });

    it('should build group key with case sensitivity', () => {
        const group: DataGroup = { columns: ['col1', 'col2'] };
        const row = mock<DataRow>({
            getValue: (colId) => {
                if (colId === 'col1') return 'Value1';
                if (colId === 'col2') return 'Value2';
                return null;
            }
        });

        settings.caseSensitiveGroups = true;
        const key = settings.buildGroupKey(group, row);
        
        expect(key).toBeObject({ col1: 'Value1', col2: 'Value2' });
    });

    it('should compare values with case sensitivity', () => {
        settings.caseSensitiveGroups = true;
        
        expect(settings.compareValues('Test', 'Test')).toBe(true);
        expect(settings.compareValues('Test', 'test')).toBe(false);
        expect(settings.compareValues(123, 123)).toBe(true);
        expect(settings.compareValues(123, 456)).toBe(false);
        
        const date1 = new Date(2023, 5, 15);
        const date2 = new Date(2023, 5, 15);
        const date3 = new Date(2023, 5, 16);
        
        expect(settings.compareValues(date1, date2)).toBe(true);
        expect(settings.compareValues(date1, date3)).toBe(false);
    });

    it('should compare values without case sensitivity', () => {
        settings.caseSensitiveGroups = false;
        
        expect(settings.compareValues('Test', 'test')).toBe(true);
        expect(settings.compareValues('Test', 'TEST')).toBe(true);
        expect(settings.compareValues('Test', 'Different')).toBe(false);
    });

    it('should get correct groups hierarchy', () => {
        settings.addGroup({ columns: ['col1'] });
        settings.addGroup({ columns: ['col2'] });
        
        const groups = settings.getGroups();
        
        expect(groups.length).toBe(2);
        expect(groups[0].columns).toBeArrayEqual(['col1']);
        expect(groups[1].columns).toBeArrayEqual(['col1', 'col2']);
    });
});
