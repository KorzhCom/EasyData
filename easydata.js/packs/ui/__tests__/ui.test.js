import { describe, it, expect} from "@olton/easytest"
import { domel } from "../src/utils/dom_elem_builder.ts";

describe(`UI tests`, () => {
    it('Ok', () => {
        const div = domel('div').text('Hello, World!');
        return expect(div.toDOM()).toBeHtmlElement()
    })
})
