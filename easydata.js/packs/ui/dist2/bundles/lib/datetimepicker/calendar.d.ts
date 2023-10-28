export interface CalendarOptions {
    yearRange?: string;
    showDateTimeInput?: boolean;
    timePickerIsUsed?: boolean;
    oneClickDateSelection?: boolean;
    onDateChanged?: (date: Date, apply?: boolean) => void;
    onDrawDay?: (cell: HTMLElement, date: Date) => void;
}
export declare abstract class Calendar {
    protected currentDate: Date;
    protected slot: HTMLElement;
    protected options: CalendarOptions;
    protected get cssPrefix(): string;
    constructor(slot: HTMLElement, options?: CalendarOptions);
    abstract render(): any;
    setDate(date: Date): void;
    getDate(): Date;
    protected dateChanged(apply?: boolean): void;
}
