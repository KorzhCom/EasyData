import { expect } from "@olton/latte";
import { nextSortDirection, computeColumnWidth } from "../src/grid/easy_grid_column_utils";

describe("easy_grid_column_utils", () => {
    it("cycles sort direction none -> asc -> desc -> none", () => {
        expect(nextSortDirection("none")).toBe("asc");
        expect(nextSortDirection("asc")).toBe("desc");
        expect(nextSortDirection("desc")).toBe("none");
    });

    it("adds the delta to the start width", () => {
        expect(computeColumnWidth(100, 50, 20)).toBe(150);
        expect(computeColumnWidth(100, -30, 20)).toBe(70);
    });

    it("clamps to the minimum width", () => {
        expect(computeColumnWidth(100, -200, 40)).toBe(40);
    });

    it("clamps to the maximum width when provided", () => {
        expect(computeColumnWidth(100, 900, 40, 500)).toBe(500);
    });

    it("rounds to an integer", () => {
        expect(computeColumnWidth(100.4, 0.2, 20)).toBe(101);
    });
});
