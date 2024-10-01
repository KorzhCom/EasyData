import { utils } from "../src/public_api.ts";
import {describe, expect, it} from "@olton/easytest";

describe(`Test generators`, () => {
    it(`generateId()`, async () => {
        const array = []

        const gen_pack = () => {
            for (let i = 0; i < 1000; i++) {
                array.push(utils.generateId('id'))
            }
        }

        const delay = (ms) => {
            return new Promise((resolve, reject) => {
                setTimeout(resolve, ms);
            });
        }

        gen_pack()

        for (let j = 0; j < 5; j++) {
            await delay(1000)
            gen_pack()
        }

        const test = new Set(array)

        expect(test.size).toBe(array.length);
    })

    it(`generateId() - unique in 1_000_000 ids`, () => {
        const array = []
        for(let i = 0; i < 1_000_000; i++) {
            array.push(utils.generateId('id'))
        }
        const expected = new Set(array)
        expect(expected.size).toBe(array.length, 'Must be a 1_000_000 unique ids')
    })
})
