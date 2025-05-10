import { expect } from "@olton/latte";

import { DataColumn, DataColumnList, DataColumnDescriptor, ColumnAlignment, DataColumnStyle } from '../src/data/data_column';
import { DataType } from '../src/types/data_type';

describe('ColumnAlignment enum', () => {
    it('должен содержать правильные значения', () => {
        expect(ColumnAlignment.None).toBe(0);
        expect(ColumnAlignment.Left).toBe(1);
        expect(ColumnAlignment.Center).toBe(2);
        expect(ColumnAlignment.Right).toBe(3);
    });
});

describe('DataColumn', () => {
    it('должен создаваться с минимальными параметрами', () => {
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

    it('должен создаваться со всеми параметрами', () => {
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

    it('должен выбрасывать ошибку при создании без опций', () => {
        expect(() => {
            // @ts-ignore - Намеренно передаем неверные параметры для теста
            new DataColumn(null);
        }).toThrow("Options are required");
    });

    it('должен выбрасывать ошибку при создании без id', () => {
        expect(() => {
            const desc: DataColumnDescriptor = {
                // @ts-ignore - Намеренно пропускаем id для теста
                label: 'Test Label'
            };
            new DataColumn(desc);
        }).toThrow("Field Id is required");
    });

    it('должен выбрасывать ошибку при создании без метки', () => {
        expect(() => {
            const desc: DataColumnDescriptor = {
                id: 'test-id',
                // @ts-ignore - Намеренно пропускаем label для теста
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

    it('должен быть пустым после создания', () => {
        expect(columnList.count).toBe(0);
        expect(columnList.getItems()).toBeArray();
        expect(columnList.getItems()).toBeEmpty();
        expect(columnList.getDateColumnIndexes()).toBeArray();
        expect(columnList.getDateColumnIndexes()).toBeEmpty();
    });

    it('должен добавлять столбцы и возвращать индекс', () => {
        const desc: DataColumnDescriptor = {
            id: 'column1',
            label: 'Column 1'
        };

        const index = columnList.add(desc);
        
        expect(index).toBe(0);
        expect(columnList.count).toBe(1);
        expect(columnList.get(0).id).toBe('column1');
    });

    it('должен добавлять экземпляры DataColumn', () => {
        const column = new DataColumn({
            id: 'column1',
            label: 'Column 1'
        });

        const index = columnList.add(column);
        
        expect(index).toBe(0);
        expect(columnList.count).toBe(1);
        expect(columnList.get(0)).toBe(column);
    });

    it('должен отслеживать индексы столбцов с датами', () => {
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

    it('должен получать столбец по индексу', () => {
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

    it('должен возвращать null при получении несуществующего индекса', () => {
        columnList.add({
            id: 'column1',
            label: 'Column 1'
        });

        const columnNegative = columnList.get(-1);
        const columnOutOfRange = columnList.get(5);
        
        expect(columnNegative).toBeNull();
        expect(columnOutOfRange).toBeNull();
    });

    it('должен получать индекс столбца по ID', () => {
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

    it('должен заменять столбец по индексу', () => {
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

    it('должен перемещать столбец на новую позицию', () => {
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

    it('должен удалять столбец по индексу', () => {
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

    it('должен удалять столбцы с датами из индексов', () => {
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

    it('должен очищать список столбцов', () => {
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
