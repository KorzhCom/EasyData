import { DataColumnDescriptor, DataColumnList } from './data_column';
import { DataRow } from './data_row';
import { DataLoader } from './data_loader';
import { DataType } from '../types/data_type';
import { utils } from '../utils/utils';

export interface EasyDataTableOptions {
    chunkSize?: number;
    elasticChunks?: boolean;
    loader?: DataLoader;
    columns?: DataColumnDescriptor[];
    rows?: any[];
    onUpdate?: (table?: EasyDataTable) => void;
}

type GetRowsPageParams = { page: number, pageSize: number };
type GetRowsOffsetParams = { offset: number, limit?: number };
export type GetRowsParams = GetRowsPageParams | GetRowsOffsetParams;

export class EasyDataTable {
    public id: string;

    private _chunkSize: number = 1000;
    private _elasticChunks = false;
    private _columns: DataColumnList;

    private cachedRows: DataRow[] = [];

    private total: number = 0;

    private loader?: DataLoader | null = null;

    private needTotal = true;

    private onUpdate?: (table?: EasyDataTable) => void;

    constructor(options?: EasyDataTableOptions) {
        options = options || {};
        this._chunkSize = options.chunkSize || this._chunkSize;
        this._elasticChunks = options.elasticChunks || this._elasticChunks;
        this.loader = options.loader;
        this._columns = new DataColumnList();
        this.onUpdate = options.onUpdate;

        if (options.columns) {
            for(const colDesc of options.columns) {
                this._columns.add(colDesc);
            }
        }

        if (options.rows) {
            for (const rowData of options.rows) {
                const row = this.createRow(rowData);
                this.addRow(row);
            }
        }

        this.needTotal = !this._elasticChunks;
    }

    public get columns() : DataColumnList {
        return this._columns;
    }

    public get chunkSize(): number {
        return this._chunkSize;
    }

    public set chunkSize(value: number) {
        this._chunkSize = value;
        this.total = 0;
        this.needTotal = !this.elasticChunks;
        this.cachedRows = [];
    }

    public get elasticChunks(): boolean {
        return this._elasticChunks;
    }

    public set elasticChunks(value: boolean) {
        this._elasticChunks = value;
        this.total = 0;
        this.needTotal = !this.elasticChunks;
        this.cachedRows = [];
    }

    public getRows(params?: GetRowsParams): Promise<Array<DataRow>> {
        let fromIndex = 0, count = this._chunkSize;
        if (params) {
            if ('page' in params) {
                fromIndex = params.pageSize * (params.page - 1);
                count = params.pageSize
            }
            else {
                fromIndex = params.offset;
                count = params.limit;
            }
        }

        let endIndex = fromIndex + count; //the first index of the next page

        //if we don't calculate total on this request
        if (!this.needTotal && !this.elasticChunks) {
            if (fromIndex >= this.total) {
                return Promise.resolve([]);
            }
    
            if (endIndex > this.total) {
                endIndex = this.total;
            }
        }

        let allChunksCached = endIndex <= this.cachedRows.length;

        if (allChunksCached) {
            return Promise.resolve(
                this.cachedRows.slice(fromIndex,  endIndex)
            );
        }

        //if loader is not defined
        if (!this.loader) {
            throw `Loader is not defined. Can't get the rows from ${fromIndex} to ${endIndex}`;
        }

        // we need total only for the first request
        const needTotal = this.needTotal;
        if (this.needTotal) {
            this.needTotal = false;
        }

        let offset = this.cachedRows.length;
        let limit = endIndex - offset;

        if (limit < this._chunkSize) {
            limit = this._chunkSize;
        }

        const resultPromise = this.loader.loadChunk({
            offset: offset, 
            limit: limit,
            needTotal: needTotal
        })
        .then(result => {
            if (needTotal) {
                this.total = result.total;
            }

            Array.prototype.push.apply(this.cachedRows, result.table.getCachedRows());
            if (endIndex > this.cachedRows.length) {
                endIndex = this.cachedRows.length;
            }

            if (this.elasticChunks) {
                const count = result.table.getCachedCount();
                if (count < limit) {
                    this.total = this.cachedRows.length;
                }
            }

            this.fireUpdated();
            return this.cachedRows.slice(fromIndex,  endIndex);
        });

        return resultPromise;
    }

    public getRow(index: number): Promise<DataRow | null> {
        return this.getRows({ offset: index, limit: 1 })
            .then(rows => rows.length > 0 ? rows[0] : null);
    }

    public getTotal(): number {
        return this.total;
    }

    public setTotal(total : number) : void {
        this.total = total;
        this.needTotal = false;
        this.cachedRows = [];
    }

    public getCachedCount(): number {
        return this.cachedRows.length;
    }

    public clear() {
        this.columns.clear();
        this.cachedRows = [];
        this.total = 0;
        this.needTotal = !this._elasticChunks;
    }

    protected createRow(dataOrRow?: DataRow | any): DataRow {
        const dateIdx = this._columns.getDateColumnIndexes();
        const values: any[] = new Array(this._columns.count);

        const getValue = dataOrRow instanceof DataRow
            ? (colId) => dataOrRow.getValue(colId)
            : (colId) => dataOrRow[colId];

        if (dataOrRow) {
            this.columns.getItems().forEach((column) => {
                const value = getValue(column.id);
                const index = this.columns.getIndex(column.id);
                values[index] = (dateIdx.indexOf(index) >= 0)
                    ? this.mapDate(value, column.type)
                    : value;
            });    
        }
       
        return new DataRow(this._columns, values);
    }

    private mapDate(value: any, dtype: DataType): Date {
        if (value) {
            let result = new Date(value);
            if (isNaN(result.getTime())
                && dtype == DataType.Time) {
                result = utils.strToTime(value);
            }
            return result;
        }

        return null;
    }

    public addRow(rowOrValues: any[] | DataRow) : DataRow {
        let newRow: DataRow;
        if (Array.isArray(rowOrValues)) {
            let values : any[] = rowOrValues;
            const dateIdx = this._columns.getDateColumnIndexes();
            if (dateIdx.length > 0) {
                for (const idx of dateIdx) {
                    if (values[idx]) {
                        values[idx] = this.mapDate(values[idx], this._columns.get(idx).type);
                    }
                }
            }

            newRow = new DataRow(this._columns, values);
        } 
        else {
            newRow = this.createRow(rowOrValues);
        }  
    
        this.cachedRows.push(newRow);
        const cachedTotal = this.getCachedCount();
        if (cachedTotal > this.total) {
            this.total = cachedTotal;
        }
        
        return newRow;
    }

    public getCachedRows(): DataRow[] {
        return this.cachedRows;
    }

    public totalIsKnown() : boolean {
        if (this.elasticChunks) {
            const count = this.getCachedCount();
            return count === this.total;
        }

        return !this.needTotal;
    }

    public fireUpdated() {
        if (this.onUpdate) {
            this.onUpdate(this);
        }
    }
}