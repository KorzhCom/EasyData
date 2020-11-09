import { DateTimePickerOptions } from './date_time_picker_options'
import { Calendar, CalendarOptions } from './calendar';
import { TimePicker, TimePickerOptions } from './time_picker';

import { getElementAbsolutePos } from '../utils/ui-utils';

export abstract class DateTimePicker {
    protected currentDateTime: Date;

    protected options: DateTimePickerOptions;

    protected calendar: Calendar | null = null;
    protected timePicker: TimePicker | null = null;

    protected slot?: HTMLElement;

    protected get cssPrefix(): string {
        return 'kdtp';
    }

    constructor(options?: DateTimePickerOptions) {
        this.options = options;

        this.render();
    }

    public setDateTime(dateTime: Date) {
        this.currentDateTime = new Date(dateTime);

        if (this.calendar) {
            this.calendar.setDate(this.currentDateTime);
        }

        if (this.timePicker) {
            this.timePicker.setTime(this.currentDateTime);
        }
    }

    public getDateTime(): Date {
        return new Date(this.currentDateTime);
    }

    protected render() {

        if (this.options.showCalendar) {
            this.calendar = this.createCalendar({
                yearRange: this.options.yearRange,
                onDateChanged: (date) => {

                    this.currentDateTime.setFullYear(date.getFullYear());
                    this.currentDateTime.setMonth(date.getMonth());
                    this.currentDateTime.setDate(date.getDate());

                    if (this.options.showTimePicker || !this.options.oneClickDateSelection) {
                        this.dateTimeChanged();
                    }
                    else {
                        this.apply(date);
                    }
                }
            });

            if (this.calendar)
                this.calendar.render();
        }

        if (this.options.showTimePicker) {
            this.timePicker = this.createTimePicker({
                onTimeChanged: (time) => {
                    this.currentDateTime.setHours(time.getHours());
                    this.currentDateTime.setMinutes(time.getMinutes());

                    this.dateTimeChanged();
                } 
            });

            if (this.timePicker)
                this.timePicker.render();
        }

        this.setDateTime(new Date());
    }

    protected createCalendar(options: CalendarOptions): Calendar {
        return null;
    }

    protected createTimePicker(options: TimePickerOptions): TimePicker {
        return null;
    }

    public show(anchor?: HTMLElement) {
        if (this.options.beforeShow) {
            this.options.beforeShow();
        }

        const pos = getElementAbsolutePos(anchor || document.body);
        this.slot.style.top = pos.y + anchor.clientHeight + 'px';
        this.slot.style.left = pos.x + 'px';
    }

    public apply(date: Date) {
        if (this.options.onApply) {
            this.options.onApply(date);
        }

        this.destroy();
    }

    public cancel() {
        if (this.options.onCancel) {
            this.options.onCancel();
        }

        this.destroy();
    }

    protected destroy() {
        if (this.slot && this.slot.parentElement) {
            this.slot.parentElement.removeChild(this.slot);
        }
    }

    protected dateTimeChanged() {
        if (this.options.onDateTimeChanged) {
            this.options.onDateTimeChanged(this.currentDateTime);
        }
    }    
}