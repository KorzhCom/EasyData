import { utils as dataUtils } from '@easydata/core';
import { DefaultDialogService, DialogService, domel} from '@easydata/ui';
import {data} from "../utils/data"
import {exec} from "../utils/exec" 
import {capitalize, stripDash} from "../utils/string"

export type TWidget = any
export type TDataSet = any
export type DataSet = any

export type WidgetOptions = {
    title?: string,
    titleClass?: string,
    footer?: string,
    footerClass?: string,
    class?: string,
    lib?: string,
    type?: string,
    style?: string | {},
    dataset?: DataSet | DataSet[],
    axis?: {
        x?: number,
        y?: number,
        z?: number
    },
    options?: {}
}

export type EasyDataWidgetOptions = any

export class EasyDataWidget {
    protected element: HTMLElement
    protected elem: any
    protected options: EasyDataWidgetOptions
    protected name: string
    
    constructor(elem, name, options) {
        this.options = dataUtils.assignDeep(this.options, options || {})
        this.element = elem
        this.elem = domel(elem)
        this.name = name || `widget`

        this.setOptionsFromAttributes()
    }

    private setOptionsFromAttributes(){
        const element = this.element, o = this.options;

        for(const attr of data(element)){
            if (attr.name in o) {
                try {
                    o[attr.name] = JSON.parse(attr.value);
                } catch (e) {
                    o[attr.name] = attr.value;
                }
            }
        }
    }

    
    private fire(name, data){
        const element = this.element
        const _name = stripDash(name)
        
        const e = new CustomEvent(_name, {
            bubbles: true,
            cancelable: true,
            detail: data
        })

        element.dispatchEvent(e)

        return this
    }
    
    protected fireEvent(eventName, data){
        const element = this.element, o = this.options;
        const event = capitalize(eventName)

        data = dataUtils.assignDeep({__this: element}, data || {})
        this.fire(event.toLowerCase(), data);

        return exec(o["on"+event], data, element[0]);
    }

    updateAttr(attr, newVal, oldVal){}
    destroy(){}
}