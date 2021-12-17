import { EasyDataTable, AggregatesCalculator, AggregationSettings } from '@easydata/core';

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
    Once,
    Always,
    Never
}

export interface EasyGridOptions {
    slot: HTMLElement | string;

    dataTable: EasyDataTable;

    aggregates?: {
        showGrandTotalsOnEachPage?: boolean,
        settings: AggregationSettings,
        calculator: AggregatesCalculator
    },
    addColumns?: boolean;
    addColumnsTitle?: string;
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

    columnsWidth?: {
        string?: {
            min?: number,
            max?: number,
            default?: number
        },
        number?: {
            min?: number,
            default?: number
        },
        bool?: {
            min?: number,
            default?: number
        },
        date?: {
            min?: number,
            default?: number
        },
        rowNum?: {
            min?: number,
            default?: number
        }
    }

    autoResizeColumns?: AutoResizeColumns;

    syncGridColumns?: boolean;

    viewportRowsCount?: number;
    
    showActiveRow?: boolean;

    onInit?: () => void;
    onRowClick?: (ev: RowClickEvent) => void;
    onRowDbClick?: (ev: RowClickEvent) => void;
    onPageChanged?: (ev: PageChangedEvent) => void;
    onAddColumnClick?: (ev: AddColumnClickEvent) => void;
    onColumnChanged?: (ev: ColumnChangedEvent) => void;
    onColumnDeleted?: (ev: ColumnDeletedEvent) => void;
    onColumnMoved?: (ev: ColumnMovedEvent) => void;
    onActiveRowChanged?: (ev:ActiveRowChangedEvent) => void;

    onSyncGridColumn?: (column: GridColumn) => void;
    onGetCellRenderer?: (column: GridColumn, defaultRenderer: GridCellRenderer) => GridCellRenderer;
}