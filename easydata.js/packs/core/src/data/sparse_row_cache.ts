import { DataRow } from './data_row';

/**
 * A contiguous run of rows held in the cache.
 * `start` is the global (table-wide) index of the first row in `rows`.
 */
export interface RowSegment {
    start: number;
    rows: DataRow[];

    /** Monotonic counter used to pick eviction victims (bigger = used more recently). */
    touchedAt: number;
}

/** A half-open range of global row indexes: [start, end). */
export interface RowRange {
    start: number;
    end: number;
}

/**
 * Stores rows loaded from a data source as a set of disjoint segments,
 * so the rows for a distant page can be kept without loading everything
 * that precedes them.
 *
 * The segments are always sorted by `start` and never overlap or even touch:
 * as soon as two of them become adjacent they are merged into one. That
 * invariant has two useful consequences:
 *
 * - any range that is fully loaded lies inside a single segment, so
 *   {@link slice} never has to stitch several segments together;
 * - when rows are loaded sequentially from the very beginning (which is what
 *   happens in most scenarios) there is exactly one segment starting at 0.
 *
 * The latter is what {@link prefixRows} returns - the part of the data that
 * is guaranteed to be gap-free and in order.
 */
export class SparseRowCache {
    private segments: RowSegment[] = [];

    private tick = 0;

    /** The number of segments the rows are split into. */
    public get segmentCount(): number {
        return this.segments.length;
    }

    /** Returns the loaded ranges. Mostly useful for diagnostics and tests. */
    public getRanges(): RowRange[] {
        return this.segments.map(seg => ({
            start: seg.start,
            end: seg.start + seg.rows.length
        }));
    }

    /**
     * The contiguous run of rows that starts at index 0,
     * or an empty array when row 0 is not loaded.
     *
     * The returned array is the live internal storage - the same way the old
     * contiguous cache exposed it - so callers must treat it as read-only.
     * Its identity is preserved while the prefix grows forward.
     */
    public prefixRows(): DataRow[] {
        const first = this.segments[0];
        return (first && first.start === 0) ? first.rows : [];
    }

    /** The number of rows in the gap-free run starting at index 0. */
    public prefixLength(): number {
        const first = this.segments[0];
        return (first && first.start === 0) ? first.rows.length : 0;
    }

    /** The total number of rows held in all segments. */
    public rowCount(): number {
        let count = 0;
        for (const seg of this.segments) {
            count += seg.rows.length;
        }
        return count;
    }

    /**
     * Returns the rows for [from, to) or `null` when at least one of them
     * is not loaded yet.
     */
    public slice(from: number, to: number): DataRow[] | null {
        if (to <= from) {
            return [];
        }

        const seg = this.findSegment(from);
        if (!seg || to > seg.start + seg.rows.length) {
            return null;
        }

        seg.touchedAt = ++this.tick;
        return seg.rows.slice(from - seg.start, to - seg.start);
    }

    /**
     * Returns the rows from `from` up to `to`, stopping at the first gap.
     * Returns an empty array when `from` itself is not loaded.
     *
     * This is what a read falls back to after a load returned fewer rows than
     * asked for - the caller gets everything that is actually there.
     */
    public sliceAvailable(from: number, to: number): DataRow[] {
        if (to <= from) {
            return [];
        }

        const seg = this.findSegment(from);
        if (!seg) {
            return [];
        }

        seg.touchedAt = ++this.tick;
        const end = Math.min(to, seg.start + seg.rows.length);
        return seg.rows.slice(from - seg.start, end - seg.start);
    }

    /** Returns the sub-ranges of [from, to) that are not loaded yet, in ascending order. */
    public findGaps(from: number, to: number): RowRange[] {
        const gaps: RowRange[] = [];
        let cursor = from;

        for (const seg of this.segments) {
            if (cursor >= to) {
                break;
            }

            const segStart = seg.start;
            const segEnd = seg.start + seg.rows.length;

            if (segEnd <= cursor) {
                continue;
            }
            if (segStart >= to) {
                break;
            }

            if (segStart > cursor) {
                gaps.push({ start: cursor, end: Math.min(segStart, to) });
            }
            cursor = Math.max(cursor, segEnd);
        }

        if (cursor < to) {
            gaps.push({ start: cursor, end: to });
        }

        return gaps;
    }

