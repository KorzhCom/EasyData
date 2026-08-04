import { expect } from "@olton/latte";

import { EasyDataTable } from '../src/data/easy_data_table';
import { DataLoader, DataChunk, ChunkInfo } from '../src/data/data_loader';
import { DataColumnDescriptor } from '../src/data/data_column';
import { DataType } from '../src/types/data_type';

const columns: DataColumnDescriptor[] = [
    { id: 'id', label: 'ID', type: DataType.Int32 },
    { id: 'name', label: 'Name', type: DataType.String }
];

/** A loader over a virtual data set of `totalRows` rows that records every request it gets. */
class RecordingLoader implements DataLoader {
    public calls: ChunkInfo[] = [];

    constructor(private totalRows: number) { }

    public loadChunk(chunk: ChunkInfo): Promise<DataChunk> {
        this.calls.push({ offset: chunk.offset, limit: chunk.limit, needTotal: chunk.needTotal });

        const from = chunk.offset;
        const to = Math.min(from + chunk.limit, this.totalRows);

        const rows: any[] = [];
        for (let i = from; i < to; i++) {
            rows.push({ id: i, name: 'row' + i });
        }

        return Promise.resolve({
            table: new EasyDataTable({ columns: columns, rows: rows }),
            total: this.totalRows
        });
    }
}

function idsOf(rows: any[]): number[] {
    return rows.map(r => r.getValue('id'));
}

