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

    it(`createArrayFrom() - exception`, () => {
        const set1 = 123
        assert.throws(()=>{
            utils.createArrayFrom(set1)
        }, /^TypeError: collection is not iterable$/,);
    })
})