import { expect } from "@olton/latte";

import { DataColumn, DataColumnList, DataColumnDescriptor, ColumnAlignment, DataColumnStyle } from '../src/data/data_column';
import { DataType } from '../src/types/data_type';

describe('ColumnAlignment enum', () => {
    it('should contain correct values', () => {
        expect(ColumnAlignment.None).toBe(0);
        expect(ColumnAlignment.Left).toBe(1);
        expect(ColumnAlignment.Center).toBe(2);
        expect(ColumnAlignment.Right).toBe(3);
    });
});

describe('DataColumn', () => {
    it('should create a DataColumn based on minimal set of parameters', () => {
        const desc: DataColumnDescriptor = {
            id: 'test-id',
            label: 'Test Label'
        };

        const column = new DataColumn(desc);

        expect(column.id).toBe('test-id');
        expect(column.label).toBe('Test Label');
        expect(column.type).toBe(DataType.String);
        expect(column.isAggr).toBe(false);
        expect(column.style).toBeObject({});
        expect(column.description).toBeUndefined();
        expect(column.calculatedWidth).toBe(0);
    });

    it('should create a DataColumn with all parameters', () => {
        const style: DataColumnStyle = { 
            alignment: ColumnAlignment.Right 
        };
        
        const desc: DataColumnDescriptor = {
            id: 'test-id',
            label: 'Test Label',
            type: DataType.Int32,
            originAttrId: 'origin-attr-id',
            isAggr: true,
            dfmt: '#,###.00',
            gfct: 'Sum: ${value}',
            style: style,
            description: 'Test description'
        };

        const column = new DataColumn(desc);

        expect(column.id).toBe('test-id');
        expect(column.label).toBe('Test Label');
        expect(column.type).toBe(DataType.Int32);
        expect(column.originAttrId).toBe('origin-attr-id');
        expect(column.isAggr).toBe(true);
        expect(column.displayFormat).toBe('#,###.00');
        expect(column.groupFooterColumnTemplate).toBe('Sum: ${value}');
        expect(column.style).toBe(style);
        expect(column.description).toBe('Test description');
    });

    it('should throw an error when created without options', () => {
        expect(() => {
            // @ts-ignore - Intentionally passing invalid parameters for testing
            new DataColumn(null);
        }).toThrow("Options are required");
    });

    it('should throw an error when created without id', () => {
        expect(() => {
            const desc: DataColumnDescriptor = {
                // @ts-ignore - Intentionally omitting id for testing
                label: 'Test Label'
            };
            new DataColumn(desc);
        }).toThrow("Field Id is required");
    });

    it('should throw an error when created without label', () => {
        expect(() => {
            const desc: DataColumnDescriptor = {
                id: 'test-id',
                // @ts-ignore - Intentionally omitting label for testing
            };
            new DataColumn(desc);
        }).toThrow("Label is required");
    });
});

