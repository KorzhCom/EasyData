import { DataColumnDescriptor, DataColumnList } from './data_column';
import { DataRow } from './data_row';
import { DataLoader } from './data_loader';
import { DataType } from '../types/data_type';
import { utils } from '../utils/utils';
import { SparseRowCache } from './sparse_row_cache';

export interface EasyDataTableOptions {
    chunkSize?: number;
    elasticChunks?: boolean;
    inMemory? : boolean;
    loader?: DataLoader;
    columns?: DataColumnDescriptor[];
    rows?: any[];

    /**
     * The maximum number of detached row windows to keep in memory.
     * The rows loaded from the very beginning are never dropped.
     * Zero or less turns the limit off.
     */
    maxCachedWindows?: number;

    onUpdate?: (table?: EasyDataTable) => void;
}

type GetRowsPageParams = { page: number, pageSize: number };
type GetRowsOffsetParams = { offset: number, limit?: number };
export type GetRowsParams = GetRowsPageParams | GetRowsOffsetParams;

/** One request to the loader: a window of rows to bring in. */
interface LoadWindow {
    offset: number;
    limit: number;
}

const DEFAULT_MAX_CACHED_WINDOWS = 8;

export class EasyDataTable {
    /** The unique ID of the data table */
    public id: string;

    private _chunkSize: number = 1000;
    private _elasticChunks = false;
    private _columns: DataColumnList;

    private cache = new SparseRowCache();

    private maxCachedWindows = DEFAULT_MAX_CACHED_WINDOWS;

    /** The chunk requests that are in flight, keyed by the window they load. */
    private pendingLoads = new Map<string, Promise<void>>();

    /**
     * Bumped whenever the cached rows are dropped. A chunk that was requested
     * before the bump must not be merged into the table it no longer belongs to.
     */
    private generation = 0;

    private total: number = 0;

    private loader?: DataLoader | null = null;

    private needTotal = true;

    /**
     * Whether `total` holds a real value.
     *
     * This is not the same as `!needTotal`: the latter is turned off as soon as
     * a request that asks for the total is sent, while the total itself is only
     * there once that request comes back. Reading the two apart keeps a second
     * request made in between from treating `total` as if it were 0.
     */
    private totalKnown = false;

    private isInMemory = false;

    private onUpdate?: (table?: EasyDataTable) => void;

    constructor(options?: EasyDataTableOptions) {
        options = options || {};
        this._chunkSize = options.chunkSize || this._chunkSize;
        this._elasticChunks = options.elasticChunks || this._elasticChunks;
        this.loader = options.loader;
        if (typeof options.maxCachedWindows !== 'undefined') {
            this.maxCachedWindows = options.maxCachedWindows;
        }
        if (typeof options.inMemory !== 'undefined') {
            this.isInMemory = options.inMemory
        }
        if (this.isInMemory) {
            this.needTotal = false;
            this.totalKnown = true;
        }
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
        this.dropCachedRows();
    }

    public get elasticChunks(): boolean {
        return this._elasticChunks;
    }

