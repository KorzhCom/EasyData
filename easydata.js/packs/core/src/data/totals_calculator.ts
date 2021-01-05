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