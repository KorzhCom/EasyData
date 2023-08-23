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
    FIRST_MONTH,
    LAST_MONTH,
    THIS_YEAR,
    QUARTER_1,
    QUARTER_2,
    QUARTER_3,
    QUARTER_4,
}

export enum JUMP_TO {
    UNDEF = '-1',
    TODAY = '1',
    YESTERDAY = '2',
    TOMORROW = '3',
    WEEK_START = '4',
    WEEK_END = '5',
    MONTH_START = '6',
    MONTH_END = '7',
    YEAR_START = '8',
    YEAR_END = '9'
}

const DEFAULT_WEEK_START = 0

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

        this.calendar1.render()
        this.calendar2.render()

        this.calendar1.setDate(new Date())
        this.calendar2.setDate(new Date())
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
                    .addChild('button', b => b.addClass('tsp__button').addText('First Month').on('click', () => {this.select(PRE_SELECT.FIRST_MONTH)}))
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
                                            .addOption({value: JUMP_TO.UNDEF, title: 'Jump To'})
                                            .addOption({value: JUMP_TO.TODAY, title: 'Today'})
                                            .addOption({value: JUMP_TO.YESTERDAY, title: 'Yesterday'})
                                            .addOption({value: JUMP_TO.TOMORROW, title: 'Tomorrow'})
                                            .addOption({value: JUMP_TO.WEEK_START, title: 'Week Start'})
                                            .addOption({value: JUMP_TO.WEEK_END, title: 'Week End'})
                                            .addOption({value: JUMP_TO.MONTH_START, title: 'Month Start'})
                                            .addOption({value: JUMP_TO.MONTH_END, title: 'Month End'})
                                            .addOption({value: JUMP_TO.YEAR_START, title: 'Year Start'})
                                            .addOption({value: JUMP_TO.YEAR_END, title: 'Year End'})
                                        
                                        b.on('change', (event) => {
                                            // @ts-ignore
                                            this.jump(1, event.target.value)
                                        })
                                    })
                            })
                            .addChild('div', b => {
                                b.addClass('tsp__calendar')
                                this.calendar1 = new DefaultCalendar(b.toDOM(), {showDateTimeInput: true})
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
                                            .addOption({value: JUMP_TO.UNDEF, title: 'Jump To'})
                                            .addOption({value: JUMP_TO.TODAY, title: 'Today'})
                                            .addOption({value: JUMP_TO.YESTERDAY, title: 'Yesterday'})
                                            .addOption({value: JUMP_TO.TOMORROW, title: 'Tomorrow'})
                                            .addOption({value: JUMP_TO.WEEK_START, title: 'Week Start'})
                                            .addOption({value: JUMP_TO.WEEK_END, title: 'Week End'})
                                            .addOption({value: JUMP_TO.MONTH_START, title: 'Month Start'})
                                            .addOption({value: JUMP_TO.MONTH_END, title: 'Month End'})
                                            .addOption({value: JUMP_TO.YEAR_START, title: 'Year Start'})
                                            .addOption({value: JUMP_TO.YEAR_END, title: 'Year End'})

                                        b.on('change', (event) => {
                                            // @ts-ignore
                                            this.jump(2, event.target.value)
                                        })
                                    })
                            })
                            .addChild('div', b => {
                                b.addClass('tsp__calendar')
                                this.calendar2 = new DefaultCalendar(b.toDOM(), {showDateTimeInput: true})
                            })
                    })
            })
            .toDOM()

        return body
    }
    
    setupDialog(){
        
    }
    
    jump(cal: number, to: JUMP_TO){
        let target = cal === 1 ? 'from' : 'to'
        switch (to) {
            case JUMP_TO.TODAY: {
                this[target] = new Date()
                break
            }
            case JUMP_TO.YESTERDAY: {
                const curr = new Date()
                this[target] = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() - 1)
                break
            }
            case JUMP_TO.TOMORROW: {
                const curr = new Date()
                this[target] = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + 1)
                break
            }
            case JUMP_TO.WEEK_START: {
                const curr = new Date()
                this[target] = new Date(curr.setDate(curr.getDate() - curr.getDay()  + this.weekStart))
                break
            }
            case JUMP_TO.WEEK_END: {
                const curr = new Date()
                this[target] = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6 + this.weekStart))
                break
            }
            case JUMP_TO.MONTH_START: {
                const curr = new Date()
                this[target] = new Date(curr.getFullYear(), curr.getMonth(), 1)
                break
            }
            case JUMP_TO.MONTH_END: {
                const curr = new Date()
                this[target] = new Date(curr.getFullYear(), curr.getMonth() + 1, 0)
                break
            }
            case JUMP_TO.YEAR_START: {
                const curr = new Date()
                this[target] = new Date(curr.getFullYear(), 0, 1)
                break
            }
            case JUMP_TO.YEAR_END: {
                const curr = new Date()
                this[target] = new Date(curr.getFullYear(), 12, 0)
                break
            }
        }
        this.represent()
    }
    
    represent(){
        this.calendar1.setDate(this.from)
        this.calendar2.setDate(this.to)
    }
    
    select(interval: PRE_SELECT){
        switch (interval) {
            case PRE_SELECT.THIS_WEEK: {
                const curr = new Date()
                this.from = new Date(curr.setDate(curr.getDate() - curr.getDay()  + this.weekStart))
                this.to = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6 + this.weekStart))
                break
            }
            case PRE_SELECT.LAST_WEEK: {
                const curr = new Date()
                this.to = new Date(curr.getFullYear(), curr.getMonth() + 1, 0)
                this.from = new Date(this.to.getFullYear(), this.to.getMonth(), this.to.getDate() - 7 + this.to.getDay() - 1)
                break
            }
            case PRE_SELECT.THIS_MONTH: {
                const curr = new Date()
                this.from = new Date(curr.getFullYear(), curr.getMonth(), 1)
                this.to = new Date(curr.getFullYear(), curr.getMonth() + 1, 0)
                break
            }
            case PRE_SELECT.FIRST_MONTH: {
                const curr = new Date()
                this.from = new Date(curr.getFullYear(), 0, 1)
                this.to = new Date(curr.getFullYear(), 1, 0)
                break
            }
            case PRE_SELECT.LAST_MONTH: {
                const curr = new Date()
                this.from = new Date(curr.getFullYear(), 11, 1)
                this.to = new Date(curr.getFullYear(), 12, 0)
                break
            }
            case PRE_SELECT.THIS_YEAR: {
                const curr = new Date()
                this.from = new Date(curr.getFullYear(), 0, 1)
                this.to = new Date(curr.getFullYear(), 12, 0)
                break
            }
            case PRE_SELECT.QUARTER_1: {
                const curr = new Date()
                this.from = new Date(curr.getFullYear(), 0, 1)
                this.to = new Date(curr.getFullYear(), 3, 0)
                break
            }
            case PRE_SELECT.QUARTER_2: {
                const curr = new Date()
                this.from = new Date(curr.getFullYear(), 3, 1)
                this.to = new Date(curr.getFullYear(), 6, 0)
                break
            }
            case PRE_SELECT.QUARTER_3: {
                const curr = new Date()
                this.from = new Date(curr.getFullYear(), 6, 1)
                this.to = new Date(curr.getFullYear(), 9, 0)
                break
            }
            case PRE_SELECT.QUARTER_4: {
                const curr = new Date()
                this.from = new Date(curr.getFullYear(), 9, 1)
                this.to = new Date(curr.getFullYear(), 12, 0)
                break
            }
        }
        this.represent()
    }
}

export const showTimeSpanPicker = (options: TimeSpanPickerOptions) => new TimeSpanPicker(options).open()