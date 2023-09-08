import {DefaultDialog} from "../dialogs/default_dialog_service"
import {DefaultCalendar} from "../datetimepicker/default_calendar"
import { domel } from '../utils/dom_elem_builder';
import { i18n, utils } from '@easydata/core';
export interface TimeSpanPickerOptions {
    start?: Date,
    finish?: Date,
    weekStart?: 0,
    yearRange?: string;
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
    protected yearRange?: string;
    
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
                    options.onSubmit.apply(dlg, [this.result(this.from), this.result(this.to)])
                }
            }
        });
        
        this.yearRange = options.yearRange
        this.weekStart = options.weekStart || DEFAULT_WEEK_START
        this.bodyElement.append( this.drawDialog() )

        this.calendar1.render()
        this.calendar2.render()
        
        this.from = this.alignDate(options.start ? options.start : new Date())
        this.to = this.alignDate(options.finish && this.alignDate(options.finish) > this.from ? options.finish : new Date(this.from.getFullYear(), this.from.getMonth(), this.from.getDate() + 1))

        this.represent()        
    }
    
    alignDate(date: Date){
        date.setHours(0)
        date.setMinutes(0)
        date.setSeconds(0)
        date.setMilliseconds(0)
        return date
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
                                            this.jump(1, event.target.value, event.target)
                                        })
                                    })
                            })
                            .addChild('div', b => {
                                b.addClass('tsp__calendar')
                                this.calendar1 = new DefaultCalendar(b.toDOM(), {
                                    yearRange: this.yearRange,
                                    showDateTimeInput: true,
                                    onDateChanged: (date?: Date) => {
                                        this.from = this.alignDate(date)
                                        this.calendar1.setDate(this.from)
                                        if (this.to < this.from) {
                                            this.to = this.from
                                        }
                                        this.represent()
                                    },
                                    onDrawDay: (cell, date) => {
                                        if (this.alignDate(date) >= this.from && this.alignDate(date) <= this.to) {
                                            cell.classList.add("day-in-range")
                                        } else {
                                            cell.classList.remove("day-in-range")
                                        }
                                    }
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
                                            this.jump(2, event.target.value, event.target)
                                        })
                                    })
                            })
                            .addChild('div', b => {
                                b.addClass('tsp__calendar')
                                this.calendar2 = new DefaultCalendar(b.toDOM(), {
                                    yearRange: this.yearRange,
                                    showDateTimeInput: true,
                                    onDateChanged: (date: Date) => {
                                        if (this.alignDate(date) >= this.from) {
                                            this.to = this.alignDate(date)
                                        } else {
                                            this.calendar2.setDate(this.to)
                                        }
                                        this.represent()
                                    },
                                    onDrawDay: (cell, date) => {
                                        if (this.alignDate(date) >= this.from && this.alignDate(date) <= this.to) {
                                            cell.classList.add("day-in-range")
                                        } else {
                                            cell.classList.remove("day-in-range")
                                        }
                                    }
                                })
                            })
                    })
            })
            .toDOM()

        return body
    }
    
    setupDialog(){
        
    }
    
    jump(cal: number, to: JUMP_TO, select: any){
        let target = cal === 1 ? 'from' : 'to'
        let jumpTo: Date
        const curr = new Date()

        switch (to) {
            case JUMP_TO.TODAY: {
                jumpTo = curr
                break
            }
            case JUMP_TO.YESTERDAY: {
                jumpTo = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() - 1)
                break
            }
            case JUMP_TO.TOMORROW: {
                jumpTo = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + 1)
                break
            }
            case JUMP_TO.WEEK_START: {
                jumpTo = new Date(curr.setDate(curr.getDate() - curr.getDay()  + this.weekStart))
                break
            }
            case JUMP_TO.WEEK_END: {
                jumpTo = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6 + this.weekStart))
                break
            }
            case JUMP_TO.MONTH_START: {
                jumpTo = new Date(curr.getFullYear(), curr.getMonth(), 1)
                break
            }
            case JUMP_TO.MONTH_END: {
                jumpTo = new Date(curr.getFullYear(), curr.getMonth() + 1, 0)
                break
            }
            case JUMP_TO.YEAR_START: {
                jumpTo = new Date(curr.getFullYear(), 0, 1)
                break
            }
            case JUMP_TO.YEAR_END: {
                jumpTo = new Date(curr.getFullYear(), 12, 0)
                break
            }
        }
        
        jumpTo = this.alignDate(jumpTo)
        
        select.value = JUMP_TO.UNDEF
        
        if (target === "from") {
            this.from = jumpTo
            if (this.to < this.from) {
                this.to = this.from
            }
        } else {
            if (jumpTo >= this.from) {
                this[target] = jumpTo
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
                this.from = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() - curr.getDay())
                this.to = new Date(this.from.getFullYear(), this.from.getMonth(), this.from.getDate() + 6)
                break
            }
            case PRE_SELECT.LAST_WEEK: {
                const curr = new Date()
                this.from = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() - curr.getDay() - 7)
                this.to = new Date(this.from.getFullYear(), this.from.getMonth(), this.from.getDate() + 6)
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
                this.from = new Date(curr.getFullYear(), curr.getMonth() - 1, 1)
                this.to = new Date(curr.getFullYear(), curr.getMonth(), 0)
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
    
    result(date: Date){
        const curr = this.alignDate(new Date())
        const constants = {
            "Today": this.alignDate(new Date()),
            "Yesterday": this.alignDate(new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() - 1)),
            "Tomorrow": this.alignDate(new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + 1)),
            "FirstDayOfMonth": this.alignDate(new Date(curr.getFullYear(), curr.getMonth(), 1)),
            "LastDayOfMonth": this.alignDate(new Date(curr.getFullYear(), curr.getMonth()+1, 0)),
            "FirstDayOfWeek": this.alignDate(new Date(curr.setDate(curr.getDate() - curr.getDay()  + this.weekStart))),
            "FirstDayOfYear": this.alignDate(new Date(curr.getFullYear(), 0, 1)),
            "FirstDayOfNextWeek": this.alignDate(new Date(curr.setDate(curr.getDate() - curr.getDay()  + this.weekStart + 7))),
            "FirstDayOfNextMonth": this.alignDate(new Date(curr.getFullYear(), curr.getMonth() + 1, 1)),
            "FirstDayOfNextYear": this.alignDate(new Date(curr.getFullYear() + 1, 0, 1)),
        }
        for(let k in constants) {
            console.log(constants[k], date)
            if (constants[k].getTime() === date.getTime()) {
                return `\${{${k}}}`
            }
        }
        return utils.dateTimeToStr(date, i18n.getLocaleSettings().editDateFormat)
    }
}

export const showTimeSpanPicker = (options?: TimeSpanPickerOptions) => new TimeSpanPicker(options).open()