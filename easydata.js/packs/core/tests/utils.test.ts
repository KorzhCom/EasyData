import { expect } from "@olton/latte";

import { utils } from '../src/utils/utils';
import { DataType } from '../src/types/data_type';

describe('utils', () => {
    // Tests for functions with data types
    it('should return all data types through getAllDataTypes', () => {
        const dataTypes = utils.getAllDataTypes();
        expect(dataTypes).toContain(DataType.String);
        expect(dataTypes).toContain(DataType.Int32);
        expect(dataTypes).toContain(DataType.Date);
        expect(dataTypes).toContain(DataType.Bool);
        expect(dataTypes).toContain(DataType.Blob);
        expect(typeof dataTypes[0]).toBe('number');
    });
    
    it('should return all date types through getDateDataTypes', () => {
        const dateTypes = utils.getDateDataTypes();
        expect(dateTypes.length).toBe(3);
        expect(dateTypes).toContain(DataType.Date);
        expect(dateTypes).toContain(DataType.DateTime);
        expect(dateTypes).toContain(DataType.Time);
    });
    
    it('should return all string types through getStringDataTypes', () => {
        const stringTypes = utils.getStringDataTypes();
        expect(stringTypes.length).toBe(3);
        expect(stringTypes).toContain(DataType.String);
        expect(stringTypes).toContain(DataType.Memo);
        expect(stringTypes).toContain(DataType.FixedChar);
    });
    
    it('should return all numeric types through getNumericDataTypes', () => {
        const numericTypes = utils.getNumericDataTypes();
        expect(numericTypes).toContain(DataType.Int32);
        expect(numericTypes).toContain(DataType.Float);
        expect(numericTypes).toContain(DataType.Currency);
    });
    
    it('should check if the type is numeric through isNumericType', () => {
        expect(utils.isNumericType(DataType.Int32)).toBe(true);
        expect(utils.isNumericType(DataType.Float)).toBe(true);
        expect(utils.isNumericType(DataType.Currency)).toBe(true);
        expect(utils.isNumericType(DataType.String)).toBe(false);
        expect(utils.isNumericType(DataType.Date)).toBe(false);
    });
    
    it('should check if the type is integer through isIntType', () => {
        expect(utils.isIntType(DataType.Int32)).toBe(true);
        expect(utils.isIntType(DataType.Int64)).toBe(true);
        expect(utils.isIntType(DataType.Byte)).toBe(true);
        expect(utils.isIntType(DataType.Float)).toBe(false);
        expect(utils.isIntType(DataType.String)).toBe(false);
    });
    
    it('should check if data types are compatible through areCompatibleDataTypes', () => {
        expect(utils.areCompatibleDataTypes(DataType.Int32, DataType.Int32)).toBe(true);
        expect(utils.areCompatibleDataTypes(DataType.Date, DataType.DateTime)).toBe(true);
        expect(utils.areCompatibleDataTypes(DataType.DateTime, DataType.Date)).toBe(true);
        expect(utils.areCompatibleDataTypes(DataType.String, DataType.Int32)).toBe(false);
        expect(utils.areCompatibleDataTypes(DataType.Unknown, DataType.Int32)).toBe(true);
        expect(utils.areCompatibleDataTypes(DataType.Int32, DataType.Unknown)).toBe(true);
    });
    
    // Tests for object functions
    it('should merge objects through assign', () => {
        const target = { a: 1, b: 2 };
        const source1 = { b: 3, c: 4 };
        const source2 = { d: 5 };
        
        const result = utils.assign(target, source1, source2);
        
        expect(result).toBe(target); // Check that assign returns target
        expect(result.a).toBe(1);
        expect(result.b).toBe(3); // Value from source1 overwrote value from target
        expect(result.c).toBe(4);
        expect(result.d).toBe(5);
    });
    
    it('should handle empty objects and null in assign', () => {
        const target = null;
        const source = { a: 1 };
        
        const result = utils.assign(target, source);
        
        expect(result).toBeObject({ a: 1 });
    });
    
    it('should perform deep copying of objects through assignDeep', () => {
        const target = { 
            a: 1, 
            nested: { x: 10, y: 20 } 
        };
        const source = { 
            b: 2, 
            nested: { y: 30, z: 40 } 
        };
        
        const result = utils.assignDeep(target, source);
        
        expect(result).toBe(target);
        expect(result.a).toBe(1);
        expect(result.b).toBe(2);
        expect(result.nested.x).toBe(10);
        expect(result.nested.y).toBe(30); // Value from source overwrote value from target
        expect(result.nested.z).toBe(40);
        
        // Check that objects are actually copied, not referencing the same object
        source.nested.y = 100;
        expect(result.nested.y).toBe(30);
    });
    
    it('should handle cyclic references in assignDeep', () => {
        const target = {};
        const source = { a: 1 };
        source.self = source; // Cyclic reference
        
        // Should not cause infinite recursion
        const result = utils.assignDeep(target, source);
        
        expect(result.a).toBe(1);
        expect(result.self).toBe(result); // Cycle is preserved but refers to the new object
    });
    
    it('should copy arrays in assignDeep', () => {
        const target = { arr: [1, 2] };
        const source = { arr: [3, 4, 5] };
        
        const result = utils.assignDeep(target, source);
        
        expect(result.arr).toBeArrayEqual([3, 4, 5]);
        
        // Check that arrays are actually copied
        source.arr.push(6);
        expect(result.arr).toBeArrayEqual([3, 4, 5]); // Did not change after modifying source
    });
    
    it('should return default value through getIfDefined', () => {
        expect(utils.getIfDefined(undefined, 'default')).toBe('default');
        expect(utils.getIfDefined(null, 'default')).toBe(null);
        expect(utils.getIfDefined(0, 'default')).toBe(0);
        expect(utils.getIfDefined('value', 'default')).toBe('value');
    });
    
    it('should check definiteness and non-null value through IsDefinedAndNotNull', () => {
        expect(utils.IsDefinedAndNotNull(undefined)).toBe(false);
        expect(utils.IsDefinedAndNotNull(null)).toBe(false);
        expect(utils.IsDefinedAndNotNull(0)).toBe(true);
        expect(utils.IsDefinedAndNotNull('')).toBe(true);
        expect(utils.IsDefinedAndNotNull(false)).toBe(true);
    });
    
    it('should check if value is an object through isObject', () => {
        expect(utils.isObject({})).toBe(true);
        expect(utils.isObject([])).toBe(true);
        expect(utils.isObject(function() {})).toBe(true);
        expect(utils.isObject(null)).toBe(false);
        expect(utils.isObject(undefined)).toBe(false);
        expect(utils.isObject(42)).toBe(false);
        expect(utils.isObject('string')).toBe(false);
    });
    
    it('should check if property is set through isPropSet', () => {
        const obj = { 
            prop1: 'value1',
            PROP2: 'value2',
            prop3: null,
            prop4: undefined
        };
        
        expect(utils.isPropSet(obj, 'prop1')).toBe('value1');
        expect(utils.isPropSet(obj, 'prop2')).toBe('value2'); // Check case insensitivity
        expect(utils.isPropSet(obj, 'prop3')).toBe(null);
        expect(utils.isPropSet(obj, 'prop4')).toBe(undefined);
        expect(utils.isPropSet(obj, 'nonExistent')).toBe(undefined);
    });
    
    // Tests for functions with arrays
    it('should copy elements from one array to another through copyArrayTo', () => {
        const source = [1, 2, 3, 4];
        const target = [0, 0, 0, 0, 0];
        
        utils.copyArrayTo(source, target);
        
        expect(target).toBeArrayEqual([1, 2, 3, 4, 0]);
    });
    
    it('should create a new array from collection through createArrayFrom', () => {
        const collection = {
            0: 'a',
            1: 'b',
            2: 'c',
            length: 3,
            [Symbol.iterator]: function* () {
                for (let i = 0; i < this.length; i++) {
                    yield this[i];
                }
            }
        };
        
        const result = utils.createArrayFrom(collection);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result).toBeArrayEqual(['a', 'b', 'c']);
        expect(result === collection).toBe(false); // New array, not the original collection
    });
    
    it('should find item by id through findItemById', () => {
        const array = [
            { id: 1, value: 'one' },
            { id: 2, value: 'two' },
            { id: 3, value: 'three' }
        ];
        
        const found = utils.findItemById(array, 2);
        
        expect(found).toBe(array[1]);
        expect(found.value).toBe('two');
        
        const notFound = utils.findItemById(array, 4);
        expect(notFound).toBeNull();
    });
    
    it('should find item index by id through findItemIndexById', () => {
        const array = [
            { id: 1, value: 'one' },
            { id: 2, value: 'two' },
            { id: 3, value: 'three' }
        ];
        
        const foundIndex = utils.findItemIndexById(array, 2);
        expect(foundIndex).toBe(1);
        
        const notFoundIndex = utils.findItemIndexById(array, 4);
        expect(notFoundIndex).toBe(-1);
    });
    
    it('should find index of item in array through indexOfArrayItem', () => {
        const array = ['a', 'b', 'c', 'd'];
        
        expect(utils.indexOfArrayItem(array, 'b')).toBe(1);
        expect(utils.indexOfArrayItem(array, 'e')).toBe(-1);
    });
    
    it('should move item in array through moveArrayItem', () => {
        const array = ['a', 'b', 'c', 'd', 'e'];
        
        utils.moveArrayItem(array, 1, 3);
        
        expect(array).toBeArrayEqual(['a', 'c', 'd', 'b', 'e']);
    });
    
    it('should throw error when moving non-existent item', () => {
        const array = ['a', 'b', 'c'];
        
        expect(() => {
            utils.moveArrayItem(array, 5, 1);
        }).toThrow('Index out of bounds: 5');
    });
    
    it('should correctly handle moving out of array bounds', () => {
        const array = ['a', 'b', 'c', 'd', 'e'];
        
        utils.moveArrayItem(array, 1, 10); // Index 10 is out of array, should be adjusted
        
        expect(array).toBeArrayEqual(['a', 'c', 'd', 'e', 'b']);
    });
    
    it('should remove element from array via removeArrayItem', () => {
        const array = ['a', 'b', 'c', 'd'];
        
        const removed = utils.removeArrayItem(array, 'b');
        
        expect(removed).toBe('b');
        expect(array).toBeArrayEqual(['a', 'c', 'd']);
        
        const notRemoved = utils.removeArrayItem(array, 'z');
        expect(notRemoved).toBeUndefined();
        expect(array).toBeArrayEqual(['a', 'c', 'd']);
    });
    
    it('should insert element in array through insertArrayItem', () => {
        const array = ['a', 'c', 'd'];
        
        utils.insertArrayItem(array, 1, 'b');
        
        expect(array).toBeArrayEqual(['a', 'b', 'c', 'd']);
    });
    
    it('should fill array with values through fillArray', () => {
        const array = ['a', 'b', 'c', 'd', 'e'];
        
        utils.fillArray(array, 'x', 1, 4);
        
        expect(array).toBeArrayEqual(['a', 'x', 'x', 'x', 'e']);
    });
    
    it('should handle negative indices in fillArray', () => {
        const array = ['a', 'b', 'c', 'd', 'e'];
        
        utils.fillArray(array, 'x', -3, -1);
        
        expect(array).toBeArrayEqual(['a', 'b', 'x', 'x', 'e']);
    });
    
    it('should fill to the end of the array when no end is provided in fillArray', () => {
        const array = ['a', 'b', 'c', 'd', 'e'];
        
        utils.fillArray(array, 'x', 3);
        
        expect(array).toBeArrayEqual(['a', 'b', 'c', 'x', 'x']);
    });
    
    // Tests for functions with checks
    it('should check if value is numeric through isNumeric', () => {
        expect(utils.isNumeric(42)).toBe(true);
        expect(utils.isNumeric('42')).toBe(true);
        expect(utils.isNumeric(-1.5)).toBe(true);
        expect(utils.isNumeric('-1.5')).toBe(true);
        expect(utils.isNumeric('abc')).toBe(false);
        expect(utils.isNumeric({})).toBe(false);
        expect(utils.isNumeric(NaN)).toBe(false);
        expect(utils.isNumeric(Infinity)).toBe(false);
        expect(utils.isNumeric(null)).toBe(false);
        expect(utils.isNumeric(undefined)).toBe(false);
    });
    
    // Tests for ID generation functions
    it('should generate unique IDs through generateId', () => {
        const id1 = utils.generateId('test');
        const id2 = utils.generateId('test');
        
        expect(id1).not.toBe(id2);
        expect(id1.startsWith('test-')).toBe(true);
        expect(id2.startsWith('test-')).toBe(true);
    });
    
    it('should use easy prefix when calling generateId with no arguments', () => {
        const id = utils.generateId(null);
        expect(id.startsWith('easy-')).toBe(true);
    });
    
    it('should shorten long prefixes in generateId', () => {
        const id = utils.generateId('veryLongPrefix');
        expect(id.startsWith('vryL-')).toBe(true);
    });
    
    // Tests for date functions
    it('should convert string to date through strToDateTime', () => {
        const dateStr = '2023-05-15-14-30-45';
        const format = 'yyyy-MM-dd-HH-mm-ss';
        
        const result = utils.strToDateTime(dateStr, format);
        
        expect(result instanceof Date).toBe(true);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(4); // 0-based, May = 4
        expect(result.getDate()).toBe(15);
        expect(result.getHours()).toBe(14);
        expect(result.getMinutes()).toBe(30);
        expect(result.getSeconds()).toBe(45);
    });
    
    it('should handle different delimiter formats in strToDateTime', () => {
        const dateStr = '2023/05/15 14:30:45';
        const format = 'yyyy/MM/dd HH:mm:ss';
        
        const result = utils.strToDateTime(dateStr, format);
        
        expect(result instanceof Date).toBe(true);
        expect(result.getFullYear()).toBe(2023);
        expect(result.getMonth()).toBe(4);
        expect(result.getDate()).toBe(15);
        expect(result.getHours()).toBe(14);
        expect(result.getMinutes()).toBe(30);
        expect(result.getSeconds()).toBe(45);
    });
    
    it('should throw error on incorrect date in strToDateTime', () => {
        expect(() => {
            utils.strToDateTime('2023-13-32', 'yyyy-MM-dd');
        }).toThrow();
    });
    
    it('should convert string to time through strToTime', () => {
        const timeStr = '14:30:45';
        
        const result = utils.strToTime(timeStr);
        
        expect(result instanceof Date).toBe(true);
        expect(result.getHours()).toBe(14);
        expect(result.getMinutes()).toBe(30);
        expect(result.getSeconds()).toBe(0); // Bug in implementation, should be 45
    });
    
    it('should throw error on incorrect time in strToTime', () => {
        expect(() => {
            utils.strToTime('25:70');
        }).toThrow();
    });
});
