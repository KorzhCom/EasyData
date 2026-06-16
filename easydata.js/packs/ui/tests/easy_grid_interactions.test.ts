import "./dom-setup";

import { expect } from "@olton/latte";
import { EasyDataTable, DataType } from "@easydata/core";

import { EasyGrid } from "../src/grid/easy_grid";
import { GridColumn } from "../src/grid/easy_grid_columns";

function createTable(): EasyDataTable {
    const table = new EasyDataTable({ inMemory: true });
    table.columns.add({ id: "name", label: "Name", type: DataType.String });
    table.columns.add({ id: "city", label: "City", type: DataType.String });
    table.addRow(["Alice", "London"]);
    table.addRow(["Bob", "Paris"]);
    return table;
}

function makeSlot(): HTMLElement {
    const slot = document.createElement("div");
    document.body.appendChild(slot);
    return slot;
}

function firstDataColumn(grid: EasyGrid): GridColumn {
    return grid.getColumns().getItems().filter(c => !c.isRowNum)[0];
}

describe("EasyGrid sort interactions", () => {
    it("fires columnSort with 'asc' on first header click (none -> asc)", () => {
        let captured: any = null;
        const grid = new EasyGrid({
            slot: makeSlot(),
            dataTable: createTable(),
            sortable: true,
            useRowNumeration: false,
            paging: { enabled: false },
            onColumnSort: (ev) => { captured = ev; }
        });

        const header = grid['slot'].querySelector(".keg-header-cell-sortable") as HTMLElement;
        expect(header !== null).toBe(true);

        header.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        expect(captured !== null).toBe(true);
        expect(captured.type).toBe("columnSort");
        expect(captured.columnId).toBe("name");
        expect(captured.direction).toBe("asc");
    });

    it("renders the sort indicator from a column's sortDirection (via onSyncGridColumn)", () => {
        const grid = new EasyGrid({
            slot: makeSlot(),
            dataTable: createTable(),
            sortable: true,
            useRowNumeration: false,
            paging: { enabled: false },
            onSyncGridColumn: (col) => { if (!col.isRowNum && col.dataColumn.id === "name") col.sortDirection = "desc"; }
        });

        const indicator = grid['slot'].querySelector(".keg-sort-indicator.keg-sort-desc");
        expect(indicator !== null).toBe(true);
    });

    it("does not make headers sortable when sortable is false", () => {
        const grid = new EasyGrid({
            slot: makeSlot(),
            dataTable: createTable(),
            sortable: false,
            useRowNumeration: false,
            paging: { enabled: false }
        });

        expect(grid['slot'].querySelector(".keg-header-cell-sortable")).toBe(null);
    });
});

describe("EasyGrid resize interactions", () => {
    it("updates column width by the drag delta and fires columnResized", () => {
        let resized: any = null;
        const slot = makeSlot();
        const grid = new EasyGrid({
            slot,
            dataTable: createTable(),
            allowColumnResize: true,
            useRowNumeration: false,
            paging: { enabled: false },
            onColumnResize: (ev) => { resized = ev; }
        });

        const column = firstDataColumn(grid);
        const startWidth = column.width;

        const handle = slot.querySelector(".keg-header-cell-resize-active") as HTMLElement;
        expect(handle !== null).toBe(true);

        handle.dispatchEvent(new MouseEvent("mousedown", { clientX: 100, bubbles: true }));
        document.dispatchEvent(new MouseEvent("mousemove", { clientX: 140 }));
        document.dispatchEvent(new MouseEvent("mouseup", {}));

        expect(column.width).toBe(startWidth + 40);
        expect(column.manualWidth).toBe(true);
        expect(resized !== null).toBe(true);
        expect(resized.columnId).toBe("name");
        expect(resized.width).toBe(startWidth + 40);
    });

    it("does not fire columnResized on a bare click (no movement)", () => {
        let resized: any = null;
        const slot = makeSlot();
        const grid = new EasyGrid({
            slot,
            dataTable: createTable(),
            allowColumnResize: true,
            useRowNumeration: false,
            paging: { enabled: false },
            onColumnResize: (ev) => { resized = ev; }
        });

        const column = firstDataColumn(grid);
        const handle = slot.querySelector(".keg-header-cell-resize-active") as HTMLElement;

        handle.dispatchEvent(new MouseEvent("mousedown", { clientX: 100, bubbles: true }));
        document.dispatchEvent(new MouseEvent("mouseup", {}));

        expect(resized).toBe(null);
        expect(column.manualWidth).toBe(false);
    });
});
