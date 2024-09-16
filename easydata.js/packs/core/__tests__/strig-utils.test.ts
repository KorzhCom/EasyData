import {describe, it, beforeEach} from "node:test"
import * as assert from "node:assert/strict"
import 'global-jsdom/register'
import { repeatString, reverseString, combinePath, strEndsWith } from "../src/utils/string_utils";

describe(`String utils tests`, () => {
    it(`repeatString()`, () => {
        const input = "#"
        const expected = "#####";
        const result = repeatString(input, 5);
        assert.strictEqual(result, expected);
    })

    it(`reverseString()`, () => {
        const input = "123456789"
        const expected = "987654321";
        const result = reverseString(input);
        assert.strictEqual(result, expected);
    })

    it(`combinePath()`, () => {
        const path1 = "path1"
        const path2 = "path2";
        const result = combinePath(path1, path2);
        assert.strictEqual(result, `${path1}/${path2}`);
    })

    it(`strEndsWith()`, () => {
        const str = "strEndsWith"
        const result1 = strEndsWith(str, "With");
        const result2 = strEndsWith(str, "Ends");
        assert.strictEqual(result1, true);
        assert.strictEqual(result2, false);
    })
})