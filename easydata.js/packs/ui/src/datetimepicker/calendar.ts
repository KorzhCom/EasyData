export interface CalendarOptions {
    yearRange?: string;
    showDateTimeInput?: boolean;
    timePickerIsUsed?: boolean;
    oneClickDateSelection?: boolean;
    onDateChanged?: (date: Date, apply?: boolean) => void;
    onDrawDay?: (cell: HTMLElement, date: Date) => void;
}

export abstract class Calendar {
    protected currentDate: Date;

    protected slot: HTMLElement;

    protected options: CalendarOptions;

    protected get cssPrefix(): string {
        return 'kdtp-cal';
    }

    constructor(slot: HTMLElement, options?: CalendarOptions) {
        this.slot = slot;
        this.options = options || {};

        if (!this.options.yearRange) {
            this.options.yearRange = 'c-10:c+10';
        }
    }

    public abstract render();

    public setDate(date: Date) {
        this.currentDate = new Date(date);
    }

    public getDate(): Date {
        return new Date(this.currentDate);
    }

    protected dateChanged(apply?: boolean) {
        if (this.options.onDateChanged) {
            this.options.onDateChanged(this.currentDate, apply);
        }
    }
}