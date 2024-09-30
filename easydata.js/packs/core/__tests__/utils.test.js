import {utils} from "../src/utils/utils.ts";
import {DataType} from "../src/types/data_type.ts";

describe(`Test utilities functions`, () => {
    it(`getAllDataTypes()`, () => {
        const result = utils.getAllDataTypes()
        expect(result.sort((a, b)=>a-b)).toBeArrayEqual([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])
    })

    it(`getAllDataTypes()`, () => {
        const result = utils.getDateDataTypes()
        expect(result.sort((a, b)=>a-b)).toBeArrayEqual([10,11,12])
    })

    it(`getStringDataTypes()`, () => {
        const result = utils.getStringDataTypes()
        expect(result.sort((a, b)=>a-b)).toBeArrayEqual([1,14,16])
    })

    it(`getNumericDataTypes()`, () => {
        const result = utils.getNumericDataTypes()
        expect(result.sort((a, b)=>a-b)).toBeArrayEqual([2,3,4,5,7,8,13])
    })

    it(`getIfDefined()`, () => {
        const result = utils.getIfDefined(undefined, 1)
        expect(result).toBe(1);
    })

    it(`IsDefinedAndNotNull()`, () => {
        const result = utils.IsDefinedAndNotNull(1)
        expect(result).toBeTrue();
    })

    it(`copyArrayTo()`, () => {
        const array1 = [1, 2, 3]
        const array2 = [4, 5, 6]
        utils.copyArrayTo(array1, array2);
        expect(array2).toBeArrayEqual([1, 2, 3]);
    })

    it(`createArrayFrom()`, () => {
        const set1 = new Set([1, 2, 3])
        const result = utils.createArrayFrom(set1);
        expect(result).toBeArrayEqual([1, 2, 3]);
    })

    it(`createArrayFrom() - string`, () => {
        const set1 = `123`
        const result = utils.createArrayFrom(set1);
        expect(result).toBeArrayEqual([`1`, `2`, `3`]);
    })

    it(`createArrayFrom() - 123 hasn't iterator`, () => {
        expect(() => {
            utils.createArrayFrom(123);
        }).toThrow();
    })

    it(`createArrayFrom() - exception`, () => {
        const set1 = 123
        expect(()=>{
            utils.createArrayFrom(set1)
        }).toThrowError(/collection is not iterable/);
    })

    it(`findItemById()`, () => {
        const array = [
            {id: 1, value: 1},
            {id: 2, value: 2},
        ]
        const result = utils.findItemById(array, 1)
        expect(result).toBeObject({id: 1, value: 1});
    })

    it(`findItemIndexById()`, () => {
        const array = [
            {id: 1, value: 1},
            {id: 2, value: 2},
        ]
        const result = utils.findItemIndexById(array, 1)
        expect(result).toBe(0);
    })

    it(`findItemIndexById() - not found, must return -1`, () => {
        const array = [
            {id: 1, value: 1},
            {id: 2, value: 2},
        ]
        const result = utils.findItemIndexById(array, 3)
        expect(result).toBe(-1);
    })

    it(`indexOfArrayItem()`, () => {
        const array = [1, 2, 3, NaN]
        const result = utils.indexOfArrayItem(array, 2)
        expect(result).toBe(1);
    })

    it(`indexOfArrayItem() - NaN != NaN`, () => {
        const array = [1, 2, 3, NaN]
        const result = utils.indexOfArrayItem(array, NaN)
        expect(result).toBe(3);
    })

    it(`moveArrayItem()`, () => {
        const array = [1, 2, 3]
        utils.moveArrayItem(array, 1, 2)
        expect(array[2]).toBe(2);
    })

    it(`removeArrayItem()`, () => {
        const array = [1, 2, 3]
        utils.removeArrayItem(array, 2)
        expect(array).toBeArrayEqual([1, 3]);
    })

    it(`insertArrayItem()`, () => {
        const array = [1, 3]
        utils.insertArrayItem(array, 1, 2)
        expect(array).toBeArrayEqual([1, 2, 3]);
    })

    it(`fillArray() - from index to end of array`, () => {
        const array = [1, 2, 3]
        utils.fillArray(array, 0, 1)
        expect(array).toBeArrayEqual([1, 0, 0]);
    })

    it(`fillArray() - from index to index (end index not included)`, () => {
        const array = [1, 2, 3, 4, 5]
        utils.fillArray(array, 0, 1, 3)
        expect(array).toBeArrayEqual([1, 0, 0, 4, 5]);
    })

    it(`isObject() - Array is object`, () => {
        expect(utils.isObject([1, 0, 0, 4, 5])).toBeTrue()
    })

    it(`isObject() - literal {} is object`, () => {
        expect(utils.isObject({})).toBeTrue()
    })

    it(`isObject() - NULL is object`, () => {
        expect(utils.isObject(null)).toBeTrue()
    })

    it(`isObject() - undefined is not an object`, () => {
        expect(utils.isObject(undefined)).toBeFalse();
    })

    it(`isObject() - Numeric literal is not an object`, () => {
        expect(utils.isObject(123)).toBeFalse();
    })

    it(`isObject() - String literal is not an object`, () => {
        expect(utils.isObject(`123`)).toBeFalse();
    })

    it(`isNumericType() - Unknown is not a number`, () => {
        expect(utils.isNumericType(DataType.Unknown)).toBeFalse();
    })

    it(`isNumericType() - Currency is a number`, () => {
        expect(utils.isNumericType(DataType.Currency)).toBeTrue();
    })

    it(`isNumericType() - Blob is not a number`, () => {
        expect(utils.isNumericType(DataType.Blob)).toBeFalse();
    })

    it(`isIntType() - Float is not an int`, () => {
        expect(utils.isIntType(DataType.Float)).toBeFalse();
    })

    it(`isIntType() - Int32 is an int`, () => {
        expect(utils.isIntType(DataType.Int32)).toBeTrue();
    })

    it(`isNumeric() - Number literal is numeric type`, () => {
        expect(utils.isNumeric(123)).toBeTrue();
    })

    it(`isNumeric() - String literal is not a numeric type`, () => {
        expect(utils.isNumeric(`123`)).toBeFalse();
    })

    it(`areCompatibleDataTypes() - Date and DateTime is compatible`, () => {
        expect(utils.areCompatibleDataTypes(DataType.Date, DataType.DateTime)).toBeTrue();
    })

    it(`areCompatibleDataTypes() - Int32 and Int64 is not compatible`, () => {
        expect(utils.areCompatibleDataTypes(DataType.Int32, DataType.Int64)).toBeFalse();
    })

    it(`isPropSet() - id->1`, () => {
        const obj = {
            id: 1,
            zero: 0,
            bool: false
        }
        expect(utils.isPropSet(obj, 'id')).toBe(1);
    })

    it(`isPropSet() - zero->0`, () => {
        const obj = {
            id: 1,
            zero: 0,
            bool: false
        }
        expect(utils.isPropSet(obj, 'zero')).toBe(0);
    })

    it(`isPropSet() - bool->false`, () => {
        const obj = {
            id: 1,
            zero: 0,
            bool: false
        }
        expect(utils.isPropSet(obj, 'bool')).toBeFalse();
    })

})