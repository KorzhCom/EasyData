import { expect } from "@olton/latte";

import { SparseRowCache } from '../src/data/sparse_row_cache';
import { DataRow } from '../src/data/data_row';
import { DataColumnList } from '../src/data/data_column';

const columns = new DataColumnList();
columns.add({ id: 'id', label: 'ID' });

/** A row whose only value is the number passed in, so assertions can check identity by value. */
function rowOf(value: number): DataRow {
    return new DataRow(columns, [value]);
}

/** `count` rows valued `from`, `from + 1`, ... - i.e. rows that know their own global index. */
function rowsAt(from: number, count: number): DataRow[] {
    const result: DataRow[] = [];
    for (let i = 0; i < count; i++) {
        result.push(rowOf(from + i));
    }
    return result;
}

function rowsOf(values: number[]): DataRow[] {
    return values.map(v => rowOf(v));
}

function valuesOf(rows: DataRow[] | null): number[] {
    return (rows || []).map(r => r.getValue('id'));
}

describe('SparseRowCache', () => {

    it('should start empty', () => {
        const cache = new SparseRowCache();

        expect(cache.segmentCount).toBe(0);
        expect(cache.rowCount()).toBe(0);
        expect(cache.prefixLength()).toBe(0);
        expect(cache.prefixRows()).toBeEmpty();
        expect(cache.getRanges()).toBeEmpty();
    });

    it('should expose a range added at zero as the prefix', () => {
        const cache = new SparseRowCache();
        cache.addRange(0, rowsAt(0, 5));

        expect(cache.prefixLength()).toBe(5);
        expect(valuesOf(cache.prefixRows())).toBeArrayEqual([0, 1, 2, 3, 4]);
        expect(cache.rowCount()).toBe(5);
    });

    it('should not expose a detached range as the prefix', () => {
        const cache = new SparseRowCache();
        cache.addRange(100, rowsAt(100, 10));

        expect(cache.prefixLength()).toBe(0);
        expect(cache.prefixRows()).toBeEmpty();
        // the rows are held, they are just not reachable through the prefix
        expect(cache.rowCount()).toBe(10);
        expect(valuesOf(cache.slice(100, 103))).toBeArrayEqual([100, 101, 102]);
    });

    it('should keep disjoint ranges as separate segments', () => {
        const cache = new SparseRowCache();
        cache.addRange(0, rowsAt(0, 10));
        cache.addRange(100, rowsAt(100, 10));

        expect(cache.segmentCount).toBe(2);
        expect(cache.getRanges()).toBeDeepEqual([
            { start: 0, end: 10 },
            { start: 100, end: 110 }
        ]);
    });

    it('should keep segments sorted no matter in which order they arrive', () => {
        const cache = new SparseRowCache();
        cache.addRange(200, rowsAt(200, 5));
        cache.addRange(0, rowsAt(0, 5));
        cache.addRange(100, rowsAt(100, 5));

        expect(cache.getRanges()).toBeDeepEqual([
            { start: 0, end: 5 },
            { start: 100, end: 105 },
            { start: 200, end: 205 }
        ]);
    });

    it('should merge adjacent ranges', () => {
        const cache = new SparseRowCache();
        cache.addRange(0, rowsAt(0, 10));
        cache.addRange(10, rowsAt(10, 10));

        expect(cache.segmentCount).toBe(1);
        expect(cache.prefixLength()).toBe(20);
        expect(valuesOf(cache.slice(8, 12))).toBeArrayEqual([8, 9, 10, 11]);
    });

    it('should merge overlapping ranges preferring the incoming rows', () => {
        const cache = new SparseRowCache();
        cache.addRange(0, rowsOf([0, 1, 2, 3, 4]));
        cache.addRange(3, rowsOf([300, 400, 500]));

        expect(cache.segmentCount).toBe(1);
        expect(cache.rowCount()).toBe(6);
        expect(valuesOf(cache.slice(0, 6))).toBeArrayEqual([0, 1, 2, 300, 400, 500]);
    });

    it('should merge across a segment enclosed by the new range', () => {
        const cache = new SparseRowCache();
        cache.addRange(0, rowsAt(0, 5));
        cache.addRange(20, rowsAt(20, 5));

        // spans the gap and reaches into both existing segments
        cache.addRange(3, rowsAt(3, 20));

        expect(cache.segmentCount).toBe(1);
        expect(cache.getRanges()).toBeDeepEqual([{ start: 0, end: 25 }]);
        expect(cache.prefixLength()).toBe(25);
        expect(valuesOf(cache.slice(0, 25))).toBeArrayEqual(rowsAt(0, 25).map(r => r.getValue('id')));
    });

    it('should keep the prefix array identity while the prefix grows', () => {
        const cache = new SparseRowCache();
        cache.addRange(0, rowsAt(0, 5));

        const before = cache.prefixRows();
        cache.addRange(5, rowsAt(5, 5));

        // consumers hold on to this array, so growing must not replace it
        expect(cache.prefixRows()).toBe(before);
        expect(before.length).toBe(10);
    });

    it('should report the gaps of a range', () => {
        const cache = new SparseRowCache();
        cache.addRange(10, rowsAt(10, 10));
        cache.addRange(40, rowsAt(40, 10));

        expect(cache.findGaps(0, 60)).toBeDeepEqual([
            { start: 0, end: 10 },
            { start: 20, end: 40 },
            { start: 50, end: 60 }
        ]);
    });

    it('should report only the gaps inside the requested range', () => {
        const cache = new SparseRowCache();
        cache.addRange(10, rowsAt(10, 10));
        cache.addRange(40, rowsAt(40, 10));

        expect(cache.findGaps(15, 45)).toBeDeepEqual([{ start: 20, end: 40 }]);
    });

    it('should report no gaps for a fully loaded range', () => {
        const cache = new SparseRowCache();
        cache.addRange(10, rowsAt(10, 10));

        expect(cache.findGaps(10, 20)).toBeEmpty();
        expect(cache.findGaps(12, 18)).toBeEmpty();
    });

    it('should slice inside a segment', () => {
        const cache = new SparseRowCache();
        cache.addRange(100, rowsAt(100, 10));

        expect(valuesOf(cache.slice(102, 105))).toBeArrayEqual([102, 103, 104]);
    });

    it('should return null when the requested range is not fully loaded', () => {
        const cache = new SparseRowCache();
        cache.addRange(10, rowsAt(10, 10));
        cache.addRange(40, rowsAt(40, 10));

        expect(cache.slice(15, 45)).toBeNull();  // spans the gap
        expect(cache.slice(0, 5)).toBeNull();    // nothing loaded there
        expect(cache.slice(15, 25)).toBeNull();  // runs past the segment end
    });

    it('should return an empty array for an empty range', () => {
        const cache = new SparseRowCache();

        expect(cache.slice(5, 5)).toBeEmpty();
        expect(cache.slice(9, 4)).toBeEmpty();
    });

    it('should ignore an empty range being added', () => {
        const cache = new SparseRowCache();
        cache.addRange(0, []);

        expect(cache.segmentCount).toBe(0);
    });

    it('should append a row to the prefix', () => {
        const cache = new SparseRowCache();
        cache.addRange(0, rowsAt(0, 3));
        cache.append(rowOf(3));

        expect(cache.prefixLength()).toBe(4);
        expect(valuesOf(cache.slice(0, 4))).toBeArrayEqual([0, 1, 2, 3]);
    });

    it('should append to an empty cache', () => {
        const cache = new SparseRowCache();
        cache.append(rowOf(0));

        expect(cache.prefixLength()).toBe(1);
        expect(cache.segmentCount).toBe(1);
    });

    it('should merge on append when the prefix reaches the next segment', () => {
        const cache = new SparseRowCache();
        cache.addRange(0, rowsAt(0, 5));
        cache.addRange(6, rowsAt(6, 4));

        cache.append(rowOf(5)); // closes the one-row hole at index 5

        expect(cache.segmentCount).toBe(1);
        expect(cache.prefixLength()).toBe(10);
        expect(valuesOf(cache.slice(0, 10))).toBeArrayEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should evict the least recently used segment', () => {
        const cache = new SparseRowCache();
        cache.addRange(100, rowsAt(100, 10));
        cache.addRange(200, rowsAt(200, 10));
        cache.addRange(300, rowsAt(300, 10));

        cache.slice(100, 110); // makes the first segment the most recently used
        cache.evict(2);

        expect(cache.getRanges()).toBeDeepEqual([
            { start: 100, end: 110 },
            { start: 300, end: 310 }
        ]);
    });

    it('should never evict the prefix', () => {
        const cache = new SparseRowCache();
        cache.addRange(0, rowsAt(0, 10));
        cache.addRange(100, rowsAt(100, 10));
        cache.addRange(200, rowsAt(200, 10));

        cache.evict(1);

        expect(cache.segmentCount).toBe(1);
        expect(cache.prefixLength()).toBe(10);
    });

    it('should treat a non-positive segment limit as unlimited', () => {
        const cache = new SparseRowCache();
        cache.addRange(100, rowsAt(100, 10));
        cache.addRange(200, rowsAt(200, 10));

        cache.evict(0);
        expect(cache.segmentCount).toBe(2);

        cache.evict(-1);
        expect(cache.segmentCount).toBe(2);
    });

    it('should clear everything', () => {
        const cache = new SparseRowCache();
        cache.addRange(0, rowsAt(0, 10));
        cache.addRange(100, rowsAt(100, 10));

        cache.clear();

        expect(cache.segmentCount).toBe(0);
        expect(cache.rowCount()).toBe(0);
        expect(cache.prefixLength()).toBe(0);
    });
});
