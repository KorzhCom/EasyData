import {describe, it} from "node:test"
import * as assert from "node:assert/strict"
import 'global-jsdom/register'
import { utils } from "../src/public_api";

describe(`Test generators`, () => {
    it(`generateId()`, async () => {
        const array = []

        const gen_pack = () => {
            for (let i = 0; i < 1000; i++) {
                array.push(utils.generateId('id'))
            }
        }

        const delay = (ms: number) => {
            // @ts-ignore
            return new Promise((resolve, reject) => {
                setTimeout(resolve, ms);
            });
        }

        gen_pack()

        for (let j = 0; j < 5; j++) {
            await delay(1000)
            gen_pack()
        }

        // @ts-ignore
        const test = new Set(array)

        assert.strictEqual(test.size, array.length);
    })
})
