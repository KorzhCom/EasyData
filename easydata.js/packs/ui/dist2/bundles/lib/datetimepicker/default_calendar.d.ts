import { Calendar, CalendarOptions } from './calendar';
export declare class DefaultCalendar extends Calendar {
    protected daysOfWeek: string[];
    protected months: string[];
    protected calendarBody: HTMLElement | null;
    protected headerTextElem: HTMLElement | null;
    protected manualInputElem: HTMLInputElement | null;
    protected selectYearElem: HTMLSelectElement | null;
    protected selectMonthElem: HTMLSelectElement | null;
    protected selectedMonth: number;
    protected selectedYear: number;
    private isManualInputChanging;
    constructor(slot: HTMLElement, options?: CalendarOptions);
    setDate(date: Date): void;
    render(): void;
    private getInputDateFormat;
    protected renderManualDateInput(): HTMLInputElement;
    protected updateDisplayedDateValue(): void;
    protected renderCalendarButtons(): HTMLElement;
    protected prev(): void;
    protected next(): void;
    protected rerenderSelectYear(): void;
    protected jump(year: number, month: number): void;
    protected rerenderMonth(): void;
    protected dateChanged(apply?: boolean): void;
}
