import {describe, it, expect} from "@olton/easytest"
import { utils } from "../src/public_api.ts";

describe(`Test assign methods`, () => {
    it(`assign()`, () => {
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

        return expect(result).toBeEqualObject({
            data: "why",
            val: "test",
            prop: "hello",
            column: "test"
        })
    })

    it(`assignDeep() -> Fields`, () => {
        let object1 = {
            data: {
                get: "bla",
                set: "kek"
            },
            val: "test",
        };

        let object2 = {
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

        return expect(result).toBeDeepEqual({
            data: {
                get: "why",
                set: "ohh"
            },
            val: "test",
            prop: "hello",
            column: "test"
        });
    })

    it(`assignDeep() -> Refs`, () => {
        const source = {
            scalar: 'value',
            refObject: {
                nested: 'nestedValue',
                array: [1, 2, 3],
                html: document.createElement('div'),
            },
            refArray: [{nested: 'nestedValue'}, 1, 'two'],
            refArrayRef: [{nested: 'nestedValueRef'}, 1, 'two'],
            htmlRef: document.createElement('div'),
        };

        // @ts-ignore
        source.refArray[3] = source.refArray;

        const target = utils.assignDeep({}, source);

        return expect(target).toBeDeepEqual(source);
    })

    it(`assignDeep() -> Array`, () => {
        let object1 = {
            arr: [
                {
                    data: {
                        get: "bla",
                        set: "kek"
                    }
                }
            ]
        }

        let object2 = {
            arr: [
                {
                    data: {
                        get: "why"
                    }
                }
            ]

        }

        utils.assignDeep(object1, object2);

        return expect(object1.arr[0].data.get).toBe(object2.arr[0].data.get);
    })

    it(`assignDeep() -> circular`, () => {
        const a = {b: null};
        const b = {a: null};

        a.b = b;
        b.a = a;

        const result = utils.assignDeep({}, a);

        return expect(result.b.a).toBeDeepEqualSafe(a);
    })
})
