import { DefaultDialog } from "../dialogs/default_dialog_service";
export interface TimeSpanPickerOptions {
    start?: Date;
    finish?: Date;
    weekStart?: 0;
    yearRange?: string;
    title?: string;
    submitButtonText?: string;
    cancelButtonText?: string;
    onSubmit?: any;
}
export declare enum PRE_SELECT {
    THIS_WEEK = 0,
    LAST_WEEK = 1,
    THIS_MONTH = 2,
    FIRST_MONTH = 3,
    LAST_MONTH = 4,
    THIS_YEAR = 5,
    QUARTER_1 = 6,
    QUARTER_2 = 7,
    QUARTER_3 = 8,
    QUARTER_4 = 9
}
export declare enum JUMP_TO {
    UNDEF = "-1",
    TODAY = "1",
    YESTERDAY = "2",
    TOMORROW = "3",
    WEEK_START = "4",
    WEEK_END = "5",
    MONTH_START = "6",
    MONTH_END = "7",
    YEAR_START = "8",
    YEAR_END = "9"
}
export declare class TimeSpanPicker extends DefaultDialog {
    protected layout: string | HTMLElement;
    protected input1: any;
    protected input2: any;
    protected calendar1: any;
    protected calendar2: any;
    protected from: Date;
    protected to: Date;
    protected weekStart: number;
    protected yearRange?: string;
    constructor(options: TimeSpanPickerOptions);
    alignDate(date: Date): Date;
    drawDialog(): HTMLDivElement;
    setupDialog(): void;
    jump(cal: number, to: JUMP_TO, select: any): void;
    represent(): void;
    select(interval: PRE_SELECT): void;
    result(date: Date): string;
}
export declare const showTimeSpanPicker: (options?: TimeSpanPickerOptions) => void;
