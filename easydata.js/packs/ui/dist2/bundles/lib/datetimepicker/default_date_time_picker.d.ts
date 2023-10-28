import { DateTimePicker } from './date_time_picker';
import { CalendarOptions } from './calendar';
import { DefaultCalendar } from './default_calendar';
import { TimePickerOptions } from './time_picker';
import { DefaultTimePicker } from './default_time_picker';
export declare class DefaultDateTimePicker extends DateTimePicker {
    protected calendarSlot: HTMLElement;
    protected timePickerSlot: HTMLElement;
    protected nowButton: HTMLElement;
    protected submitButton: HTMLElement;
    private globalMouseDownHandler;
    protected render(): void;
    protected renderButtons(): void;
    protected createCalendar(options: CalendarOptions): DefaultCalendar;
    protected createTimePicker(options: TimePickerOptions): DefaultTimePicker;
    show(anchor?: HTMLElement): void;
}
