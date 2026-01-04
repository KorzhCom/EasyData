import { i18n } from '@easydata/core';

import { domel } from '../utils/dom_elem_builder'

import { TimePicker } from './time_picker'

export class DefaultTimePicker extends TimePicker {

    protected hoursInput: HTMLInputElement;
    protected minutesInput: HTMLInputElement;

    protected timeText: HTMLElement;

    public setTime(time: Date) {

        super.setTime(time);

        this.updateDisplayedTime();
        this.hoursInput.valueAsNumber = time.getHours();
        this.minutesInput.valueAsNumber = time.getMinutes();
    }

    public render() {
        this.slot.innerHTML = '';
        domel('div', this.slot)
            .addClass(`${this.cssPrefix}-time`)
            .addChild('span', builder => this.timeText = builder.toDOM())
            .toDOM();

        const slidersBuilder = domel('div', this.slot)
            .addClass(`${this.cssPrefix}-sliders`);


        slidersBuilder
            .addChild('div', builder => builder 
                .addClass(`${this.cssPrefix}-time-row`)
                .title('Hours')
                .addChild('input', builder => this.hoursInput = builder
                    .addClass(`${this.cssPrefix}-input-hours`)
                    .type('range')
                    .attr('min', '0')
                    .attr('max', '23')
                    .attr('step', '1')
                    .on('input', (e) => {
                        this.currentTime.setHours(this.hoursInput.valueAsNumber);
                        this.updateDisplayedTime();

                        this.timeChanged();
                    })
                    .toDOM()
                )
            );

        slidersBuilder
            .addChild('div', builder => builder
                .addClass(`${this.cssPrefix}-time-row`)
                .title('Minutes')
                .addChild('input', builder => this.minutesInput = builder
                    .addClass(`${this.cssPrefix}-input-minutes`)
                    .type('range')
                    .attr('min', '0')
                    .attr('max', '59')
                    .attr('step', '1')
                    .on('input', (e) => {
                        this.currentTime.setMinutes(this.minutesInput.valueAsNumber);
                        this.updateDisplayedTime();

                        this.timeChanged();
                    })
                    .toDOM()
                )
            );

        return this.slot;
    }

    protected updateDisplayedTime() {
        const locale = i18n.getCurrentLocale();
        const timeToDraw = this.currentTime.toLocaleString(
            locale == 'en' ? undefined : locale,
            {
                hour: "numeric",
                minute: "numeric"
            }
        );

        this.timeText.innerText = timeToDraw;
    }    
}
