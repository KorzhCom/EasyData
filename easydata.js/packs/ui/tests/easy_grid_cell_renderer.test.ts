import "./dom-setup";

import { expect } from "@olton/latte";
import { CellRendererType, GridCellRendererStore } from "../src/grid/easy_grid_cell_renderer";
import { GridColumnAlign } from "../src/grid/easy_grid_columns";
import { EasyGridOptions } from "../src/grid/easy_grid_options";

const store = new GridCellRendererStore({} as EasyGridOptions);
const renderString = store.getDefaultRendererByType(CellRendererType.STRING);

/** Runs the default string renderer over a value and returns the cell element it filled in. */
function render(value: any): HTMLElement {
    const cellValueElement = document.createElement("div");
    const rowElement = document.createElement("div");
    const column = { align: GridColumnAlign.LEFT, dataColumn: null } as any;

    renderString(value, column, cellValueElement, rowElement);
    return cellValueElement;
}

// Northwind stores employee addresses with a CRLF in them, e.g.
// "507 - 20th Ave. E.\r\nApt. 2A". The grid cell is `white-space: nowrap` and the
// renderer swaps line breaks for a visible glyph, so such a value has to end up on
// ONE line - otherwise the leftover break makes the browser split the cell and the
// second line is clipped by the fixed row height.
const CRLF_ADDRESS = "507 - 20th Ave. E.\r\nApt. 2A";

describe("StringCellRendererDefault: values containing line breaks", () => {

    it("leaves no raw line-break character in the rendered text", () => {
        const text = render(CRLF_ADDRESS).innerText;

        expect(/[\r\n]/.test(text)).toBe(false);
    });

    it("replaces a CRLF with a single newline glyph", () => {
        expect(render(CRLF_ADDRESS).innerText).toBe("507 - 20th Ave. E.↵ Apt. 2A");
    });

    it("replaces a lone CR with a newline glyph", () => {
        expect(render("Edgeham Hollow\rWinchester Way").innerText)
            .toBe("Edgeham Hollow↵ Winchester Way");
    });

    it("replaces a lone LF with a newline glyph", () => {
        expect(render("Edgeham Hollow\nWinchester Way").innerText)
            .toBe("Edgeham Hollow↵ Winchester Way");
    });

    it("keeps the original, unmangled value in the tooltip", () => {
        expect(render(CRLF_ADDRESS).title).toBe(CRLF_ADDRESS);
    });

    it("leaves a single-line value untouched", () => {
        const el = render("14 Garrett Hill");

        expect(el.innerText).toBe("14 Garrett Hill");
        expect(el.title).toBe("14 Garrett Hill");
    });

    it("renders an empty string for a null value", () => {
        expect(render(null).innerText).toBe("");
    });
});
