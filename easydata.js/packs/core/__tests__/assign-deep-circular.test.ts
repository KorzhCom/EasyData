import { expect, test } from 'vitest'
import {utils} from "../src/public_api"

test('AssignDeep', () => {
    function A() {}
    function B() {}
    var a = new A();
    var b = new B();
    a.b = b;
    b.a = a;

    const result = utils.assignDeep({}, a);
    expect(result.b.a).toEqual(a);
})