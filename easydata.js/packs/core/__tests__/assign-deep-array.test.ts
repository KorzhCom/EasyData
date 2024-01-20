import { expect, test } from 'vitest'
import {utils} from "../src/public_api"

test('AssignDeepArray', () => {
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
    expect(object1.arr[0].data.get).toEqual(object2.arr[0].data.get);
})