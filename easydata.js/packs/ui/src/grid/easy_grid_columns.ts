import { 
    utils, DataColumn, 
    DataColumnList, DataType
} from '@easydata/core';

import { EasyGrid } from './easy_grid';
import { CellRendererType } from "./easy_grid_cell_renderer";
import { GridCellRenderer } from './easy_grid_cell_renderer';

const DEFAULT_WIDTH = 150;
const DEFAULT_WIDTH_NUMBER = 120;
const DEFAULT_WIDTH_DATE = 200;
const DEFAULT_WIDTH_BOOL = 80;
const DEFAULT_WIDTH_STRING = 250;
const MIN_WIDTH_STRING = 100;
const MAX_WIDTH_STRING = 500;
const ROW_NUM_WIDTH = 60;

export enum GridColumnAlign {
    NONE = 1,
    LEFT,
    CENTER,
    RIGHT
}

export class GridColumn {
    private _label : string = null;
    private grid: EasyGrid;

    public readonly dataColumn: DataColumn;

    public width: number;
    //public left: number;
    public align: GridColumnAlign = GridColumnAlign.NONE;

    public isVisible: boolean = true;

    public readonly isRowNum: boolean = false;

    public cellRenderer: GridCellRenderer;

    constructor(column: DataColumn, grid: EasyGrid, isRowNum: boolean = false) {
        this.dataColumn = column;
        this.grid = grid;

        if (column) {
            const coltype : DataType = column.type;
            const cellType = this.grid.cellRendererStore.getCellType(coltype);
            switch (cellType) { 
                case CellRendererType.NUMBER:
                    this.width = DEFAULT_WIDTH_NUMBER;
                    break;
                case CellRendererType.DATETIME:
                    this.width = DEFAULT_WIDTH_DATE;
                    break;
                case CellRendererType.BOOL:
                    this.width = DEFAULT_WIDTH_BOOL;
                    break;
                default:
                    this.width = DEFAULT_WIDTH_STRING;
            }

            this.cellRenderer = this.grid.cellRendererStore.getDefaultRenderer(column.type);
        }
        else if (isRowNum) {
            this.isRowNum = true;
            this.width = ROW_NUM_WIDTH;
            this._label = '';

            this.cellRenderer = this.grid.cellRendererStore.getDefaultRendererByType(CellRendererType.NUMBER);
        }

        if (grid && grid.options && grid.options.onGetCellRenderer) {
            this.cellRenderer = grid.options.onGetCellRenderer(this, this.cellRenderer) || this.cellRenderer;
        }
    }

    public get label(): string {
        return this._label ? this._label : this.isRowNum ? '' : this.dataColumn.label;
    };

    public set label(value: string) {
        this._label = this.label;
    }

    public get type(): DataType {
        return this.dataColumn ? this.dataColumn.type : null;
    }
}


export class GridColumnList {
    private items: GridColumn[] = [];
    private grid: EasyGrid;
    
    constructor(columnList: DataColumnList, grid: EasyGrid) {
        this.grid = grid;
        this.sync(columnList);
    }

    public sync(columnList: DataColumnList, hasRowNumCol = true) {
        this.clear();

        if (hasRowNumCol) {
            const rowNumCol = new GridColumn(null, this.grid, true);
            this.add(rowNumCol);
        }

        if (columnList) {
            for (let column of columnList.getItems()) {
                const col = new GridColumn(column, this.grid);
                if (this.grid.options.onSyncGridColumn) {
                    this.grid.options.onSyncGridColumn(col);
                }
                this.add(col);
            }    
        }
    }

    public get count() : number {
        return this.items.length;
    }

    public add(col: GridColumn) : number {   
        const index = this.items.length;
        this.items.push(col);
        return index;
    }

    public put(index: number, col : GridColumn) : void {
        if (index >= 0 && index < this.items.length) {
            this.items[index] = col;
        }
    }

    public move(col: GridColumn, newIndex: number): void {
        let oldIndex = this.items.indexOf(col);
        if (oldIndex >= 0 && oldIndex != newIndex)
            utils.moveArrayItem(this.items, oldIndex, newIndex);  
    }

    public get(index: number) : GridColumn {
        if (index >= 0 && index < this.items.length) {
            return this.items[index];
        }
        else {
            return null;
        }
    }

//    public getIndex(name: string) : number {
//        return this.mapper[name];
//    }

    public getItems() : GridColumn[] {
        return this.items;
    }

    public removeAt(index: number) : void {
        const col = this.get(index);
        this.items.splice(index, 1);
        //delete this.mapper[col.name];
    }

    public clear() {
        this.items = [];
        //this.mapper = {};
    }
}