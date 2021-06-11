import { DataRow } from './data_row';

export interface CalculateOptions {
    maxLevel?: number;
    resultsObtained?(level?: number);
}

export interface AggregatesCalculator {

    getAggregates(): AggregatesContainer;

    calculate(options?: CalculateOptions): Promise<void>;
}

export interface TotalsKey {
    [key: string]: any;
}

export interface TotalsValue {
    [key: string]: any;
}

type LevelData = Map<string, TotalsValue>;

export interface AggregatesContainer {

    setAggregates(level: number, data: LevelData);

    fillAggregates(level: number, row: DataRow): Promise<void>;

    getAggregates(level: number, key: TotalsKey): Promise<TotalsValue>;

}

export interface GroupSettings {
    name?: string;
    columns?: string[],
    from?: number;
    to?: number;
}

export interface GroupData {
    name?: string;
    columns: Array<string>;
    aggregates: Array<{colId: string, funcId: string}>;
}

export interface AggregationColumnStore {
    getColumnIds(from: number, to?: number): string[];
    validateColumns(colIds: string[]): boolean;
    validAggregate(colId: string, funcId: string): boolean;
}

export interface AggregateData {
    groups: Array<GroupData>,
    ugt: boolean;
    aggregates: Array<{ colId: string, funcId: string }>;
}

export class AggregateSettings {

    private aggregates: Array<{ colId: string, funcId: string }> = []

    private groups: GroupData[] = [];

    private useGrandTotals = false;

    constructor(private colStore: AggregationColumnStore) {

    }

    public addGroup(settings: GroupSettings) {
        const cols = settings.columns || this.colStore.getColumnIds(settings.from, settings.to);
        if (!this.colStore.validateColumns(cols) || !this.areUnusedColumns(cols))
            throw "Invalid group of columns";

        this.groups.push({ columns: cols, aggregates: null, ...settings })
        return this;
    }

    public addAggregateColumn(colIndexOrId: number | string, funcId: string) {
        const colId = typeof colIndexOrId == 'string'
            ? colIndexOrId
            : this.colStore.getColumnIds(colIndexOrId, colIndexOrId)[0];

        if (!this.areUnusedColumns([colId]) || !this.colStore.validAggregate(colId, funcId))
            throw "Invalid aggregate function for such column";

        this.aggregates.push({ colId, funcId });
        return this;
    }

    public addGrandTotals() {
        this.useGrandTotals = true;
        return this;
    }

    public getGroups() {
        let cols = [];
        const mappedGrops = this.groups.map(g => {
            cols = cols.concat(g.columns);
            return {
                ...g,
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

    public getAggregates(): Array<{ colId: string, funcId: string }> {
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

    public isEmpty(): boolean {
        return !(this.hasAggregates() || this.hasGroups() || this.hasAggregates());
    }

    public drop() {
        this.groups = [];
        this.aggregates = [];
        this.useGrandTotals = false;
    }

    private areUnusedColumns(cols: string[]): boolean {
        for(const group of this.groups) {
            const interCols = group.columns
                .filter(c => cols.indexOf(c) >= 0);

            if (interCols.length > 0)
                return false;
        }

        for(const aggr of this.aggregates) {
            if (cols.indexOf(aggr.colId) >= 0)
                return false;
        }

        return true;
    }

    public saveToData(): AggregateData {
        return {
            groups: Array.from(this.groups),
            ugt: this.useGrandTotals,
            aggregates: Array.from(this.aggregates)
        }
    }

    public loadFromData(data: AggregateData) {
        if (data) {
            this.useGrandTotals = data.ugt || false;

            if (data.groups) {
                this.groups = Array.from(data.groups);
            }

            if (data.aggregates) {
                this.aggregates = Array.from(data.aggregates);
            }
        }
    }

}