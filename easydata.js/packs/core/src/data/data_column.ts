import { DataType } from '../types/data_type';
import { utils } from '../utils/utils';

export enum ColumnAlignment 
{
    None = 0,
    Left,
    Center,
    Right
}

export interface DataColumnStyle 
{
    alignment?: ColumnAlignment; 
}

export interface DataColumnDescriptor {
    /** Represents internal column id. */
    id: string;
    /** Represents original internal column id. */
    originAttrId?: string;
    /** The type of data represented by column. */
    type?: DataType;
    /** Name to use for this column in the UI. */
    label: string;
    isAggr?: boolean;
    /** The display format for the column. */
    dfmt?: string;
    gfct?: string;
    /** The style of the column to display in UI. */
    style?: DataColumnStyle;
    /** Detailed description of the column. */
    description: string | null;
}

export class DataColumn {

    /** The type of data represented by column. */
    public readonly type: DataType;

    /** Represents internal column id. */
    public readonly id: string;

    public readonly isAggr: boolean;

    /** Represents original internal column id. */
    public readonly originAttrId?: string;

    /** Name to use for this column in the UI. */
    public label: string;

    /** The display format for the column. */
    public displayFormat?: string;

    public groupFooterColumnTemplate?: string;

    /** The style of the column to display in UI. */
    public style?: DataColumnStyle;

    /** Column description. */
    public description: string | null;

    constructor(desc: DataColumnDescriptor) {
        if (!desc)
            throw Error("Options are required");
        
        if (!desc.id)
            throw Error("Field Id is required");

        if (!desc.label)
            throw Error("Label is required");

        this.id = desc.id;
        this.type = utils.getIfDefined(desc.type, DataType.String);
        this.label = desc.label;
        this.originAttrId = desc.originAttrId;
        this.isAggr = desc.isAggr || false;
        this.displayFormat = desc.dfmt;
        this.groupFooterColumnTemplate = desc.gfct;
        this.style = desc.style || {};
        this.description = desc.description;
    }
}

interface DataColumnMapper {
    [field: string]: number;
}

export class DataColumnList {
    private items: DataColumn[] = [];
    private mapper: DataColumnMapper = {};

    private _dateColumnIdx: number[] = [];
    
    constructor() {
    }

    public get count() : number {
        return this.items.length;
    }

    public add(colOrDesc: DataColumn | DataColumnDescriptor) : number {   
        let col: DataColumn 
        if (colOrDesc instanceof DataColumn) {
            col = colOrDesc;
        }
        else {
            col = new DataColumn(colOrDesc);
        }

        const index = this.items.length;
        this.items.push(col);
        this.mapper[col.id] = index;

        if ([DataType.Date, DataType.DateTime, DataType.Time].indexOf(col.type) >= 0) {
            this._dateColumnIdx.push(index);
        }

        return index;
    }

    private updateDateColumnIdx() {
        this._dateColumnIdx = this.getItems()
            .filter(col => [DataType.Date, DataType.DateTime, DataType.Time].indexOf(col.type) >= 0)
            .map((col, index) => index);
    }

    public put(index: number, col : DataColumn) : void {
        //!!!!!!!!!check on "out of index"
        this.items[index] = col;
        this.updateDateColumnIdx();
    }

    public move(col: DataColumn, newIndex: number): void {
        let oldIndex = this.items.indexOf(col);
        if (oldIndex >= 0 && oldIndex != newIndex) {
            utils.moveArrayItem(this.items, oldIndex, newIndex);  
            this.updateDateColumnIdx();
        }
    }

    public get(index: number) : DataColumn {
        //!!!!!!!!!check on "out of index"
        return this.items[index];
    }

    public getIndex(id: string) : number | undefined {
        return this.mapper[id];
    }

    public getItems() : DataColumn[] {
        return this.items;
    }

    public getDateColumnIndexes(): number[] {
        return this._dateColumnIdx;
    }

    public removeAt(index: number) : void {
        const col = this.get(index);
        this.items.splice(index, 1);
        const removeDate = this._dateColumnIdx.indexOf(index);
        if (removeDate >= 0) {
            this._dateColumnIdx.splice(removeDate, 1);
        }
        delete this.mapper[col.id];
    }

    public clear() {
        this.items = [];
        this._dateColumnIdx = [];
        this.mapper = {};
    }
}