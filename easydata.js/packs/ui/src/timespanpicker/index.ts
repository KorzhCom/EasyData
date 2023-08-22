import {DialogOptions} from "../dialogs/dialog_service"
import {DefaultDialog} from "../dialogs/default_dialog_service"
import {DefaultCalendar} from "../datetimepicker/default_calendar"
import { domel } from '../utils/dom_elem_builder';

export interface TimeSpanPickerOptions {
    weekStart?: 0,
    title?: string,
    submitButtonText?: string,
    cancelButtonText?: string,
    onSubmit?: any
}

export enum PRE_SELECT {
    THIS_WEEK,
    LAST_WEEK,
    THIS_MONTH,
    LAST_MONTH,
    THIS_YEAR,
    QUARTER_1,
    QUARTER_2,
    QUARTER_3,
    QUARTER_4,
}

const DEFAULT_WEEK_START = 1

export class TimeSpanPicker extends DefaultDialog {
    protected layout: string | HTMLElement
    protected input1: any
    protected input2: any
    protected calendar1: any
    protected calendar2: any
    protected from: Date
    protected to: Date
    protected weekStart: number
    
    constructor(options: TimeSpanPickerOptions) {
        super({
            title: options.title || `Select a period`,
            body: "",
            submitButtonText: options.submitButtonText || `OK`,
            cancelButtonText: options.cancelButtonText || `Cancel`,
            submitable: true,
            closable: true,
            cancelable: true,
            beforeOpen: (dlg) => {
                this.setupDialog()
            },
            onSubmit: (dlg) => {
                if (typeof options.onSubmit === "function") {
                    options.onSubmit.apply(dlg, [this.from, this.to])
                }
            }
        });
        this.weekStart = options.weekStart || DEFAULT_WEEK_START
        this.bodyElement.append( this.drawDialog() )
    }
    
    drawDialog(){
        const body = domel('div')
            .addClass('tsp__container')
            .addChild('div', b => {
                b
                    .addClass('tsp__intervals')
                    .addChild('button', b => b.addClass('tsp__button').addText('This Week').on('click', () => {this.select(PRE_SELECT.THIS_WEEK)}))
                    .addChild('button', b => b.addClass('tsp__button').addText('Last Week').on('click', () => {this.select(PRE_SELECT.LAST_WEEK)}))
                    .addChild('button', b => b.addClass('tsp__button').addText('This Month').on('click', () => {this.select(PRE_SELECT.THIS_MONTH)}))
                    .addChild('button', b => b.addClass('tsp__button').addText('Last Month').on('click', () => {this.select(PRE_SELECT.LAST_MONTH)}))
                    .addChild('button', b => b.addClass('tsp__button').addText('This Year').on('click', () => {this.select(PRE_SELECT.THIS_YEAR)}))
                    .addChild('button', b => b.addClass('tsp__button').addText('Quarter 1').on('click', () => {this.select(PRE_SELECT.QUARTER_1)}))
                    .addChild('button', b => b.addClass('tsp__button').addText('Quarter 2').on('click', () => {this.select(PRE_SELECT.QUARTER_2)}))
                    .addChild('button', b => b.addClass('tsp__button').addText('Quarter 3').on('click', () => {this.select(PRE_SELECT.QUARTER_3)}))
                    .addChild('button', b => b.addClass('tsp__button').addText('Quarter 4').on('click', () => {this.select(PRE_SELECT.QUARTER_4)}))
            })
            .addChild('div', b => {
                b
                    .addClass('tsp__form')
                    .addChild('div', b => {
                        b
                            .addClass('tsp__date')
                            .addChild('div', b => {
                                b
                                    .addClass('tsp__label')
                                    .addChild('label', b => {
                                        b.addText('Start')
                                    })
                                    .addChild('select', b => {
                                        b
                                            .addOption({value: '-1', title: 'Jump To'})
                                            .addOption({value: '1', title: 'Today'})
                                            .addOption({value: '2', title: 'Yesterday'})
                                            .addOption({value: '3', title: 'Week Start'})
                                            .addOption({value: '4', title: 'Month Start'})
                                            .addOption({value: '5', title: 'Week End'})
                                            .addOption({value: '6', title: 'Month End'})
                                            .addOption({value: '7', title: 'Year End'})
                                    })
                            })
                            .addChild('div', b => {
                                b
                                    .addClass('tsp__calendar')
                                    .addChild('div', b => {
                                        this.calendar1 = new DefaultCalendar(b.toDOM(), {})
                                        this.calendar1.render()
                                    })
                            })
                            .addChild('div', b => {
                                b
                                    .addClass('tsp__input')
                                    .addChild('input', b => {
                                        this.input1 = b.type('text').name('').toDOM()
                                    })
                            })
                    })
                    .addChild('div', b => {
                        b
                            .addClass('tsp__date')
                            .addChild('div', b => {
                                b
                                    .addClass('tsp__label')
                                    .addChild('label', b => {
                                        b.addText('Finish')
                                    })
                                    .addChild('select', b => {
                                        b
                                            .addOption({value: '-1', title: 'Jump To'})
                                            .addOption({value: '1', title: 'Today'})
                                            .addOption({value: '2', title: 'Yesterday'})
                                            .addOption({value: '3', title: 'Week Start'})
                                            .addOption({value: '4', title: 'Month Start'})
                                            .addOption({value: '5', title: 'Week End'})
                                            .addOption({value: '6', title: 'Month End'})
                                            .addOption({value: '7', title: 'Year End'})
                                    })
                            })
                            .addChild('div', b => {
                                b
                                    .addClass('tsp__calendar')
                                    .addChild('div', b => {
                                        this.calendar2 = new DefaultCalendar(b.toDOM(), {})
                                        this.calendar2.render()
                                    })
                            })
                            .addChild('div', b => {
                                b
                                    .addClass('tsp__input')
                                    .addChild('input', b => {
                                        this.input2 = b.type('text').name('').toDOM()
                                    })
                            })
                    })
            })
            .toDOM()

        return body
    }
    
    setupDialog(){
        
    }
    
    represent(){
        console.log(this.weekStart, this.from, this.to)
    }
    
    select(interval: PRE_SELECT){
        
        switch (interval) {
            case PRE_SELECT.THIS_WEEK: {
                const curr = new Date()
                this.from = new Date(curr.setDate(curr.getDate() - curr.getDay()  + this.weekStart))
                this.to = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6 + this.weekStart))
                this.represent()
                break
            }
            case PRE_SELECT.LAST_WEEK: {
                const curr = new Date
                const first = curr.getDate()
                const last = first + 6
                this.from = new Date(curr.setDate(first))
                this.from = new Date(curr.setDate(last))
                this.represent()
                break
            }
        }
    }
}

export const showTimeSpanPicker = (options: TimeSpanPickerOptions) => new TimeSpanPicker(options).open()