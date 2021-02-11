import { DataColumnDescriptor, DataColumnList } from "./data_column";
import { DataRow } from "./data_row";
import { DataLoader } from "./data_loader";

export interface EasyDataTableOptions {
    chunkSize?: number;
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
        this.needTotal = true;
        this.chunkMap = {};
    }

    // object keeps number keys sorted
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

        if (fromIndex >= this.total) {
            return Promise.resolve([]);
        }

        let endIndex = fromIndex + count;
        if (endIndex >= this.total) {
            endIndex = this.total;
        }

        const lbChunk = Math.trunc(fromIndex / this._chunkSize);
        const upChunk = Math.trunc(endIndex / this._chunkSize);

        let allChunksCached = true;
        for(let i = lbChunk; i <= upChunk; i++) {
            if (!this.chunkMap[i]) {
                allChunksCached = false;
                break;
            }
        }

        if (allChunksCached) {
            let resultArr: DataRow[] = [];
            for(let i = lbChunk; i <= upChunk; i++) {
               resultArr = resultArr.concat(this.chunkMap[i].rows)
            }
            return Promise.resolve(
                resultArr.slice(
                    fromIndex - this.chunkMap[lbChunk].offset, 
                    endIndex - this.chunkMap[lbChunk].offset)
                );
        }

        //if loader is not defined
        if (!this.loader) {
            throw `Loader is not defined. Can't get the rows from ${fromIndex} to ${endIndex}`;
        }

        // we need total only fo first request
        const needTotal = this.needTotal;
        if (this.needTotal) {
            this.needTotal = false;
        }

        return this.loader.loadChunk({
            offset: lbChunk * this._chunkSize, 
            limit: this._chunkSize * (upChunk - lbChunk + 1),
            needTotal: needTotal
        })
        .then(result => {
            const chunks = result.table.getCachedChunks();
            if (needTotal) {
                this.total = result.total;
            }
    
            let index = lbChunk;
            for(const chunk of chunks) {
                this.chunkMap[index] = {
                    offset: index * this._chunkSize,
                    rows: chunk.rows
                }
                index++;
            }
            let resultArr: DataRow[] = [];
            for(let i = lbChunk; i <= upChunk; i++) {
               resultArr = resultArr.concat(this.chunkMap[i].rows)
            }
            return resultArr.slice(
                fromIndex - this.chunkMap[lbChunk].offset, 
                endIndex - this.chunkMap[lbChunk].offset
            );
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
        this.needTotal = true;
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
                    ? (value ? new Date(value) : value)
                    : value;
            });    
        }
       
        return new DataRow(this._columns, values);
    }

    public addRow(rowOrValue: any[] | DataRow) : DataRow {
        let newRow: DataRow;
        if (Array.isArray(rowOrValue)) {
            const dateIdx = this._columns.getDateColumnIndexes();
            if (dateIdx.length > 0) {
                for(const idx of dateIdx) {
                    if (rowOrValue[idx]) {
                        rowOrValue[idx] = new Date(rowOrValue[idx]);
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
    
}