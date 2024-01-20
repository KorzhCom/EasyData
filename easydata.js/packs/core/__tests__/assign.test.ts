import { expect, test } from 'vitest'
import {utils} from "../src/public_api";

test('Assign', () => {
    let object1 = {
        data: "Hello",
        val: "test"
    };

    let object2 = {
        data: "why",
        prop: "hello",
    };

    let object3 = {
        column: "test"
    };

    let result = utils.assign(object1, object2, object3);
    expect(result.data).toBe(object2.data);
    expect(result.prop).toBe(object2.prop);
    expect(result.val).toBe(object1.val);
    expect(result.column).toBe(object3.column);
})