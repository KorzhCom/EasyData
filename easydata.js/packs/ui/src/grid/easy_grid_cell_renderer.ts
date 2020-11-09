import { i18n } from '@easydata/core';
import { DataType } from '@easydata/core';

import { GridColumn, GridColumnAlign } from './easy_grid_columns';
import { domel } from '../utils/dom_elem_builder';
import { EasyGridOptions } from './easy_grid_options';

const cssPrefix = "keg";

export enum CellRendererType {
    STRING = 1,
    NUMBER,
    DATETIME,
    BOOL
}

export type GridCellRenderer = (value: any, column: GridColumn, cell: HTMLElement) => void;


const StringCellRendererDefault: GridCellRenderer = (value: any, column: GridColumn, cell: HTMLElement) => {
    const text = value ? value.toString().replace(/\n/g, '\u21B5 ') : '';
    domel('div', cell)
        .addClass(`${cssPrefix}-cell-value`)
        .addHtml(text)
        .title(value || '');
}


const NumberCellRendererDefault: GridCellRenderer = (value: any, column: GridColumn, cell: HTMLElement) => {
    let strValue = (value || '').toString();

    if(typeof value == 'number') {
        strValue = value.toLocaleString();
    }

    let builder = domel('div', cell)
        .addClass(`${cssPrefix}-cell-value`)
        .addHtml(strValue)
        .title(strValue);

    if (column.align == GridColumnAlign.NONE) {
        builder.addClass(`${cssPrefix}-cell-value-align-right`);
    }

}


const DateTimeCellRendererDefault: GridCellRenderer = (value: any, column: GridColumn, cell: HTMLElement) => {
    const isDate = Object.prototype.toString.call(value) === '[object Date]';
    let strValue = (value || '').toString();

    if (isDate) {
        const locale = i18n.getCurrentLocale();
        switch (column.type) {
            case DataType.Date:
                strValue = value.toLocaleDateString(locale);
                break;
            case DataType.Time:
                strValue = value.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' });
                break;
            case DataType.DateTime:
                strValue = `${value.toLocaleDateString(locale)} ${value.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' })}`;
                break;
        }
    }

    let builder = domel('div', cell)
        .addClass(`${cssPrefix}-cell-value`)
        .addHtml(strValue)
        .title(strValue);

    if (column.align == GridColumnAlign.NONE) {
        builder.addClass(`${cssPrefix}-cell-value-align-right`);
    }
}


const BoolCellRendererDefault: GridCellRenderer = (value: any, column: GridColumn, cell: HTMLElement) => {
    domel('div', cell)
        .addClass(`${cssPrefix}-cell-value`)
        .addClass(`${cssPrefix}-cell-value-bool`)
        .addClass(`${cssPrefix}-${value ? 'cell-value-true' : 'cell-value-false'}`);

}



interface CellRendererCollection {
    [name: string]: GridCellRenderer;
}

export class GridCellRendererStore {
    constructor(options: EasyGridOptions) {
        this.registerRenderer('StringDefault', StringCellRendererDefault);
        this.setDefaultRenderer(CellRendererType.STRING, StringCellRendererDefault);

        this.registerRenderer('NumberDefault', NumberCellRendererDefault);
        this.setDefaultRenderer(CellRendererType.NUMBER, NumberCellRendererDefault);

        this.registerRenderer('DateTimeDefault', DateTimeCellRendererDefault);
        this.setDefaultRenderer(CellRendererType.DATETIME, DateTimeCellRendererDefault);

        this.registerRenderer('BoolDefault', BoolCellRendererDefault);
        this.setDefaultRenderer(CellRendererType.BOOL, BoolCellRendererDefault);
    }

    private renderers: CellRendererCollection = {};
    private defaultRenderers: CellRendererCollection = {};

    public getDefaultRenderer(columnType: DataType): GridCellRenderer {
        const cellType = this.getCellType(columnType);
        return this.defaultRenderers[CellRendererType[cellType]];
    }

    public getDefaultRendererByType(rendererType: CellRendererType): GridCellRenderer {
        return this.defaultRenderers[CellRendererType[rendererType]];
    }

    public setDefaultRenderer(cellType: CellRendererType, renderer: GridCellRenderer) {
        if (renderer) {
            this.defaultRenderers[CellRendererType[cellType]] = renderer;
        }
    }

    public getRenderer(name: string) {
        return this.renderers[name];
    }
    
    public registerRenderer(name: string, renderer: GridCellRenderer) {
        this.renderers[name] = renderer;
    }

    public getCellType(dataType: DataType): CellRendererType {
        switch (dataType) { 
            case DataType.Autoinc:
            case DataType.Byte:
            case DataType.Word:
            case DataType.Currency:
            case DataType.Float:
            case DataType.Int32:
            case DataType.Int64:
                return CellRendererType.NUMBER;
            case DataType.Date:
            case DataType.DateTime:
            case DataType.Time:
                return CellRendererType.DATETIME;
            case DataType.Bool:
                return CellRendererType.BOOL;
            default:
                return CellRendererType.STRING;
        }
    }
}