    public set elasticChunks(value: boolean) {
        this._elasticChunks = value;
        this.total = 0;
        this.needTotal = !this.elasticChunks;
        this.dropCachedRows();
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

        //if we already know how many rows there are
        if (this.totalKnown && !this.elasticChunks) {
            if (fromIndex >= this.total) {
                return Promise.resolve([]);
            }

            if (endIndex > this.total) {
                endIndex = this.total;
            }
        }

        if (this.isInMemory && endIndex > this.cache.prefixLength()) {
            endIndex = this.cache.prefixLength();
        }

        if (!(endIndex > fromIndex)) {
            return Promise.resolve([]);
        }

        const rows = this.cache.slice(fromIndex, endIndex);
        if (rows !== null) {
            return Promise.resolve(rows);
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

        const windows = this.planLoadWindows(fromIndex, endIndex);
        const generation = this.generation;

        let chain: Promise<void> = Promise.resolve();
        windows.forEach((window, index) => {
            const withTotal = needTotal && index === 0;
            chain = chain.then(() => this.loadWindow(window, withTotal, generation));
        });

        return chain.then(() => {
            if (generation !== this.generation) {
                return [];
            }

            this.cache.evict(this.maxCachedWindows);
            this.fireUpdated();

            // the loader may have returned fewer rows than asked for,
            // so we hand out everything that is actually there
            return this.cache.sliceAvailable(fromIndex, endIndex);
        });
    }

    /**
     * Splits the missing parts of [from, to) into the windows to request.
     *
     * A window is aligned to `chunkSize` and is never smaller than it, which
     * keeps the requests reproducible: reading any row of the same chunk asks
     * for the very same window, so it is loaded once and reused afterwards.
     */
    private planLoadWindows(from: number, to: number): LoadWindow[] {
        const windows: LoadWindow[] = [];
        const chunk = this._chunkSize > 0 ? this._chunkSize : 1;

        let cursor = from;
        while (cursor < to) {
            const gaps = this.cache.findGaps(cursor, to);
            if (gaps.length === 0) {
                break;
            }

            const gap = gaps[0];
            const alignedStart = Math.floor(gap.start / chunk) * chunk;
            const windowEnd = Math.max(
                alignedStart + chunk,
                Math.ceil(gap.end / chunk) * chunk
            );

            // Do not ask again for the rows we already have at the head of the
            // window - start from the first one that is really missing.
            const inner = this.cache.findGaps(alignedStart, windowEnd);
            const windowStart = inner.length > 0 ? inner[0].start : gap.start;

            windows.push({ offset: windowStart, limit: windowEnd - windowStart });
            cursor = windowEnd;
        }

        return windows;
    }

    /** Loads one window, reusing the request when the same one is already in flight. */
    private loadWindow(window: LoadWindow, needTotal: boolean, generation: number): Promise<void> {
        const key = `${window.offset}:${window.limit}:${generation}`;

        const pending = this.pendingLoads.get(key);
        if (pending) {
            return pending;
        }

        const promise = this.loader.loadChunk({
            offset: window.offset,
            limit: window.limit,
            needTotal: needTotal
        })
        .then(result => {
            this.pendingLoads.delete(key);

            // the rows were dropped while this chunk was on its way
            if (generation !== this.generation) {
                return;
            }

            if (needTotal) {
                this.total = result.total;
                this.totalKnown = true;
            }

            const rows = result.table.getCachedRows();
            this.cache.addRange(window.offset, rows);

            if (this.elasticChunks && rows.length < window.limit) {
                // a short chunk means the end of the data has been reached
                this.total = this.cache.prefixLength();
            }
        },
        error => {
            this.pendingLoads.delete(key);
            throw error;
        });

        this.pendingLoads.set(key, promise);
        return promise;
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
        this.totalKnown = true;
    }

    /**
     * The number of rows loaded in one uninterrupted run from the very first one.
     * Rows of a detached window (loaded after a jump over not yet loaded ones)
     * are not counted here - see {@link getCachedRows}.
     */
    public getCachedCount(): number {
        return this.cache.prefixLength();
    }

    public clear() {
        this.columns.clear();
        this.total = 0;
        this.needTotal = !this._elasticChunks;
        this.dropCachedRows();
        this.fireUpdated();
    }

    /** Forgets all the cached rows and the chunk requests that are on their way. */
    private dropCachedRows() {
        this.cache.clear();
        this.pendingLoads.clear();
        this.totalKnown = false;
        this.generation++;
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

        this.cache.append(newRow);
        const cachedTotal = this.getCachedCount();
        if (cachedTotal > this.total) {
            this.total = cachedTotal;
        }

        return newRow;
    }

    /**
     * The rows loaded in one uninterrupted run from the very first one.
     *
     * Only that run is exposed: the array must stay gap-free and in order,
     * as it is walked from the beginning by the code that groups rows and
     * calculates the totals over them.
     */
    public getCachedRows(): DataRow[] {
        return this.cache.prefixRows();
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
