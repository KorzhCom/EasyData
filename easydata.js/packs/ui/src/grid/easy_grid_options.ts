import { EasyDataTable, AggregatesCalculator, AggregationSettings, DataType } from '@easydata/core';

import { 
    ColumnMovedEvent, ColumnDeletedEvent, 
    ColumnChangedEvent, 
    AddColumnClickEvent,
    PageChangedEvent,
    RowClickEvent,
    ActiveRowChangedEvent
} from './easy_grid_events';

import { GridColumn } from './easy_grid_columns';
import { GridCellRenderer } from './easy_grid_cell_renderer';

export enum AutoResizeColumns {
    Always,
    Once,
    Never
}

export interface ColumnWidthSettings {
    min? : number,
    max? : number,
    default: number
}

export interface DefaultColumnWidths {
    autoResize?: AutoResizeColumns;
    [key: number] : ColumnWidthSettings,
    rowNumColumn?: ColumnWidthSettings,
    stringColumns?: ColumnWidthSettings,
    numberColumns?: ColumnWidthSettings,
    boolColumns?: ColumnWidthSettings,
    dateColumns?: ColumnWidthSettings,
    otherColumns?: ColumnWidthSettings
}

export interface EasyGridOptions {
    slot: HTMLElement | string;

    dataTable: EasyDataTable;

    aggregates?: {
        showGrandTotalsOnEachPage?: boolean,
        settings: AggregationSettings,
        calculator: AggregatesCalculator
    },
    showPlusButton?: boolean;
    plusButtonTitle?: string;
    useRowNumeration?: boolean;
    allowDragDrop?: boolean;

    fixHeightOnFirstRender?: boolean;

    pagination?: {
        maxButtonCount?: number,
        useBootstap?: boolean
    } 

    paging?: {
        enabled?: boolean,
        pageSize?: number,
        allowPageSizeChange?: boolean,
        pageSizeItems?: number[]
    }

    header?: {
        fixed?: boolean
    }

    columnWidths?: DefaultColumnWidths;

    syncGridColumns?: boolean;

    viewportRowsCount?: number;
    
    showActiveRow?: boolean;

    onInit?: () => void;
    onRowClick?: (ev: RowClickEvent) => void;
    onRowDbClick?: (ev: RowClickEvent) => void;
    onPageChanged?: (ev: PageChangedEvent) => void;
    onPlusButtonClick?: (ev: AddColumnClickEvent) => void;
    onColumnChanged?: (ev: ColumnChangedEvent) => void;
    onColumnDeleted?: (ev: ColumnDeletedEvent) => void;
    onColumnMoved?: (ev: ColumnMovedEvent) => void;
    onActiveRowChanged?: (ev:ActiveRowChangedEvent) => void;

    onSyncGridColumn?: (column: GridColumn) => void;
    onGetCellRenderer?: (column: GridColumn, defaultRenderer: GridCellRenderer) => GridCellRenderer;
}