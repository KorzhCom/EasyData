import { EventEmitter, EasyDataTable, DataRow } from '@easydata/core';
import { EasyGridOptions } from './easy_grid_options';
import { GridEventType, GridEvent, ColumnMovedEvent, RowClickEvent, AddColumnClickEvent as PlusButtonClickEvent, PageChangedEvent, ColumnChangedEvent, ColumnDeletedEvent, ActiveRowChangedEvent } from './easy_grid_events';
import { GridColumnList, GridColumn } from './easy_grid_columns';
import { GridCellRendererStore } from './easy_grid_cell_renderer';
interface PaginationInfo {
    page: number;
    total: number;
    pageSize: number;
}
/** Represents a grid widget with columns rows, paging, custom rendering and more */
export declare class EasyGrid {
    protected eventEmitter: EventEmitter;
    protected slot: HTMLElement;
    protected dataTable: EasyDataTable;
    protected columns: GridColumnList;
    protected cssPrefix: string;
    protected tableCss?: string;
    protected rootDiv: HTMLDivElement;
    protected headerDiv: HTMLDivElement;
    protected bodyDiv: HTMLDivElement;
    protected footerDiv: HTMLDivElement;
    protected bodyViewportDiv: HTMLDivElement;
    protected headerViewportDiv: HTMLDivElement;
    protected bodyCellContainerDiv: HTMLDivElement;
    protected headerCellContainerDiv: HTMLDivElement;
    protected headerRowDiv: HTMLDivElement;
    protected footerPaginateDiv: HTMLDivElement;
    protected pagination?: PaginationInfo;
    readonly cellRendererStore: GridCellRendererStore;
    protected paginationOptions: {
        maxButtonCount: number;
        useBootstrap: boolean;
    };
    protected defaultDataGridOptions: EasyGridOptions;
    readonly options: EasyGridOptions;
    /** Creates and initializes all internal properties of the grid object */
    constructor(options: EasyGridOptions);
    private mergeOptions;
    private processColumnWidthsOptions;
    private setSlot;
    private rowsOnPagePromise;
    /** Initializes grid widget according to the options passed in the parameter */
    protected init(options: EasyGridOptions): void;
    /** Fires a grid event. You can pass either an event type
     * (like 'init', 'rowClick', 'pageChanged', etc )
     * or a ready-to-use grid event object
     * */
    fireEvent(event: GridEvent | GridEventType): void;
    /** Allows to set the data (represented by a EasyDataTable object)
     *  or to replace the existing one associated with the grid */
    setData(data: EasyDataTable): void;
    /** Returns the EasyDataTable object associated with the grid via `setData()` call */
    getData(): EasyDataTable;
    /** Gets the list of grid columns */
    getColumns(): GridColumnList;
    /** This function is called when the grid is destroyed */
    destroy(): void;
    /** Clears the current DOM object and re-renders everything from the scratch */
    refresh(): void;
    protected clearDOM(): void;
    /** Clears all DOM object in the grid and return it to its initial state */
    clear(): void;
    private containerInitialHeight;
    private firstRender;
    /** Renders the grid */
    protected render(): void;
    protected updateHeight(): Promise<void>;
    protected getContainerWidth(): number;
    protected renderHeader(): void;
    protected hasData(): boolean;
    protected renderColumnHeader(column: GridColumn, index: number): HTMLElement;
    protected renderBody(): void;
    private isLastPage;
    private canShowAggregates;
    private prevRowTotals;
    private updateTotalsState;
    private applyGroupColumnTemplate;
    private renderTotalsRow;
    private onViewportKeydown;
    ensureRowVisibility(rowOrIndex: HTMLElement | number): void;
    /** Returns a promise with the list of the rows to render on one page.
     * The list contains pageSize+1 row to make it possible
     * to render the totals row (if it appears to be on the edge between pages)
     */
    private getRowsToRender;
    protected renderFooter(): void;
    protected renderPageInfoBlock(count: number): HTMLDivElement;
    protected showProgress(): void;
    protected hideProgress(): void;
    protected getLocalIndexByGlobal(index: number): number;
    protected getGlobalIndexByLocal(index: number): number;
    protected renderRow(row: DataRow, index: number): HTMLDivElement;
    protected renderCell(column: GridColumn, colIndex: number, value: any, rowElement: HTMLElement): HTMLDivElement;
    /** Sets current grid pages (if paging is used) */
    setPage(page: number): void;
    protected renderPageNavigator(): HTMLDivElement;
    addEventListener(eventType: 'init', handler: () => void): string;
    addEventListener(eventType: 'rowClick', handler: (ev: RowClickEvent) => void): string;
    addEventListener(eventType: 'rowDbClick', handler: (ev: RowClickEvent) => void): string;
    addEventListener(eventType: 'pageChanged', handler: (ev: PageChangedEvent) => void): string;
    addEventListener(eventType: 'plusButtonClick', handler: (ev: PlusButtonClickEvent) => void): string;
    addEventListener(eventType: 'columnChanged', handler: (ev: ColumnChangedEvent) => void): string;
    addEventListener(eventType: 'columnMoved', handler: (ev: ColumnMovedEvent) => void): string;
    addEventListener(eventType: 'columnDeleted', handler: (ev: ColumnDeletedEvent) => void): string;
    addEventListener(eventType: 'activeRowChanged', handler: (ev: ActiveRowChangedEvent) => void): string;
    removeEventListener(eventType: string, handlerId: string): void;
    protected renderHeaderButtons(): HTMLElement;
    private landingIndex;
    private landingSlot;
    private showLandingSlot;
    private hideLandingSlot;
    private _activeRowIndex;
    get activeRowIndex(): number;
    set activeRowIndex(value: number);
    private updateActiveRow;
    private getActiveRow;
    private getDataRow;
    /** Makes the grid focused for keyboard events */
    focus(): void;
    /** Resizes columns according to the data they represent */
    resizeColumns(): void;
}
export {};
