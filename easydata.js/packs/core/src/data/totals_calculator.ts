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

export class TotalsSettings {

    private groupColumns: string[] = [];
    private aggrColumns: { [colId: string]: { funcId: string} } = {};
    
    public grandTotals = false;

    public addGroupColumn(colId: string) {
        this.groupColumns.push(colId);
    }

    public removeGroupColumn(colId: string) {
        const index = this.groupColumns.indexOf(colId);
        if (index >= 0) {
            this.groupColumns.splice(index, 1);
        }
    }

    public addOrUpdateAggrColumn(colId: string, funcId: string) {
        this.aggrColumns[colId] = { funcId };
    }

    public removeAggrColumn(colId: string) {
        delete this.aggrColumns[colId];
    }

    public hasGroupColumn(colId: string) {
        return this.groupColumns.indexOf(colId) >= 0;
    }

    public hasAggrColumn(colId: string) {
        return Object.keys(this.aggrColumns).indexOf(colId) >= 0;
    }

    public getGroupColumns(): string[] {
        return this.groupColumns;
    }

    public getAggrColumns(): { [colId: string]: { funcId: string } } {
        return this.aggrColumns;
    }

    public drop() {
        this.aggrColumns = {};
        this.groupColumns = [];
        this.grandTotals = false;
    }

}