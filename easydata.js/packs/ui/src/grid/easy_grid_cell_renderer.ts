import { i18n, DataType } from '@easydata/core';

import { GridColumn, GridColumnAlign } from './easy_grid_columns';
import { EasyGridOptions } from './easy_grid_options';

const cssPrefix = "keg";
export const DFMT_REGEX = /{0:(.*?)}/g;

export enum CellRendererType {
    STRING = 1,
    NUMBER,
    DATETIME,
    BOOL
}

export type GridCellRenderer = (value: any, column: GridColumn, 
    cellValueElement: HTMLElement, rowElement: HTMLElement, isGroup?: boolean) => void;


const StringCellRendererDefault: GridCellRenderer = (value: any, column: GridColumn, cellValueElement: HTMLElement, rowElement: HTMLElement) => {
    const text = value ? value.toString().replace(/\n/g, '\u21B5 ') : '';

    cellValueElement.innerText = text;
    cellValueElement.title = text;
    if (column.align == GridColumnAlign.NONE) {
        cellValueElement.classList.add(`${cssPrefix}-cell-value-align-left`);
    }
}


const NumberCellRendererDefault: GridCellRenderer = (value: any, column: GridColumn, cellValueElement: HTMLElement, rowElement: HTMLElement) => {
    let strValue = (value || '').toString();

    if(typeof value == 'number') {
        if (column.dataColumn && column.dataColumn.displayFormat
            && DFMT_REGEX.test(column.dataColumn.displayFormat)) 
        {
            strValue = column.dataColumn.displayFormat.replace(DFMT_REGEX, (_, $1) => {
                return i18n.numberToStr(value, $1);
            });
        }
        else {
            strValue = value.toLocaleString();
        }
    }

    cellValueElement.innerText = strValue;
    cellValueElement.title = strValue;
    if (column.align == GridColumnAlign.NONE) {
        cellValueElement.classList.add(`${cssPrefix}-cell-value-align-right`);
    }
}

const DateTimeCellRendererDefault: GridCellRenderer = (value: any, column: GridColumn, cellValueElement: HTMLElement, rowElement: HTMLElement) => {
    const isDate = Object.prototype.toString.call(value) === '[object Date]';
    let strValue = (value || '').toString();

    if (isDate) {
        if (column.dataColumn && column.dataColumn.displayFormat 
            && DFMT_REGEX.test(column.dataColumn.displayFormat)) 
        {
            strValue = column.dataColumn.displayFormat.replace(DFMT_REGEX, (_, $1) => {
                return i18n.dateTimeToStr(value, column.type, $1);
            });
        }
        else {
            const locale = i18n.getCurrentLocale();
            const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
            switch (column.type) {
                case DataType.Date:
                    strValue = value.toLocaleDateString(locale);
                    break;
                case DataType.Time:
                    strValue = value.toLocaleTimeString(locale, timeOptions);
                    break;
                case DataType.DateTime:
                    strValue = `${value.toLocaleDateString(locale)} ${value.toLocaleTimeString(locale, timeOptions)}`;
                    break;
            }
        }
    }

    cellValueElement.innerText = strValue;
    cellValueElement.title = strValue;
    if (column.align == GridColumnAlign.NONE) {
        cellValueElement.classList.add(`${cssPrefix}-cell-value-align-right`);
    }
}


const BoolCellRendererDefault: GridCellRenderer = (value: any, column: GridColumn, cellValueElement: HTMLElement, rowElement: HTMLElement) => {
    if (column.dataColumn && column.dataColumn.displayFormat
        && DFMT_REGEX.test(column.dataColumn.displayFormat)) {
        const strValue = column.dataColumn.displayFormat.replace(DFMT_REGEX, (_, $1) => {
            return i18n.booleanToStr(value, $1);
        });

        return StringCellRendererDefault(strValue, column, cellValueElement, rowElement);
    }
    else {
        cellValueElement.classList.add(`${cssPrefix}-cell-value-bool`);
        cellValueElement.classList.add(`${cssPrefix}-${value ? 'cell-value-true' : 'cell-value-false'}`);
    }
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