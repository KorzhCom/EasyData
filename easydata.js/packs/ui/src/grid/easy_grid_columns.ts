import { 
    utils, DataColumn, 
    DataColumnList, DataType,
    ColumnAlignment
} from '@easydata/core';

import { EasyGridBase } from './easy_grid_types';
//import { CellRendererType } from "./easy_grid_cell_renderer";
//import { GridCellRenderer } from './easy_grid_cell_renderer';

const DEFAULT_WIDTH_STRING = 250;
const ROW_NUM_WIDTH = 60;

export enum GridColumnAlign {
    NONE = 1,
    LEFT,
    CENTER,
    RIGHT
}

function MapAlignment(alignment: ColumnAlignment): GridColumnAlign {
    switch(alignment) {
        case ColumnAlignment.Left:
            return GridColumnAlign.LEFT;
        case ColumnAlignment.Center:
            return GridColumnAlign.CENTER;
        case ColumnAlignment.Right:
            return GridColumnAlign.RIGHT;
        default:
            return GridColumnAlign.NONE;
    }
}
export class GridColumn {
    private _label : string = null;
    private grid: EasyGridBase;
    private _description: string = null;

    public readonly dataColumn: DataColumn;

    public width: number;
    //public left: number;
    public align: GridColumnAlign = GridColumnAlign.NONE;

    public isVisible: boolean = true;

    public readonly isRowNum: boolean = false;


    public calculatedWidth: number;

    constructor(column: DataColumn, grid: EasyGridBase, isRowNum: boolean = false) {
        this.dataColumn = column;
        this.grid = grid;
        const widthOptions = grid.options.columnWidths || {};

        if (column) {
            if (column.style.alignment) {
                this.align = MapAlignment(column.style.alignment);
            }

            this.width = (widthOptions && widthOptions[this.type]) ? widthOptions[this.type].default : DEFAULT_WIDTH_STRING;
            this._description = column.description;
        }
        else if (isRowNum) {
            this.isRowNum = true;
            this.width = (widthOptions && widthOptions.rowNumColumn) ? widthOptions.rowNumColumn.default : ROW_NUM_WIDTH;
            this._label = '';
        }
    }

    public get label(): string {
        return this._label ? this._label : this.isRowNum ? '' : this.dataColumn.label;
    };

    public set label(value: string) {
        this._label = this.label;
    }

    /** Get column description. */
    public get description(): string {
        return this._description;
    }

    public get type(): DataType {
        return this.dataColumn ? this.dataColumn.type : null;
    }
}


export class GridColumnList {
    private items: GridColumn[] = [];
    private grid: EasyGridBase;
    
    constructor(columnList: DataColumnList, grid: EasyGridBase) {
        this.grid = grid;
        this.sync(columnList);
    }

    public sync(columnList: DataColumnList, hasRowNumCol = true) {
        this.clear();

        const rowNumCol = new GridColumn(null, this.grid, true);
        this.add(rowNumCol);
        if (!hasRowNumCol) {
            rowNumCol.isVisible = false;
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