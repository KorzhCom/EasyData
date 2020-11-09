import { i18n } from '@easydata/core'

import { domel } from '../utils/dom_elem_builder'

import { DateTimePicker } from './date_time_picker'
import { CalendarOptions } from './calendar'
import { DefaultCalendar } from './default_calendar'
import { TimePickerOptions } from './time_picker';
import { DefaultTimePicker } from './default_time_picker';

export class DefaultDateTimePicker extends DateTimePicker {

    protected calendarSlot: HTMLElement;
    protected timePickerSlot: HTMLElement;

    protected nowButton: HTMLElement;
    protected submitButton: HTMLElement;

    private globalMouseDownHandler: (e: MouseEvent) => void;

    protected render() {

        this.slot = domel('div', document.body)
            .addClass(`${this.cssPrefix}`)
            .attr('tabIndex', '0')
            .setStyle('position', 'absolute')
            .setStyle('top', '-1000px')
            .setStyle('left', '-1000px')
            .on('keydown', (ev) => {
                if ((ev as KeyboardEvent).keyCode === 27) {  // ESC is pressed
                    this.cancel();
                }
                else if ((ev as KeyboardEvent).keyCode === 13) {  // Enter is pressed
                    this.apply(this.getDateTime());
                }
                return false;
            })
            .toDOM();


        super.render();

        this.renderButtons();

        this.globalMouseDownHandler = (e: MouseEvent) => {
            let event = window.event || e;
            let o: any = event.srcElement || event.target;
            let isOutside = !this.slot.contains(event.target as Node);
    
            if (isOutside) {
                document.removeEventListener('mousedown', this.globalMouseDownHandler, true);
                this.cancel();
            }
            
            return true;
        };
    
    }

    protected renderButtons() {
        const builder = domel('div', this.slot)
            .addClass(`${this.cssPrefix}-buttons`)
            .addChild('button', b => this.nowButton = b
                .addClass(`${this.cssPrefix}-button ${this.cssPrefix}-button-now`)
                .text(i18n.getText('ButtonNow'))
                .on('click', () => {
                    this.setDateTime(new Date());
                    this.dateTimeChanged();
                    return false;
                })
                .toDOM()
            );
        
        if (this.options.showTimePicker || !this.options.oneClickDateSelection) {
            builder.addChild('button', b => this.submitButton = b
                .addClass(`${this.cssPrefix}-button ${this.cssPrefix}-button-apply`)
                .text(i18n.getText('ButtonApply'))
                .on('click', () => {
                    this.apply(this.getDateTime());
                    return false;
                })
                .toDOM()
            )
        }

        builder.addChild('button', b => this.submitButton = b
                .addClass(`${this.cssPrefix}-button ${this.cssPrefix}-button-cancel`)
                .text(i18n.getText('ButtonCancel'))
                .on('click', () => {
                    this.cancel();
                    return false;
                })
                .toDOM()
            )
    }

    protected createCalendar(options: CalendarOptions) {

        this.calendarSlot = 
            domel('div', this.slot)
            .addClass(`${this.cssPrefix}-cal`)
            .toDOM();

        return new DefaultCalendar(this.calendarSlot, options);
    }

    protected createTimePicker(options: TimePickerOptions) {
        this.timePickerSlot = 
            domel('div', this.slot)
            .addClass(`${this.cssPrefix}-tp`)
            .toDOM();

        return new DefaultTimePicker(this.timePickerSlot, options)
    }

    public show(achor?: HTMLElement) {
        super.show(achor);

        this.slot.focus();

        setTimeout(() => {
            document.addEventListener('mousedown', this.globalMouseDownHandler, true);
        }, 1)
       
    }

}