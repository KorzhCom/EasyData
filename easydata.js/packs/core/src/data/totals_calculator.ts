import { DataRow } from './data_row';

export interface CalculateOptions {
    maxLevel?: number;
    resultsObtained?(level?: number);
}

export interface TotalsCalculator {

    getTotals(): TotalsContainer;

    calculate(options?: CalculateOptions): Promise<void>;
}

export interface TotalsValue {
    [key: string]: any;
}

type LevelData = Map<string, TotalsValue>;

export interface TotalsContainer {

    setTotals(level: number, data: LevelData);

    fillTotals(level: number, row: DataRow): Promise<void>;
}

export interface GroupSettings {
    name?: string;
}

export interface GroupData {
    name?: string;
    columns: Array<string>;
    aggregates?: Array<{colId: string, funcId: string}>;
}

export interface ColumnStore {
    getColumnsBefore(colId: string): string[];
    validAggregate(colId: string, funcId: string);
}

export class TotalsSettings {

    private levels: { [index: number]: GroupData } = {};
    private aggregates: Array<{ colId: string, funcId: string }> = []

    private lc = 0;

    constructor(private colStore: ColumnStore) {

    }

    public addGroup(colId: string, settings?: GroupSettings) {
        const cols = this.colStore.getColumnsBefore(colId);
        if (this.levels[this.lc] && this.levels[this.lc].columns.length > cols.length)
            throw "Invalid group of columns";

        this.levels[++this.lc] = { columns: cols, ...settings };
        return this;
    }

    public addAggregateColumn(colId: string, funcId: string) {
        if (!this.colStore.validAggregate(colId, funcId))
            throw "Invalid aggregate function for such column";

        this.aggregates.push({ colId, funcId });
        return this;
    }

    public addGrandTotals() {
        this.levels[0] = { columns: [] };
        return this;
    }

    public getGroupLevels() {
        const levels = this.levels;
        for(const num in levels) {
            levels[num].aggregates = this.aggregates;
        }
        return levels;
    }

    public lastGroupLevel() {
        return this.getGroupLevels()[this.lc];
    }

    public getAggregates(): Array<{ colId: string, funcId: string }> {
        return this.aggregates;
    }

    public hasAggregates(): boolean {
        return this.aggregates.length > 0;
    }

    public hasGroups(): boolean {
        return Object.keys(this.levels).length > 0;
    }

    public drop() {
        this.levels = {};
        this.aggregates = [];
        this.lc = 0;
    }

}