import { DataType } from '@easydata/core';
import { GridColumn } from './easy_grid_columns';
import { EasyGridOptions } from './easy_grid_options';
export declare const DFMT_REGEX: RegExp;
export declare enum CellRendererType {
    STRING = 1,
    NUMBER = 2,
    DATETIME = 3,
    BOOL = 4
}
export type GridCellRenderer = (value: any, column: GridColumn, cellValueElement: HTMLElement, rowElement: HTMLElement, isGroup?: boolean) => void;
export declare class GridCellRendererStore {
    constructor(options: EasyGridOptions);
    private renderers;
    private defaultRenderers;
    getDefaultRenderer(columnType: DataType): GridCellRenderer;
    getDefaultRendererByType(rendererType: CellRendererType): GridCellRenderer;
    setDefaultRenderer(cellType: CellRendererType, renderer: GridCellRenderer): void;
    getRenderer(name: string): GridCellRenderer;
    registerRenderer(name: string, renderer: GridCellRenderer): void;
    getCellType(dataType: DataType): CellRendererType;
}
