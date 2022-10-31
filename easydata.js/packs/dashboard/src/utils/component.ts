import { utils as dataUtils } from '@easydata/core';
import { DefaultDialogService, DialogService, domel} from '@easydata/ui';
import {dataset} from "../utils/dataset"
import {exec} from "../utils/exec" 

export type EasyDataComponentOptions = {
    
}

export class EasyDataComponent {
    private element: HTMLElement
    private elem: any
    private options: EasyDataComponentOptions
    private name: string
    
    constructor(elem, name, options) {
        this.options = dataUtils.assignDeep(this.options, options || {})
        this.element = elem
        this.elem = domel(elem)
        this.name = name || `component`

        this.setOptionsFromAttributes()
    }

    private setOptionsFromAttributes(){
        const element = this.element, o = this.options;
        const data = dataset(element)

        for(const attr of data){
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
        const _name = name.replace(/\-/g, "").toLowerCase()
        
        const e = new CustomEvent(_name, {
            bubbles: true,
            cancelable: true,
            detail: data
        })

        element.dispatchEvent(e)
    }
    
    protected fireEvent(eventName, data){
        const element = this.element, o = this.options;
        const event = eventName.substring(0, 1).toUpperCase() + eventName.substring(1)

        data = dataUtils.assignDeep({__this: element}, data || {})

        this.fire(event.toLowerCase(), data);

        return exec(o["on"+event], data, element[0]);
    }

    updateAttr(attr, newVal, oldVal){}
    destroy(){}
}