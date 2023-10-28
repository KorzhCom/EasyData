import { DataColumn, DataColumnList, DataType } from '@easydata/core';
import { EasyGrid } from './easy_grid';
import { GridCellRenderer } from './easy_grid_cell_renderer';
export declare enum GridColumnAlign {
    NONE = 1,
    LEFT = 2,
    CENTER = 3,
    RIGHT = 4
}
export declare class GridColumn {
    private _label;
    private grid;
    private _description;
    readonly dataColumn: DataColumn;
    width: number;
    align: GridColumnAlign;
    isVisible: boolean;
    readonly isRowNum: boolean;
    cellRenderer: GridCellRenderer;
    calculatedWidth: number;
    constructor(column: DataColumn, grid: EasyGrid, isRowNum?: boolean);
    get label(): string;
    set label(value: string);
    /** Get column description. */
    get description(): string;
    get type(): DataType;
}
export declare class GridColumnList {
    private items;
    private grid;
    constructor(columnList: DataColumnList, grid: EasyGrid);
    sync(columnList: DataColumnList, hasRowNumCol?: boolean): void;
    get count(): number;
    add(col: GridColumn): number;
    put(index: number, col: GridColumn): void;
    move(col: GridColumn, newIndex: number): void;
    get(index: number): GridColumn;
    getItems(): GridColumn[];
    removeAt(index: number): void;
    clear(): void;
}
