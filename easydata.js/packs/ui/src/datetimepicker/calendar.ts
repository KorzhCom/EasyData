// null or none, today, [string]date, [Date]date
export type DateLike = null | string | Date;

export interface CalendarOptions {
    yearRange?: string;
    showDateTimeInput?: boolean;
    timePickerIsUsed?: boolean;
    oneClickDateSelection?: boolean;
    minDate?: DateLike;
    maxDate?: DateLike;
    onDateChanged?: (date: Date, apply?: boolean) => void;
    onDrawDay?: (cell: HTMLElement, date: Date) => void;
}

export abstract class Calendar {
    protected selectedDate: Date;

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

        if (!this.options.minDate) {
            this.options.minDate = "none";
        }

        if (!this.options.maxDate) {
            this.options.maxDate = "none";
        }
    }

    public abstract render();

    public setDate(date: Date) {
        this.selectedDate = new Date(date);
    }

    public getDate(): Date {
        return new Date(this.selectedDate);
    }

    protected dateChanged(apply?: boolean) {
        if (this.options.onDateChanged) {
            this.options.onDateChanged(this.selectedDate, apply);
        }
    }
}

export function dateLikeToDate(input: DateLike): Date | null {
    let result: Date | null;

    if (input == null || input === 'none') {
        return null;
    }

    if (typeof input === 'string') {
        if (input === 'today') {
            result = new Date();
            result.setHours(0, 0, 0, 0);
        } else {
            result = new Date(input);
            result.setHours(0, 0, 0, 0);
        }
    } else if (Array.isArray(input)) {
        result = new Date(input[0], input[1] - 1, input[2]);
        result.setHours(0, 0, 0, 0);
    } else {
        if (input instanceof Date) {
            result = new Date(input.getFullYear(), input.getMonth(), input.getDate());
            result.setHours(0, 0, 0, 0);
        } else {
            result = null;
        }
    }
    return result;
}