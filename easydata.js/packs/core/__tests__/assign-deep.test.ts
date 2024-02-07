import { expect, test } from 'vitest'
import {utils} from "../src/public_api"

// Create a fake DOM for testing with $.ajax
test('AssignDeep', () => {
    let object1 = {
        data: {
            get: "bla",
            set: "kek"
        },
        val: "test",
    };

    let object2: any = {
        data: {
            get: "why"
        },
        prop: "hello",
    };

    let object3 = {
        data: {
            set: "ohh"
        },
        column: "test"
    };

    let result = utils.assignDeep(object1, object2, object3);
    expect(result.data.get).toBe(object2.data.get);
    expect(result.data.set).toBe(object3.data.set);
    expect(result.val).toBe(object1.val);
    expect(result.prop).toBe(object2.prop);
    expect(result.column).toBe(object3.column);
})
