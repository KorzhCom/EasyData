import { expect, test } from 'vitest'
import {utils} from "../src/public_api"

test('should deeply assign properties from source to target', () => {
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

    expect(target).toEqual({
        scalar: 'value',
        refObject: {
            nested: 'nestedValue',
            array: [1, 2, 3],
            html: document.createElement('div'),
        },
        refArray: [{nested: 'nestedValue'}, 1, 'two', target.refArray],
        refArrayRef: [{nested: 'nestedValueRef'}, 1, 'two'],
        htmlRef: document.createElement('div'),
    });
    expect(target.refObject).not.toBe(source.refObject);
    expect(target.refObject.html).toBe(source.refObject.html);
    expect(target.refArray[0]).toBe(source.refArray[0]);
    expect(target.refArray[3]).toBe(source.refArray);
});
