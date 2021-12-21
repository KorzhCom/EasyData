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
}

type GetRowsPageParams = { page: number, pageSize: number };
type GetRowsOffsetParams = { offset: number, limit?: number };
export type GetRowsParams = GetRowsPageParams | GetRowsOffsetParams;

interface CachedChunk {
    offset: number;
    rows: Array<DataRow>;
}
interface ChunkMap {
    [index: number]: CachedChunk;
}

export class EasyDataTable {
    public id: string;

    private _chunkSize: number = 1000;

    constructor(options?: EasyDataTableOptions) {
        options = options || {};
        this._chunkSize = options.chunkSize || this._chunkSize;
        this._elasticChunks = options.elasticChunks || this._elasticChunks;
        this.loader = options.loader;
        this._columns = new DataColumnList();

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

    private _columns: DataColumnList;

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
        this.chunkMap = {};
    }

    private _elasticChunks = false;

    public get elasticChunks(): boolean {
        return this._elasticChunks;
    }

    public set elasticChunks(value: boolean) {
        this._elasticChunks = value;
        this.total = 0;
        this.needTotal = !this.elasticChunks;
        this.chunkMap = {};
    }

    // here we keep all loaded chunks
    // they keys of this map are chunk numbers
    // and they are kept sorted
    private chunkMap: ChunkMap = {};

    private total: number = 0;

    private loader?: DataLoader | null = null;

    private needTotal = true;

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

        const lbChunk = Math.trunc(fromIndex / this._chunkSize);
        const ubChunk = Math.trunc((endIndex - 1) / this._chunkSize);

        let allChunksCached = true;
        for (let i = lbChunk; i <= ubChunk; i++) {
            if (!this.chunkMap[i]) {
                allChunksCached = false;
                break;
            }
        }

        if (allChunksCached) {
            let resultArr: DataRow[] = [];
            for (let i = lbChunk; i <= ubChunk; i++) {
               resultArr = resultArr.concat(this.chunkMap[i].rows)
            }

            const firstChunkOffset = this.chunkMap[lbChunk].offset;
            return Promise.resolve(
                    resultArr.slice(fromIndex - firstChunkOffset,  endIndex - firstChunkOffset)
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

        let limit = this._chunkSize * (ubChunk - lbChunk + 1);
        if (this.elasticChunks)
            limit++;

        return this.loader.loadChunk({
            offset: lbChunk * this._chunkSize, 
            limit: limit,
            needTotal: needTotal
        })
        .then(result => {
            const chunks = result.table.getCachedChunks();
            if (needTotal) {
                this.total = result.total;
                if (endIndex > this.total) {
                    endIndex = this.total;
                }
            }

            let index = lbChunk;
            for (const chunk of chunks) {
                this.chunkMap[index] = {
                    offset: index * this._chunkSize,
                    rows: chunk.rows
                }
                index++;
            }

            if (this.elasticChunks) {
                const count = result.table.getCachedCount();
                if (count > 0) {
                    const chunk = this.chunkMap[index - 1];

                    if (count === limit) {
                        chunk.rows.splice(chunk.rows.length - 1, 1);
                        if (chunk.rows.length == 0) {
                            delete this.chunkMap[index - 1];
                        }
                    }
                
                    if (count < limit) {
                        this.total = this.getCachedCount();
                    }
                }
            }

            let resultArr: DataRow[] = [];
            for (let i = lbChunk; i <= ubChunk; i++) {
               resultArr = resultArr.concat(this.chunkMap[i].rows)
            }

            const firstChunkOffset = this.chunkMap[lbChunk].offset;
            return resultArr.slice(fromIndex - firstChunkOffset,  endIndex - firstChunkOffset);
        });
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
        this.chunkMap = {};
    }

    public getCachedCount(): number {
        return this.getCachedRows().length;
    }

    public clear() {
        this.columns.clear();
        this.chunkMap = {};
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

    public addRow(rowOrValue: any[] | DataRow) : DataRow {
        let newRow: DataRow;
        if (Array.isArray(rowOrValue)) {
            const dateIdx = this._columns.getDateColumnIndexes();
            if (dateIdx.length > 0) {
                for(const idx of dateIdx) {
                    if (rowOrValue[idx]) {
                        rowOrValue[idx] = this.mapDate(rowOrValue[idx], this._columns.get(idx).type);
                    }
                }
            }

            newRow = new DataRow(this._columns, rowOrValue);
        } 
        else {
            newRow = this.createRow(rowOrValue);
        }  
    
        let lastChunk = this.getLastChunk();
        if (!lastChunk || lastChunk.rows.length >= this._chunkSize) {
            lastChunk = this.createChunk();
        }

        lastChunk.rows.push(newRow);
        const cachedTotal = this.getCachedCount();
        if (cachedTotal > this.total) {
            this.total = cachedTotal;
        }
        
        return newRow;
    }

    protected createChunk(index?: number): CachedChunk {
        if (typeof index == 'undefined') {
            index = this.getLastChunkIndex() + 1;
        }

        const chunk: CachedChunk = { offset: index * this._chunkSize, rows: [] };

        this.chunkMap[index] = chunk;
        return chunk;
    }

    private getLastChunkIndex(): number {
        const keys = Object.keys(this.chunkMap);
        return keys.length > 0 
            ? parseInt(keys[keys.length - 1])
            : -1;
    }

    private getLastChunk(): CachedChunk | null {
        const index = this.getLastChunkIndex();
        return index > -1
            ? this.chunkMap[index]
            : null;
    }

    public getCachedRows(): DataRow[] {
        return this.getCachedChunks()
            .reduce((acc, v) => acc.concat(v.rows), []);
    }

    public getCachedChunks(): CachedChunk[] {
        return Object.values(this.chunkMap);
    }    

    public totalIsKnown() : boolean {
        if (this.elasticChunks) {
            const count = this.getCachedCount();
            return count === this.total;
        }

        return !this.needTotal;
    }
}