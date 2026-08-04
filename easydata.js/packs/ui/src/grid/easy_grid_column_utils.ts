/** Sort state of a grid column (independent of EasyQuery's SortDirection). */
export type GridColumnSortDirection = 'none' | 'asc' | 'desc';

/** Returns the next sort direction in the none -> asc -> desc -> none cycle. */
export function nextSortDirection(current: GridColumnSortDirection): GridColumnSortDirection {
    switch (current) {
        case 'none': return 'asc';
        case 'asc':  return 'desc';
        default:     return 'none';
    }
}

/** Computes a new column width from a drag delta, clamped to [minWidth, maxWidth]. */
export function computeColumnWidth(startWidth: number, deltaX: number, minWidth: number, maxWidth?: number): number {
    let width = startWidth + deltaX;
    if (width < minWidth) width = minWidth;
    if (typeof maxWidth === 'number' && width > maxWidth) width = maxWidth;
    return Math.round(width);
}
