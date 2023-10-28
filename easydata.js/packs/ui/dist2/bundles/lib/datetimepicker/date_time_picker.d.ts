import { DateTimePickerOptions } from './date_time_picker_options';
import { Calendar, CalendarOptions } from './calendar';
import { TimePicker, TimePickerOptions } from './time_picker';
export declare abstract class DateTimePicker {
    protected currentDateTime: Date;
    protected options: DateTimePickerOptions;
    protected calendar: Calendar | null;
    protected timePicker: TimePicker | null;
    protected slot?: HTMLElement;
    protected get cssPrefix(): string;
    constructor(options?: DateTimePickerOptions);
    setDateTime(dateTime: Date): void;
    getDateTime(): Date;
    protected render(): void;
    protected createCalendar(options: CalendarOptions): Calendar;
    protected createTimePicker(options: TimePickerOptions): TimePicker;
    show(anchor?: HTMLElement): void;
    apply(date: Date): void;
    cancel(): void;
    protected destroy(): void;
    protected dateTimeChanged(): void;
}