describe('DataColumnList', () => {
    let columnList: DataColumnList;

    beforeEach(() => {
        columnList = new DataColumnList();
    });

    it('should be empty after creation', () => {
        expect(columnList.count).toBe(0);
        expect(columnList.getItems()).toBeArray();
        expect(columnList.getItems()).toBeEmpty();
        expect(columnList.getDateColumnIndexes()).toBeArray();
        expect(columnList.getDateColumnIndexes()).toBeEmpty();
    });

    it('should add columns and return the index', () => {
        const desc: DataColumnDescriptor = {
            id: 'column1',
            label: 'Column 1'
        };

        const index = columnList.add(desc);
        
        expect(index).toBe(0);
        expect(columnList.count).toBe(1);
        expect(columnList.get(0).id).toBe('column1');
    });

    it('should add instances of DataColumn', () => {
        const column = new DataColumn({
            id: 'column1',
            label: 'Column 1'
        });

        const index = columnList.add(column);
        
        expect(index).toBe(0);
        expect(columnList.count).toBe(1);
        expect(columnList.get(0)).toBe(column);
    });

    it('should track date column indexes', () => {
        columnList.add({
            id: 'string-column',
            label: 'String Column',
            type: DataType.String
        });
        
        columnList.add({
            id: 'date-column',
            label: 'Date Column',
            type: DataType.Date
        });
        
        columnList.add({
            id: 'datetime-column',
            label: 'DateTime Column',
            type: DataType.DateTime
        });
        
        columnList.add({
            id: 'time-column',
            label: 'Time Column',
            type: DataType.Time
        });
        
        columnList.add({
            id: 'number-column',
            label: 'Number Column',
            type: DataType.Int32
        });

        const dateColumnIndexes = columnList.getDateColumnIndexes();
        
        expect(dateColumnIndexes).toBeArrayEqual([1, 2, 3]);
        expect(columnList.count).toBe(5);
    });

    it('should get a column by index', () => {
        columnList.add({
            id: 'column1',
            label: 'Column 1'
        });
        
        columnList.add({
            id: 'column2',
            label: 'Column 2'
        });

        const column = columnList.get(1);
        
        expect(column.id).toBe('column2');
        expect(column.label).toBe('Column 2');
    });

    it('should return null when getting a non-existent index', () => {
        columnList.add({
            id: 'column1',
            label: 'Column 1'
        });

        const columnNegative = columnList.get(-1);
        const columnOutOfRange = columnList.get(5);
        
        expect(columnNegative).toBeNull();
        expect(columnOutOfRange).toBeNull();
    });

    it('should return the index of a column by ID', () => {
        columnList.add({
            id: 'column1',
            label: 'Column 1'
        });
        
        columnList.add({
            id: 'column2',
            label: 'Column 2'
        });

        expect(columnList.getIndex('column1')).toBe(0);
        expect(columnList.getIndex('column2')).toBe(1);
        expect(columnList.getIndex('non-existent')).toBeUndefined();
    });

    it('should replace a column by index', () => {
        columnList.add({
            id: 'column1',
            label: 'Column 1'
        });
        
        const newColumn = new DataColumn({
            id: 'new-column',
            label: 'New Column'
        });
        
        columnList.put(0, newColumn);
        
        expect(columnList.count).toBe(1);
        expect(columnList.get(0)).toBe(newColumn);
    });

    it('should move a column to a new position', () => {
        const col1 = new DataColumn({
            id: 'column1',
            label: 'Column 1'
        });
        
        const col2 = new DataColumn({
            id: 'column2',
            label: 'Column 2'
        });
        
        const col3 = new DataColumn({
            id: 'column3',
            label: 'Column 3'
        });
        
        columnList.add(col1);
        columnList.add(col2);
        columnList.add(col3);
        
        columnList.move(col1, 2);
        
        expect(columnList.get(0)).toBe(col2);
        expect(columnList.get(1)).toBe(col3);
        expect(columnList.get(2)).toBe(col1);
    });

    it('should remove a column by index', () => {
        columnList.add({
            id: 'column1',
            label: 'Column 1'
        });
        
        columnList.add({
            id: 'column2',
            label: 'Column 2'
        });
        
        columnList.add({
            id: 'column3',
            label: 'Column 3'
        });
        
        columnList.removeAt(1);
        
        expect(columnList.count).toBe(2);
        expect(columnList.get(0).id).toBe('column1');
        expect(columnList.get(1).id).toBe('column3');
    });

    it('should remove date columns from indexes', () => {
        columnList.add({
            id: 'string-column',
            label: 'String Column',
            type: DataType.String
        });
        
        columnList.add({
            id: 'date-column',
            label: 'Date Column',
            type: DataType.Date
        });
        
        columnList.add({
            id: 'number-column',
            label: 'Number Column',
            type: DataType.Int32
        });
        
        expect(columnList.getDateColumnIndexes()).toBeArrayEqual([1]);
        
        columnList.removeAt(1);
        
        expect(columnList.getDateColumnIndexes()).toBeArrayEqual([]);
    });

    it('should clear the column list', () => {
        columnList.add({
            id: 'column1',
            label: 'Column 1'
        });
        
        columnList.add({
            id: 'date-column',
            label: 'Date Column',
            type: DataType.Date
        });
        
        expect(columnList.count).toBe(2);
        expect(columnList.getDateColumnIndexes().length).toBe(1);
        
        columnList.clear();
        
        expect(columnList.count).toBe(0);
        expect(columnList.getItems()).toBeArray();
        expect(columnList.getItems()).toBeEmpty();
        expect(columnList.getDateColumnIndexes()).toBeArray();
        expect(columnList.getDateColumnIndexes()).toBeEmpty();
    });
});