describe('EasyDataTable (sparse cache)', () => {

    it('should load only the window around a distant row', () => {
        const loader = new RecordingLoader(100000);
        const table = new EasyDataTable({ columns: columns, loader: loader, chunkSize: 1000 });

        return table.getRows({ offset: 50000, limit: 30 }).then(rows => {
            expect(rows.length).toBe(30);
            expect(rows[0].getValue('id')).toBe(50000);

            // the whole point: one chunk, not everything from row 0
            expect(loader.calls.length).toBe(1);
            expect(loader.calls[0].offset).toBe(50000);
            expect(loader.calls[0].limit).toBe(1000);
        });
    });

    it('should ask the total only on the very first request', () => {
        const loader = new RecordingLoader(100000);
        const table = new EasyDataTable({ columns: columns, loader: loader, chunkSize: 1000 });

        return table.getRows({ offset: 0, limit: 10 })
            .then(() => table.getRows({ offset: 5000, limit: 10 }))
            .then(() => {
                expect(loader.calls.length).toBe(2);
                expect(loader.calls[0].needTotal).toBeTrue();
                expect(loader.calls[1].needTotal).toBeFalse();
                expect(table.getTotal()).toBe(100000);
            });
    });

    it('should serve a repeated read of a loaded window from the cache', () => {
        const loader = new RecordingLoader(100000);
        const table = new EasyDataTable({ columns: columns, loader: loader, chunkSize: 1000 });

        return table.getRows({ offset: 50000, limit: 30 })
            .then(() => table.getRows({ offset: 50010, limit: 10 }))
            .then(rows => {
                expect(idsOf(rows)).toBeArrayEqual([50010, 50011, 50012, 50013, 50014,
                    50015, 50016, 50017, 50018, 50019]);
                expect(loader.calls.length).toBe(1); // nothing new was requested
            });
    });

    it('should reuse the loaded window when reading backwards inside it', () => {
        const loader = new RecordingLoader(100000);
        const table = new EasyDataTable({ columns: columns, loader: loader, chunkSize: 1000 });

        return table.getRows({ offset: 50500, limit: 30 })
            .then(() => table.getRows({ offset: 50100, limit: 30 }))
            .then(rows => {
                expect(rows[0].getValue('id')).toBe(50100);
                expect(loader.calls.length).toBe(1);
            });
    });

    it('should serve a read that crosses a chunk border', () => {
        const loader = new RecordingLoader(100000);
        const table = new EasyDataTable({ columns: columns, loader: loader, chunkSize: 1000 });

        // 990..1020 spans the border between the first and the second chunk
        return table.getRows({ offset: 990, limit: 31 }).then(rows => {
            expect(rows.length).toBe(31);
            expect(rows[0].getValue('id')).toBe(990);
            expect(rows[10].getValue('id')).toBe(1000);
            expect(rows[30].getValue('id')).toBe(1020);

            // both chunks come in a single request
            expect(loader.calls.length).toBe(1);
            expect(loader.calls[0].offset).toBe(0);
            expect(loader.calls[0].limit).toBe(2000);
        });
    });

    it('should request only the missing chunk when the read crosses the loaded border', () => {
        const loader = new RecordingLoader(100000);
        const table = new EasyDataTable({ columns: columns, loader: loader, chunkSize: 1000 });

        return table.getRows({ offset: 0, limit: 10 })
            .then(() => table.getRows({ offset: 990, limit: 31 }))
            .then(rows => {
                expect(rows.length).toBe(31);
                expect(loader.calls.length).toBe(2);
                expect(loader.calls[1].offset).toBe(1000); // not from 0 again
                expect(loader.calls[1].limit).toBe(1000);
            });
    });

    it('should keep a detached window out of the cached rows', () => {
        const loader = new RecordingLoader(100000);
        const table = new EasyDataTable({ columns: columns, loader: loader, chunkSize: 1000 });

        return table.getRows({ offset: 0, limit: 10 })
            .then(() => table.getRows({ offset: 50000, limit: 10 }))
            .then(() => {
                // the rows walked by the aggregate calculators must stay gap-free,
                // so the detached window is not part of them
                expect(table.getCachedCount()).toBe(1000);
                expect(table.getCachedRows().length).toBe(1000);
                expect(idsOf(table.getCachedRows().slice(0, 3))).toBeArrayEqual([0, 1, 2]);
            });
    });

    it('should grow the cached rows when the windows join up', () => {
        const loader = new RecordingLoader(100000);
        const table = new EasyDataTable({ columns: columns, loader: loader, chunkSize: 1000 });

        return table.getRows({ offset: 0, limit: 10 })
            .then(() => table.getRows({ offset: 1000, limit: 10 }))
            .then(() => {
                expect(table.getCachedCount()).toBe(2000);
                expect(table.getCachedRows()[1500].getValue('id')).toBe(1500);
            });
    });

    it('should collapse concurrent reads of the same window into one request', () => {
        const loader = new RecordingLoader(100000);
        const table = new EasyDataTable({ columns: columns, loader: loader, chunkSize: 1000 });

        const first = table.getRows({ offset: 0, limit: 10 });
        const second = table.getRows({ offset: 0, limit: 10 });

        return Promise.all([first, second]).then(results => {
            expect(loader.calls.length).toBe(1);
            expect(results[0].length).toBe(10);
            expect(results[1].length).toBe(10);
        });
    });

    it('should load a single distant row through its window', () => {
        const loader = new RecordingLoader(100000);
        const table = new EasyDataTable({ columns: columns, loader: loader, chunkSize: 1000 });

        return table.getRow(5000).then(row => {
            expect(row).not.toBeNull();
            expect(row.getValue('id')).toBe(5000);
            expect(loader.calls[0].offset).toBe(5000);
            expect(loader.calls[0].limit).toBe(1000);
        });
    });

    it('should return the rows that are really there when the source runs out', () => {
        const loader = new RecordingLoader(1200);
        const table = new EasyDataTable({ columns: columns, loader: loader, chunkSize: 1000 });

        return table.getRows({ offset: 1000, limit: 500 }).then(rows => {
            expect(rows.length).toBe(200); // 1000..1199
            expect(rows[199].getValue('id')).toBe(1199);
        });
    });

    it('should detect the end of the data on a short chunk in the elastic mode', () => {
        const loader = new RecordingLoader(2500);
        const table = new EasyDataTable({
            columns: columns,
            loader: loader,
            chunkSize: 1000,
            elasticChunks: true
        });

        return table.getRows({ offset: 0, limit: 10 })
            .then(() => {
                expect(table.totalIsKnown()).toBeFalse();
                return table.getRows({ offset: 1000, limit: 10 });
            })
            .then(() => {
                expect(table.totalIsKnown()).toBeFalse();
                return table.getRows({ offset: 2000, limit: 10 });
            })
            .then(() => {
                expect(table.getTotal()).toBe(2500);
                expect(table.totalIsKnown()).toBeTrue();
            });
    });

    it('should drop the least recently used windows but keep the cached rows', () => {
        const loader = new RecordingLoader(100000);
        const table = new EasyDataTable({
            columns: columns,
            loader: loader,
            chunkSize: 1000,
            maxCachedWindows: 2
        });

        return table.getRows({ offset: 0, limit: 10 })
            .then(() => table.getRows({ offset: 10000, limit: 10 }))
            .then(() => table.getRows({ offset: 20000, limit: 10 }))
            .then(() => table.getRows({ offset: 30000, limit: 10 }))
            .then(() => {
                // the run from the first row survives every eviction
                expect(table.getCachedCount()).toBe(1000);

                // the window dropped in between has to be loaded again
                const callsBefore = loader.calls.length;
                return table.getRows({ offset: 10000, limit: 10 }).then(rows => {
                    expect(rows[0].getValue('id')).toBe(10000);
                    expect(loader.calls.length).toBe(callsBefore + 1);
                });
            });
    });

    it('should not merge a chunk that was requested before the table was cleared', () => {
        const loader = new RecordingLoader(100000);
        const table = new EasyDataTable({ columns: columns, loader: loader, chunkSize: 1000 });

        const pending = table.getRows({ offset: 0, limit: 10 });
        table.clear();

        return pending.then(rows => {
            expect(rows).toBeEmpty();
            expect(table.getCachedCount()).toBe(0);
            expect(table.getTotal()).toBe(0);
        });
    });
});
