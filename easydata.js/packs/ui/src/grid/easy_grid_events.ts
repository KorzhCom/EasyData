import { DataRow } from "@easydata/core";

import { GridColumnSortDirection } from './easy_grid_column_utils';

export type GridEventType = 
    'init'              |
    'rowClick'          |
    'rowDbClick'        |
    'pageChanged'       |
    'addColumnClick'    |
    'columnChanged'     |
    'columnDeleted'     |
    'columnMoved'   |
    'columnSort'    |
    'columnResized';

export interface GridEvent {
    type: GridEventType | string; 
    [key:string]: any;
}

export interface PageChangedEvent extends GridEvent {
    type: 'pageChanged',
    newPage: number
}

export interface ColumnChangedEvent extends GridEvent {
    type: 'columnChanged';
    columnId: string;
}

export interface ColumnMovedEvent extends GridEvent {
    type: 'columnMoved';
    columnId: string;
    newIndex: number;
}

export interface AddColumnClickEvent extends GridEvent {
    sourceEvent: MouseEvent;
}

export interface RowClickEvent extends GridEvent {
    type: 'rowClick' | 'rowDbClick';
    rowIndex: number;
    row: DataRow;
    sourceEvent: MouseEvent;
}

export interface ColumnDeletedEvent extends GridEvent {
    type: 'columnDeleted';
    columnId: string;
}

export interface ActiveRowChangedEvent extends GridEvent {
    type: 'activeRowChanged';
    oldValue: number;
    newValue: number;
    rowIndex: number;
}

export interface ColumnSortEvent extends GridEvent {
    type: 'columnSort';
    columnId: string;
    direction: GridColumnSortDirection;   // the requested new direction
    sourceEvent: MouseEvent;
}

export interface ColumnResizedEvent extends GridEvent {
    type: 'columnResized';
    columnId: string;
    width: number;
}
