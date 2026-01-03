import { DateTimePickerOptions } from './date_time_picker_options'
import { Calendar, CalendarOptions, dateLikeToDate } from './calendar';
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

        const defaultDate = this.options.defaultDate 
            ? dateLikeToDate(this.options.defaultDate) 
            : new Date();

        this.setDateTime(defaultDate);

        this.render();
    }

    public setDateTime(dateTime: Date) {
        this.currentDateTime = dateTime;

        if (this.calendar) {
            this.calendar.setDate(this.currentDateTime);
        }

        if (this.timePicker) {
            this.timePicker.setTime(this.currentDateTime);
        }
    }

    public getDateTime(): Date {
        return this.currentDateTime;
    }

    protected render() {
        if (this.options.showCalendar) {
            this.calendar = this.createCalendar({
                yearRange: this.options.yearRange,
                showDateTimeInput: this.options.showDateTimeInput,
                timePickerIsUsed: this.options.showTimePicker,
                minDate: this.options.minDate,
                maxDate: this.options.maxDate,
                oneClickDateSelection: this.options.oneClickDateSelection,
                onDateChanged: (date, apply) => {
                    this.currentDateTime = date;

                    if (this.timePicker) {
                        this.timePicker.setTime(this.currentDateTime);
                    }

                    if (this.options.showTimePicker) {
                        this.dateTimeChanged();
                    }
                    if (apply) {
                        this.apply(this.currentDateTime);
                    }
                }
            });

            if (this.calendar) {   
                this.calendar.setDate(this.currentDateTime);             
                this.calendar.render();
            }
        }

        if (this.options.showTimePicker) {
            this.timePicker = this.createTimePicker({
                onTimeChanged: (time) => {
                    this.currentDateTime.setHours(time.getHours());
                    this.currentDateTime.setMinutes(time.getMinutes());

                    if (this.calendar) {
                        this.calendar.setDate(this.currentDateTime);
                    }

                    this.dateTimeChanged();
                } 
            });

            if (this.timePicker)
                this.timePicker.render();
        }


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