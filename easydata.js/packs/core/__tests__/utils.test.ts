import {describe, it, beforeEach} from "node:test"
import * as assert from "node:assert/strict"
import 'global-jsdom/register'
import {utils} from "../src/utils/utils";

describe(`Test utilities functions`, () => {
    it(`getAllDataTypes()`, () => {
        const result = utils.getAllDataTypes()
        assert.deepStrictEqual(result.sort((a, b)=>a-b), [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19])
    })

    it(`getAllDataTypes()`, () => {
        const result = utils.getDateDataTypes()
        assert.deepStrictEqual(result.sort((a, b)=>a-b), [10,11,12])
    })

    it(`getStringDataTypes()`, () => {
        const result = utils.getStringDataTypes()
        assert.deepStrictEqual(result.sort((a, b)=>a-b), [1,14,16])
    })

    it(`getNumericDataTypes()`, () => {
        const result = utils.getNumericDataTypes()
        assert.deepStrictEqual(result.sort((a, b)=>a-b), [2,3,4,5,7,8,13])
    })

    it(`getIfDefined()`, () => {
        const result = utils.getIfDefined(undefined, 1)
        assert.strictEqual(result, 1);
    })

    it(`IsDefinedAndNotNull()`, () => {
        const result = utils.IsDefinedAndNotNull(1)
        assert.strictEqual(result, true);
    })

    it(`copyArrayTo()`, () => {
        const array1 = [1, 2, 3]
        const array2 = [4, 5, 6]
        utils.copyArrayTo(array1, array2);
        assert.deepStrictEqual(array2, [1, 2, 3]);
    })

    it(`createArrayFrom()`, () => {
        const set1 = new Set([1, 2, 3])
        const result = utils.createArrayFrom(set1);
        assert.deepStrictEqual(result, [1, 2, 3]);
    })

    it(`createArrayFrom() - string`, () => {
        const set1 = `123`
        const result = utils.createArrayFrom(set1);
        assert.deepStrictEqual(result, [`1`, `2`, `3`]);
    })

    it(`createArrayFrom() - 123 hasn't iterator`, () => {
        const set1 = 123
        const result = utils.createArrayFrom(set1);
        assert.deepStrictEqual(result, [1, 2, 3]);
    })

    it(`createArrayFrom() - exception`, () => {
        const set1 = 123
        assert.throws(()=>{
            utils.createArrayFrom(set1)
        }, /^TypeError: collection is not iterable$/,);
    })

    it(`findItemById()`, () => {
        const array = [
            {id: 1, value: 1},
            {id: 2, value: 2},
        ]
        const result = utils.findItemById(array, 1)
        assert.deepStrictEqual(result, {id: 1, value: 1});
    })

    it(`findItemIndexById()`, () => {
        const array = [
            {id: 1, value: 1},
            {id: 2, value: 2},
        ]
        const result = utils.findItemIndexById(array, 1)
        assert.deepStrictEqual(result, 0);
    })

    it(`findItemIndexById() - not found, must return -1`, () => {
        const array = [
            {id: 1, value: 1},
            {id: 2, value: 2},
        ]
        const result = utils.findItemIndexById(array, 3)
        assert.deepStrictEqual(result, -1);
    })

    it(`indexOfArrayItem()`, () => {
        const array = [1, 2, 3, NaN]
        const result = utils.indexOfArrayItem(array, 2)
        assert.deepStrictEqual(result, 1);
    })

    it(`indexOfArrayItem() - NaN != NaN`, () => {
        const array = [1, 2, 3, NaN]
        const result = utils.indexOfArrayItem(array, NaN)
        assert.deepStrictEqual(result, 3);
    })

    it(`moveArrayItem()`, () => {
        const array = [1, 2, 3]
        utils.moveArrayItem(array, 1, 2)
        assert.deepStrictEqual(array[2], 2);
    })

    it(`removeArrayItem()`, () => {
        const array = [1, 2, 3]
        utils.removeArrayItem(array, 2)
        assert.deepStrictEqual(array, [1, 3]);
    })

    it(`insertArrayItem()`, () => {
        const array = [1, 3]
        utils.insertArrayItem(array, 1, 2)
        assert.deepStrictEqual(array, [1, 2, 3]);
    })

    it(`fillArray() - from index to end of array`, () => {
        const array = [1, 2, 3]
        utils.fillArray(array, 0, 1)
        assert.deepStrictEqual(array, [1, 0, 0]);
    })

    it(`fillArray() - from index to index (end index not included)`, () => {
        const array = [1, 2, 3, 4, 5]
        utils.fillArray(array, 0, 1, 3)
        assert.deepStrictEqual(array, [1, 0, 0, 4, 5]);
    })

})