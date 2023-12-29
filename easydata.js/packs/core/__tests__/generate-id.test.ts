import { expect, test } from 'vitest'
import {utils} from "../src/public_api";

// @ts-ignore
test('Generate ID', async () => {
    const array = []

    const gen_pack = () => {
        for (let i = 0; i < 100; i++) {
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

    expect(array.length).toEqual(test.size)
}, 20000)