    /**
     * Puts `rows` into the cache at the global index `start`, merging the
     * result with every segment it overlaps or touches.
     * On overlap the incoming rows win, as they come from a fresher read.
     */
    public addRange(start: number, rows: DataRow[]): void {
        if (!rows || rows.length === 0) {
            return;
        }

        const end = start + rows.length;

        // Every segment that overlaps [start, end) or is merely adjacent to it.
        // Anything between the first and the last such segment is necessarily
        // in that set too, so the union is always contiguous.
        let firstIdx = -1;
        let lastIdx = -1;
        for (let i = 0; i < this.segments.length; i++) {
            const seg = this.segments[i];
            if (seg.start <= end && start <= seg.start + seg.rows.length) {
                if (firstIdx < 0) {
                    firstIdx = i;
                }
                lastIdx = i;
            }
        }

        if (firstIdx < 0) {
            this.insertSorted({ start: start, rows: rows.slice(), touchedAt: ++this.tick });
            return;
        }

        const first = this.segments[firstIdx];
        const last = this.segments[lastIdx];
        const newStart = Math.min(start, first.start);
        const newEnd = Math.max(end, last.start + last.rows.length);

        // Reuse the first segment's array when it already begins at the merged
        // start. This keeps the array identity stable for the usual case of a
        // prefix growing forward, which is what prefixRows() hands out.
        const target: RowSegment = (first.start === newStart)
            ? first
            : { start: newStart, rows: [], touchedAt: 0 };

        const merged = target.rows;

        for (let i = firstIdx; i <= lastIdx; i++) {
            const seg = this.segments[i];
            if (seg === target) {
                continue;
            }
            const offset = seg.start - newStart;
            for (let j = 0; j < seg.rows.length; j++) {
                merged[offset + j] = seg.rows[j];
            }
        }

        const offset = start - newStart;
        for (let j = 0; j < rows.length; j++) {
            merged[offset + j] = rows[j];
        }

        merged.length = newEnd - newStart;
        target.start = newStart;
        target.touchedAt = ++this.tick;

        this.segments.splice(firstIdx, lastIdx - firstIdx + 1, target);
    }

    /** Appends one row right after the end of the prefix. */
    public append(row: DataRow): void {
        const first = this.segments[0];
        if (first && first.start === 0) {
            const next = this.segments[1];
            // Push in place unless the prefix is about to touch the next
            // segment - in that case the two have to be merged.
            if (!next || first.rows.length + 1 < next.start) {
                first.rows.push(row);
                first.touchedAt = ++this.tick;
                return;
            }
        }

        this.addRange(this.prefixLength(), [row]);
    }

    /**
     * Drops the least recently used segments until no more than `maxSegments`
     * are left. The prefix is never evicted: it is the part other components
     * read directly, and re-reading it would mean loading everything again.
     * A non-positive `maxSegments` means "no limit".
     */
    public evict(maxSegments: number): void {
        if (maxSegments <= 0) {
            return;
        }

        while (this.segments.length > maxSegments) {
            let victimIdx = -1;
            for (let i = 0; i < this.segments.length; i++) {
                if (this.segments[i].start === 0) {
                    continue;
                }
                if (victimIdx < 0 || this.segments[i].touchedAt < this.segments[victimIdx].touchedAt) {
                    victimIdx = i;
                }
            }

            if (victimIdx < 0) {
                break; // nothing but the prefix left
            }

            this.segments.splice(victimIdx, 1);
        }
    }

    public clear(): void {
        this.segments = [];
    }

    private findSegment(index: number): RowSegment | null {
        let low = 0;
        let high = this.segments.length - 1;

        while (low <= high) {
            const mid = (low + high) >> 1;
            const seg = this.segments[mid];
            if (index < seg.start) {
                high = mid - 1;
            }
            else if (index >= seg.start + seg.rows.length) {
                low = mid + 1;
            }
            else {
                return seg;
            }
        }

        return null;
    }

    private insertSorted(seg: RowSegment): void {
        let index = this.segments.length;
        for (let i = 0; i < this.segments.length; i++) {
            if (this.segments[i].start > seg.start) {
                index = i;
                break;
            }
        }
        this.segments.splice(index, 0, seg);
    }
}
