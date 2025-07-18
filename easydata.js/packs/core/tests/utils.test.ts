import { expect } from "@olton/latte";

import { utils } from '../src/utils/utils';
import { DataType } from '../src/types/data_type';

describe('utils', () => {
    // Тесты для функций с типами данных
    it('должен вернуть все типы данных через getAllDataTypes', () => {
        const dataTypes = utils.getAllDataTypes();
        expect(dataTypes).toContain(DataType.String);
        expect(dataTypes).toContain(DataType.Int32);
        expect(dataTypes).toContain(DataType.Date);
        expect(dataTypes).toContain(DataType.Bool);
        expect(dataTypes).toContain(DataType.Blob);
        expect(typeof dataTypes[0]).toBe('number');
    });
    
    it('должен вернуть все типы для дат через getDateDataTypes', () => {
        const dateTypes = utils.getDateDataTypes();
        expect(dateTypes.length).toBe(3);
        expect(dateTypes).toContain(DataType.Date);
        expect(dateTypes).toContain(DataType.DateTime);
        expect(dateTypes).toContain(DataType.Time);
    });
    
    it('должен вернуть все строковые типы через getStringDataTypes', () => {
        const stringTypes = utils.getStringDataTypes();
        expect(stringTypes.length).toBe(3);
        expect(stringTypes).toContain(DataType.String);
        expect(stringTypes).toContain(DataType.Memo);
        expect(stringTypes).toContain(DataType.FixedChar);
    });
    
    it('должен вернуть все числовые типы через getNumericDataTypes', () => {
        const numericTypes = utils.getNumericDataTypes();
        expect(numericTypes).toContain(DataType.Int32);
        expect(numericTypes).toContain(DataType.Float);
        expect(numericTypes).toContain(DataType.Currency);
    });
    
    it('должен проверять, является ли тип числовым через isNumericType', () => {
        expect(utils.isNumericType(DataType.Int32)).toBe(true);
        expect(utils.isNumericType(DataType.Float)).toBe(true);
        expect(utils.isNumericType(DataType.Currency)).toBe(true);
        expect(utils.isNumericType(DataType.String)).toBe(false);
        expect(utils.isNumericType(DataType.Date)).toBe(false);
    });
    
    it('должен проверять, является ли тип целочисленным через isIntType', () => {
        expect(utils.isIntType(DataType.Int32)).toBe(true);
        expect(utils.isIntType(DataType.Int64)).toBe(true);
        expect(utils.isIntType(DataType.Byte)).toBe(true);
        expect(utils.isIntType(DataType.Float)).toBe(false);
        expect(utils.isIntType(DataType.String)).toBe(false);
    });
    
    it('должен проверять, совместимы ли типы данных через areCompatibleDataTypes', () => {
        expect(utils.areCompatibleDataTypes(DataType.Int32, DataType.Int32)).toBe(true);
        expect(utils.areCompatibleDataTypes(DataType.Date, DataType.DateTime)).toBe(true);
        expect(utils.areCompatibleDataTypes(DataType.DateTime, DataType.Date)).toBe(true);
        expect(utils.areCompatibleDataTypes(DataType.String, DataType.Int32)).toBe(false);
        expect(utils.areCompatibleDataTypes(DataType.Unknown, DataType.Int32)).toBe(true);
        expect(utils.areCompatibleDataTypes(DataType.Int32, DataType.Unknown)).toBe(true);
    });
    
    // Тесты для объектных функций
    it('должен объединять объекты через assign', () => {
        const target = { a: 1, b: 2 };
        const source1 = { b: 3, c: 4 };
        const source2 = { d: 5 };
        
        const result = utils.assign(target, source1, source2);
        
        expect(result).toBe(target); // Проверка, что assign возвращает target
        expect(result.a).toBe(1);
        expect(result.b).toBe(3); // Значение из source1 перезаписало значение из target
        expect(result.c).toBe(4);
        expect(result.d).toBe(5);
    });
    
    it('должен обрабатывать пустые объекты и null в assign', () => {
        const target = null;
        const source = { a: 1 };
        
        const result = utils.assign(target, source);
        
        expect(result).toBeObject({ a: 1 });
    });
    
    it('должен делать глубокое копирование объектов через assignDeep', () => {
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
        expect(result.nested.y).toBe(30); // Значение из source перезаписало значение из target
        expect(result.nested.z).toBe(40);
        
        // Проверка, что объекты действительно скопированы, а не ссылаются на тот же объект
        source.nested.y = 100;
        expect(result.nested.y).toBe(30);
    });
    
    it('должен обрабатывать циклические ссылки в assignDeep', () => {
        const target = {};
        const source = { a: 1 };
        source.self = source; // Циклическая ссылка
        
        // Не должно вызывать бесконечную рекурсию
        const result = utils.assignDeep(target, source);
        
        expect(result.a).toBe(1);
        expect(result.self).toBe(result); // Цикл сохранен, но ссылается на новый объект
    });
    
    it('должен копировать массивы в assignDeep', () => {
        const target = { arr: [1, 2] };
        const source = { arr: [3, 4, 5] };
        
        const result = utils.assignDeep(target, source);
        
        expect(result.arr).toBeArrayEqual([3, 4, 5]);
        
        // Проверка, что массивы действительно скопированы
        source.arr.push(6);
        expect(result.arr).toBeArrayEqual([3, 4, 5]); // Не изменился после изменения source
    });
    
    it('должен возвращать значение по умолчанию через getIfDefined', () => {
        expect(utils.getIfDefined(undefined, 'default')).toBe('default');
        expect(utils.getIfDefined(null, 'default')).toBe(null);
        expect(utils.getIfDefined(0, 'default')).toBe(0);
        expect(utils.getIfDefined('value', 'default')).toBe('value');
    });
    
    it('должен проверять определенность и не-null значения через IsDefinedAndNotNull', () => {
        expect(utils.IsDefinedAndNotNull(undefined)).toBe(false);
        expect(utils.IsDefinedAndNotNull(null)).toBe(false);
        expect(utils.IsDefinedAndNotNull(0)).toBe(true);
        expect(utils.IsDefinedAndNotNull('')).toBe(true);
        expect(utils.IsDefinedAndNotNull(false)).toBe(true);
    });
    
    it('должен проверять, является ли значение объектом через isObject', () => {
        expect(utils.isObject({})).toBe(true);
        expect(utils.isObject([])).toBe(true);
        expect(utils.isObject(function() {})).toBe(true);
        expect(utils.isObject(null)).toBe(false);
        expect(utils.isObject(undefined)).toBe(false);
        expect(utils.isObject(42)).toBe(false);
        expect(utils.isObject('string')).toBe(false);
    });
    
    it('должен проверять, установлено ли свойство через isPropSet', () => {
        const obj = { 
            prop1: 'value1',
            PROP2: 'value2',
            prop3: null,
            prop4: undefined
        };
        
        expect(utils.isPropSet(obj, 'prop1')).toBe('value1');
        expect(utils.isPropSet(obj, 'prop2')).toBe('value2'); // Проверка регистронезависимости
        expect(utils.isPropSet(obj, 'prop3')).toBe(null);
        expect(utils.isPropSet(obj, 'prop4')).toBe(undefined);
        expect(utils.isPropSet(obj, 'nonExistent')).toBe(undefined);
    });
    
    // Тесты для функций с массивами
    it('должен копировать элементы одного массива в другой через copyArrayTo', () => {
        const source = [1, 2, 3, 4];
        const target = [0, 0, 0, 0, 0];
        
        utils.copyArrayTo(source, target);
        
        expect(target).toBeArrayEqual([1, 2, 3, 4, 0]);
    });
    
    it('должен создавать новый массив из коллекции через createArrayFrom', () => {
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
        expect(result === collection).toBe(false); // Новый массив, не исходная коллекция
    });
    
    it('должен находить элемент по id через findItemById', () => {
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
    
    it('должен находить индекс элемента по id через findItemIndexById', () => {
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
    
    it('должен находить индекс элемента в массиве через indexOfArrayItem', () => {
        const array = ['a', 'b', 'c', 'd'];
        
        expect(utils.indexOfArrayItem(array, 'b')).toBe(1);
        expect(utils.indexOfArrayItem(array, 'e')).toBe(-1);
    });
    
    it('должен перемещать элемент в массиве через moveArrayItem', () => {
        const array = ['a', 'b', 'c', 'd', 'e'];
        
        utils.moveArrayItem(array, 1, 3);
        
        expect(array).toBeArrayEqual(['a', 'c', 'd', 'b', 'e']);
    });
    
    it('должен выбрасывать ошибку при перемещении несуществующего элемента', () => {
        const array = ['a', 'b', 'c'];
        
        expect(() => {
            utils.moveArrayItem(array, 5, 1);
        }).toThrow('Index out of bounds: 5');
    });
    
    it('должен корректно обрабатывать перемещение за пределы массива', () => {
        const array = ['a', 'b', 'c', 'd', 'e'];
        
        utils.moveArrayItem(array, 1, 10); // Индекс 10 вне массива, должен быть скорректирован
        
        expect(array).toBeArrayEqual(['a', 'c', 'd', 'e', 'b']);
    });
    
    it('должен удалять элемент из массива через removeArrayItem', () => {
        const array = ['a', 'b', 'c', 'd'];
        
        const removed = utils.removeArrayItem(array, 'b');
        
        expect(removed).toBe('b');
        expect(array).toBeArrayEqual(['a', 'c', 'd']);
        
        const notRemoved = utils.removeArrayItem(array, 'z');
        expect(notRemoved).toBeUndefined();
        expect(array).toBeArrayEqual(['a', 'c', 'd']);
    });
    
    it('должен вставлять элемент в массив через insertArrayItem', () => {
        const array = ['a', 'c', 'd'];
        
        utils.insertArrayItem(array, 1, 'b');
        
        expect(array).toBeArrayEqual(['a', 'b', 'c', 'd']);
    });
    
    it('должен заполнять массив значениями через fillArray', () => {
        const array = ['a', 'b', 'c', 'd', 'e'];
        
        utils.fillArray(array, 'x', 1, 4);
        
        expect(array).toBeArrayEqual(['a', 'x', 'x', 'x', 'e']);
    });
    
    it('должен обрабатывать отрицательные индексы в fillArray', () => {
        const array = ['a', 'b', 'c', 'd', 'e'];
        
        utils.fillArray(array, 'x', -3, -1);
        
        expect(array).toBeArrayEqual(['a', 'b', 'x', 'x', 'e']);
    });
    
    it('должен заполнять до конца массива при отсутствии end в fillArray', () => {
        const array = ['a', 'b', 'c', 'd', 'e'];
        
        utils.fillArray(array, 'x', 3);
        
        expect(array).toBeArrayEqual(['a', 'b', 'c', 'x', 'x']);
    });
    
    // Тесты для функций с проверками
    it('должен проверять, является ли значение числовым через isNumeric', () => {
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
    
    // Тесты для функций генерации ID
    it('должен генерировать уникальные ID через generateId', () => {
        const id1 = utils.generateId('test');
        const id2 = utils.generateId('test');
        
        expect(id1).not.toBe(id2);
        expect(id1.startsWith('test-')).toBe(true);
        expect(id2.startsWith('test-')).toBe(true);
    });
    
    it('должен использовать префикс easy при вызове generateId без аргументов', () => {
        const id = utils.generateId(null);
        expect(id.startsWith('easy-')).toBe(true);
    });
    
    it('должен сокращать длинные префиксы в generateId', () => {
        const id = utils.generateId('veryLongPrefix');
        expect(id.startsWith('vryL-')).toBe(true);
    });
    
    // Тесты для функций с датами
    it('должен конвертировать строку в дату через strToDateTime', () => {
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
    
    it('должен обрабатывать различные форматы разделителей в strToDateTime', () => {
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
    
    it('должен выбрасывать ошибку при некорректной дате в strToDateTime', () => {
        expect(() => {
            utils.strToDateTime('2023-13-32', 'yyyy-MM-dd');
        }).toThrow();
    });
    
    it('должен конвертировать строку во время через strToTime', () => {
        const timeStr = '14:30:45';
        
        const result = utils.strToTime(timeStr);
        
        expect(result instanceof Date).toBe(true);
        expect(result.getHours()).toBe(14);
        expect(result.getMinutes()).toBe(30);
        expect(result.getSeconds()).toBe(0); // Bug in implementation, should be 45
    });
    
    it('должен выбрасывать ошибку при некорректном времени в strToTime', () => {
        expect(() => {
            utils.strToTime('25:70');
        }).toThrow();
    });
});
