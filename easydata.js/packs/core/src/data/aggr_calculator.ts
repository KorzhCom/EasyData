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
}

export interface GroupData {
    name?: string;
    columns: Array<string>;
    aggregates: Array<{colId: string, funcId: string}>;
}

export interface AggregationColumnStore {
    getColumnsBefore(colId: string): string[];
    validAggregate(colId: string, funcId: string);
}

export class AggregateSettings {

    private aggregates: Array<{ colId: string, funcId: string }> = []

    private groups: GroupData[] = [];

    private useGrandTotals = false;

    constructor(private colStore: AggregationColumnStore) {

    }

    public addGroup(colId: string, settings?: GroupSettings) {
        const cols = this.colStore.getColumnsBefore(colId);
        if (this.hasGroups()) {
            if (this.lastGroup().columns.length > cols.length) {
                throw "Invalid group of columns";
            }
        }

        this.groups.push({ columns: cols, aggregates: null, ...settings })
        return this;
    }

    public addAggregateColumn(colId: string, funcId: string) {
        if (!this.colStore.validAggregate(colId, funcId))
            throw "Invalid aggregate function for such column";

        this.aggregates.push({ colId, funcId });
        return this;
    }

    public addGrandTotals() {
        this.useGrandTotals = true;
        return this;
    }

    public getGroups() {
        return this.groups.map(g => {
            g.aggregates = this.aggregates;
            return g;
        })
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
        return this.useGrandTotals && this.hasAggregates();
    }

    public drop() {
        this.groups = [];
        this.aggregates = [];
    }

}