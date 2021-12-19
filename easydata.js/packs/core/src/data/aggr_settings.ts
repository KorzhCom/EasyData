import { DataGroup, DataAggregate, AggregationColumnStore, GroupDescriptor } from './aggr_structures'
import { DataRow } from "./data_row";

/**
 * Represents AggregationSettings structure prepared for saving into a storage.
 */
export interface AggregationSettingsData {
    groups: Array<DataGroup>,
    ugt: boolean;
    urc: boolean;
    csg: boolean;
    aggregates: Array<DataAggregate>;
}

/**
 * Defines aggregations settings for the current context.
 * Group, aggregate columns, grand totals, etc.
 */
export class AggregationSettings {
    public readonly COUNT_FIELD_NAME: string;
     
    private aggregates: Array<DataAggregate> = []

    private groups: DataGroup[] = [];

    private useGrandTotals = false;

    private useRecordCount = false;

    public caseSensitiveGroups = false;

    constructor(private colStore: AggregationColumnStore) {
        this.COUNT_FIELD_NAME = 'GRPRECCNT';
    }

    public addGroup(settings: GroupDescriptor) {
        const cols = settings.columns || this.colStore.getColumnIds(settings.from, settings.to);
        if (!this.colStore.validateColumns(cols))
            throw "Invalid columns: " + cols;

        if (this.hasColumnsInUse(cols))
            throw "Can't add same columns to different groups/aggregates";

        this.groups.push({ columns: cols, ...settings })
        return this;
    }

    public addAggregateColumn(colIndexOrId: number | string, funcId: string) {
        const colId = typeof colIndexOrId == 'string'
            ? colIndexOrId
            : this.colStore.getColumnIds(colIndexOrId, colIndexOrId)[0];

        if (this.hasColumnsInUse([colId]) || !this.colStore.validateAggregate(colId, funcId))
            throw 'Invalid aggregation function for the column: ' + colId;

        this.aggregates.push({ colId, funcId });
        return this;
    }

    public addGrandTotals() {
        this.useGrandTotals = true;
        return this;
    }

    public addCounts() {
        this.useRecordCount = true;
        return this;
    }

    public getGroups() {
        let cols = [];
        const mappedGrops = this.groups.map(grp => {
            cols = cols.concat(grp.columns);
            return {
                ...grp,
                columns: Array.from(cols),
                aggregates: Array.from(this.aggregates)
            };
        });

        return mappedGrops;
    }

    public getInternalGroups() {
        return this.groups;
    }

    public lastGroup() {
        const groups = this.getGroups();
        return groups[groups.length - 1];
    }

    public getAggregates(): Array<DataAggregate> {
        return this.aggregates;
    }

    public hasAggregates(): boolean {
        return this.aggregates.length > 0;
    }

    public hasGroups(): boolean {
        return this.groups.length > 0;
    }

    public hasGrandTotals(): boolean {
        return this.useGrandTotals;
    }

    public hasRecordCount(): boolean {
        return this.useRecordCount;
    }

    public isEmpty(): boolean {
        return !(this.hasAggregates() || this.hasGroups() || 
                 this.hasAggregates() || this.hasRecordCount());
    }

    public drop() {
        console.warn('"drop()" method is obsolete. Use "clear()" instead');
        this.clear();
    }

    public clear() {
        this.groups = [];
        this.aggregates = [];
        this.useGrandTotals = false;
        this.useRecordCount = false;
        this.caseSensitiveGroups = false;
        return this;
    }

    /**
     * Checks if all columns from the list passed in the parameter are "unused".
     * Here "unused column" means a column that is included neither in any group nor in the aggregates list.
     * @param cols - the array of column IDs
     * @returns true if all columns in the list are not used anywhere, othervise - fals 
     */
    private hasColumnsInUse(cols: string[]): boolean {
        for (const group of this.groups) {
            const interCols = group.columns
                .filter(c => cols.indexOf(c) >= 0);

            if (interCols.length > 0)
                return true;
        }

        for(const aggr of this.aggregates) {
            if (cols.indexOf(aggr.colId) >= 0)
                return true;
        }

        return false;
    }

    public needAggrCalculation() : boolean {
        return (this.hasAggregates() || this.hasRecordCount())
                && (this.hasGrandTotals() || this.hasGroups());
    }

    public saveToData(): AggregationSettingsData {
        return {
            groups: Array.from(this.groups),
            ugt: this.useGrandTotals,
            urc: this.useRecordCount,
            csg: this.caseSensitiveGroups,
            aggregates: Array.from(this.aggregates)
        }
    }

    public loadFromData(data: AggregationSettingsData) {
        if (data) {
            if (typeof data.ugt !== 'undefined') this.useGrandTotals = data.ugt;
            if (typeof data.urc !== 'undefined') this.useRecordCount = data.urc;
            if (typeof data.csg !== 'undefined') this.caseSensitiveGroups = data.csg;

            if (data.groups) {
                this.groups = Array.from(data.groups);
            }

            if (data.aggregates) {
                this.aggregates = Array.from(data.aggregates);
            }
        }
    }

    public buildGroupKey(group: DataGroup, row: DataRow) {
        const caseInsensitive = !this.caseSensitiveGroups;
        let result: any = {}
        for (const colId of group.columns) {
            let keyVal = row.getValue(colId);
            if (caseInsensitive && typeof(keyVal) === 'string') {
                keyVal = keyVal.toLowerCase();
            }
            result[colId] = keyVal;
        }
        return result;
    }
}