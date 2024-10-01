import { repeatString, reverseString, combinePath, strEndsWith } from "../src/utils/string_utils.js";
import {describe, expect, it} from "@olton/easytest";

describe(`String utils tests`, () => {
    it(`repeatString()`, () => {
        const input = "#"
        const expected = "#####";
        const result = repeatString(input, 5);
        expect(result).toBe(expected);
    })

    it(`reverseString()`, () => {
        const input = "123456789"
        const expected = "987654321";
        const result = reverseString(input);
        expect(result).toBe(expected);
    })

    it(`combinePath()`, () => {
        const path1 = "path1"
        const path2 = "path2";
        const result = combinePath(path1, path2);
        expect(result).toBe(`${path1}/${path2}`);
    })

    it(`strEndsWith()`, () => {
        const str = "strEndsWith"
        const result = strEndsWith(str, "With");
        expect(result).toBeTrue();
    })
})