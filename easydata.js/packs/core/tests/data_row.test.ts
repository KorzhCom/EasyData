import {expect} from "@olton/latte";

import { DataRow } from '../src/data/data_row';
import { DataColumn, DataColumnList } from '../src/data/data_column';
import { thrown } from './helpers/errors';

describe('DataRow', () => {
    let columnList: DataColumnList;

    beforeEach(() => {
        columnList = new DataColumnList();
        columnList.add({ id: 'id', label: 'ID' });
        columnList.add({ id: 'name', label: 'Name' });
        columnList.add({ id: 'age', label: 'Age' });
        columnList.add({ id: 'active', label: 'Active' });
    });

    it('should be created with columns and values', () => {
        const values = [1, 'John', 30, true];
        const row = new DataRow(columnList, values);

        expect(row).toBeDefined();
        expect(row.size()).toBe(4);
    });

    it('should return row size', () => {
        const values = [1, 'John', 30, true];
        const row = new DataRow(columnList, values);

        expect(row.size()).toBe(4);
    });

    it('should return copy of values array', () => {
        const values = [1, 'John', 30, true];
        const row = new DataRow(columnList, values);

        const result = row.toArray();

        expect(result).toBeArrayEqual(values);
        expect(result).not.toBe(values); // Should be new array, not reference to the same one
    });

    it('should get value by index', () => {
        const values = [1, 'John', 30, true];
        const row = new DataRow(columnList, values);

        expect(row.getValue(0)).toBe(1);
        expect(row.getValue(1)).toBe('John');
        expect(row.getValue(2)).toBe(30);
        expect(row.getValue(3)).toBe(true);
    });

    it('should get value by column ID', () => {
        const values = [1, 'John', 30, true];
        const row = new DataRow(columnList, values);

        expect(row.getValue('id')).toBe(1);
        expect(row.getValue('name')).toBe('John');
        expect(row.getValue('age')).toBe(30);
        expect(row.getValue('active')).toBe(true);
    });

    it('should set value by index', () => {
        const values = [1, 'John', 30, true];
        const row = new DataRow(columnList, values);

        row.setValue(0, 2);
        row.setValue(1, 'Jane');
        row.setValue(2, 25);
        row.setValue(3, false);

        expect(row.getValue(0)).toBe(2);
        expect(row.getValue(1)).toBe('Jane');
        expect(row.getValue(2)).toBe(25);
        expect(row.getValue(3)).toBe(false);
    });

    it('should set value by column ID', () => {
        const values = [1, 'John', 30, true];
        const row = new DataRow(columnList, values);

        row.setValue('id', 2);
        row.setValue('name', 'Jane');
        row.setValue('age', 25);
        row.setValue('active', false);

        expect(row.getValue('id')).toBe(2);
        expect(row.getValue('name')).toBe('Jane');
        expect(row.getValue('age')).toBe(25);
        expect(row.getValue('active')).toBe(false);
    });

    it('should throw error when getting value by non-existent column ID', () => {
        const values = [1, 'John', 30, true];
        const row = new DataRow(columnList, values);

        const error = thrown(() => {
            row.getValue('nonExistentId');
        });
        expect(error).toBeInstanceOf(RangeError);
        expect(error.message).toBe("No column with id 'nonExistentId'");
    });

    it('should throw error when getting value by index out of range', () => {
        const values = [1, 'John', 30, true];
        const row = new DataRow(columnList, values);

        const error = thrown(() => {
            row.getValue(4);
        });
        expect(error).toBeInstanceOf(RangeError);
        expect(error.message).toBe("Out of range: 4");
    });

    it('should throw error when setting value by non-existent column ID', () => {
        const values = [1, 'John', 30, true];
        const row = new DataRow(columnList, values);

        const error = thrown(() => {
            row.setValue('nonExistentId', 'value');
        });
        expect(error).toBeInstanceOf(RangeError);
        expect(error.message).toBe("No column with id 'nonExistentId'");
    });

    it('should throw error when setting value by index out of range', () => {
        const values = [1, 'John', 30, true];
        const row = new DataRow(columnList, values);

        const error = thrown(() => {
            row.setValue(4, 'value');
        });
        expect(error).toBeInstanceOf(RangeError);
        expect(error.message).toBe("Out of range: 4");
    });

    it('should work with empty values array', () => {
        const emptyValues: any[] = [];
        const row = new DataRow(columnList, emptyValues);

        expect(row.size()).toBe(0);
        expect(row.toArray()).toBeArray();
        expect(row.toArray()).toBeEmpty();

        expect(thrown(() => {
            row.getValue(0);
        })).toBeInstanceOf(RangeError);
    });
});
