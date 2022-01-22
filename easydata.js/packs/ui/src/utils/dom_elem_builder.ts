import { mask } from './mask'

type elementType = "div" | "button" | "a" | "img" | "input" | "textarea" | string;

export class DomElementBuilder<TElement extends HTMLElement>  {

    protected element: TElement;

    constructor(tag: string | TElement, parent? : HTMLElement) {
        if (typeof tag === "string") {
            this.element = document.createElement(tag) as TElement;
        } else {
            this.element = tag;
        }
        if (parent && this.element.parentElement !== parent) {
            parent.appendChild(this.element);
        }
    }

    public addChild(tag: "div", childBuilder?: (builder: DomElementBuilder<HTMLDivElement>) => void): this 
    public addChild(tag: "button", childBuilder?: (builder: DomElementBuilder<HTMLButtonElement>) => void): this  
    public addChild(tag: "a", childBuilder?: (builder: DomElementBuilder<HTMLAnchorElement>) => void): this
    public addChild(tag: "img", childBuilder?: (builder: DomElementBuilder<HTMLImageElement>) => void) : this
    public addChild(tag: "input", childBuilder?: (builder: DomInputElementBuilder) => void) : this
    public addChild(tag: "textarea", childBuilder?: (builder: DomTextAreaElementBuilder) => void): this
    public addChild(tag: "select", childBuilder?: (builder: DomSelectElementBuilder) => void) : this
    public addChild(tag: string, childBuilder?: (builder: DomElementBuilder<HTMLElement>) => void): this 
    public addChild(tag: elementType, childBuilder?: (builder: any) => void): this {
        const builder = domel(tag, this.element);
        if (childBuilder) {
            childBuilder(builder);
        }

        return this;
    }

    public addChildElement(element: HTMLElement) {
        if (element) {
            this.element.appendChild(element);
        }
        return this;
    }

    public attr(attrId: string, attrValue: string) {
        this.element.setAttribute(attrId, attrValue);
        return this;
    }

    public id(value: string) {
        return this.attr("id", value);
    }

    public focus() {
        this.element.focus();
        return this;
    }

    public title(value: string) {
        return this.attr('title', value);
    }

    public data(dataId: string, dataValue: string = null) {
        if (dataValue === null) {
            this.element.removeAttribute('data-' + dataId);
            return this;
        }
        else {
            return this.attr('data-' + dataId, dataValue);
        }
    }

    public show() {
        return this.removeStyle('display');
    }

    public hide(toHide = true) {
        return (toHide) ? this.setStyle('display', 'none') : this;
    }

    public visible(isVisible = true) {
        return isVisible ? this.setStyle('visibility', 'visible') : this.setStyle('visibility', 'hidden');
    }

    public isVisible(): boolean {
        return !!( this.element.offsetWidth || this.element.offsetHeight || this.element.getClientRects().length );
    }

    public addClass(className: string, ...classNames: string[]) {
        if (className) {
            const fullList = [...className.trim().split(" "), ...classNames];
            for(let i = 0; i < fullList.length; i++)
                this.element.classList.add(fullList[i]);
        }

        return this;
    }

    public removeClass(className: string, ...classNames: string[]) {
        if (className) {
            const fullList = [...className.trim().split(" "), ...classNames];
            for(let i = 0; i < fullList.length; i++)
                this.element.classList.remove(fullList[i]);
        }
        return this;
    }
    
    public toggleClass(className: string, force: boolean = undefined) {
        if (className) {
            this.element.classList.toggle(className, force)
        }
        return this;
    }

    public on(eventType: string, listener: (event: Event, options?: boolean | AddEventListenerOptions) => any){
        const eventTypes = eventType.split(' ');
        for(let i = 0; i < eventTypes.length; i++) {
            this.element.addEventListener(eventTypes[i], listener); 
        }

        return this;
    }

    public off(eventType: string, listener: (event: Event, options?: boolean | AddEventListenerOptions) => any) {
        const eventTypes = eventType.split(' ');
        for(let i = 0; i < eventTypes.length; i++) {
            this.element.removeEventListener(eventTypes[i], listener); 
        }

        return this;
    }

    public setStyle(styleId: string, styleValue: string) {
        this.element.style.setProperty(styleId, styleValue);
        return this;
    }

    public removeStyle(styleId: string) {
        this.element.style.removeProperty(styleId);
        return this;
    }
    
    public text(text : string) {
        this.element.innerText = text;
        return this;
    }

    public html(html: string) {
        this.element.innerHTML = html;
        return this;
    }

    public clear() {
        const oldElem = this.element;
        this.element = document.createElement(this.element.tagName) as TElement;
        oldElem.replaceWith(this.element);
    }

    public addText(text : string) {
        const textEl = document.createTextNode(text);
        this.element.appendChild(textEl);
        return this;
    }

    public addHtml(html: string) {
        this.element.innerHTML += html;
        return this;
    }

    public toDOM() : TElement {
        return this.element;
    }

    public appendTo(parent: HTMLElement) {
        if (parent) {
            parent.appendChild(this.element);
        }

        return this;
    }

}

export class DomTextAreaElementBuilder extends DomElementBuilder<HTMLTextAreaElement> {

    constructor(element?: HTMLTextAreaElement, parent?: HTMLElement) {
        if (element) {
            super(element, parent);
        }
        else {
            super("textarea", parent);
        }
    }

    public name(value: string) {
        this.element.name = value;
        return this;
    }

    public rows(rows: number) {
        this.element.rows = rows;
        return this;
    }

    public cols(cols: number) {
        this.element.cols = cols;
        return this;
    }

    public value(value: string) {
        this.element.value = value;
        return this;
    }
}

export class DomInputElementBuilder extends DomElementBuilder<HTMLInputElement> {

    constructor(element?: HTMLInputElement, parent?: HTMLElement) {
        if (element) {
            super(element, parent);
        } 
        else {
            super("input", parent);
        }
    }

    public name(value: string) {
        this.element.name = value;
        return this;
    }

    public type(value: string) {
        this.element.type = value;
        return this;
    }

    public size(value: number) {
        this.element.size = value;
        return this;
    }

    public value(value: string | number | Date) {
        if (value instanceof Date) {
            this.element.valueAsDate = value;
        }
        else if (typeof value === "number") {
            this.element.valueAsNumber = value;
        } else {
            this.element.value = value;
        }

        return this;
    }

    public mask(maskPattern: string) {
        mask(this.element, maskPattern);
        return this;
    }
}

export class DomSelectElementBuilder extends DomElementBuilder<HTMLSelectElement> {
    constructor(element?: HTMLSelectElement, parent?: HTMLElement) {
        if (element) {
            super(element, parent);
        } 
        else {
            super("select", parent);
        }
    }

    public addOption(value: { value: string, title?: string, selected?: boolean } | string): DomSelectElementBuilder {
        const option = document.createElement('option');
        if (typeof value === "string") {
            option.value = value;
            option.innerHTML = value;
        }
        else {
            option.value = value.value;
            option.innerHTML = value.title || value.value;
            option.selected = value.selected || false;
        }
        this.element.appendChild(option);
        return this;
    }

    public value(value: string): DomSelectElementBuilder {
        this.element.value = value;
        return this;
    }
}

export function domel(tag: "div" | HTMLDivElement, parent?: HTMLElement): DomElementBuilder<HTMLDivElement>
export function domel(tag: "span" | HTMLSpanElement, parent?: HTMLElement): DomElementBuilder<HTMLSpanElement>
export function domel(tag: "a" | HTMLAnchorElement, parent?: HTMLElement): DomElementBuilder<HTMLAnchorElement>
export function domel(tag: "button" | HTMLButtonElement, parent?: HTMLElement): DomElementBuilder<HTMLButtonElement>
export function domel(tag: "img" | HTMLImageElement, parent?: HTMLElement): DomElementBuilder<HTMLImageElement>
export function domel(tag: "input" | HTMLInputElement, parent?: HTMLElement): DomInputElementBuilder
export function domel(tag: "textarea" | HTMLTextAreaElement, parent?: HTMLElement): DomTextAreaElementBuilder
export function domel(tag: "select" | HTMLInputElement, parent?: HTMLElement): DomSelectElementBuilder
export function domel(tag: string, parent?: HTMLElement): DomElementBuilder<HTMLElement>
export function domel(tag: elementType | HTMLElement, parent?: HTMLElement) {
    
    if (tag === "div" || tag instanceof HTMLDivElement) {
        return new DomElementBuilder<HTMLDivElement>(tag, parent);
    }
    if (tag === "span" || tag instanceof HTMLSpanElement) {
        return new DomElementBuilder<HTMLSpanElement>(tag, parent);
    }
    else if (tag === "a" || tag instanceof HTMLAnchorElement) {
        return new DomElementBuilder<HTMLAnchorElement>(tag, parent);
    }
    else if (tag === "button" || tag instanceof HTMLButtonElement) {
        return new DomElementBuilder<HTMLButtonElement>(tag, parent);
    } 
    else if (tag === "img" || tag instanceof HTMLImageElement) {
        return new DomElementBuilder<HTMLImageElement>(tag, parent);
    }
    else if (tag === "input" || tag instanceof HTMLInputElement) {
        return new DomInputElementBuilder(tag instanceof HTMLInputElement ? tag : null, parent);
    }
    else if (tag === "textarea" || tag instanceof HTMLTextAreaElement) {
        return new DomTextAreaElementBuilder(tag instanceof HTMLTextAreaElement ? tag : null, parent);
    }
    else if (tag === "select" || tag instanceof HTMLSelectElement) {
        return new DomSelectElementBuilder(tag instanceof HTMLSelectElement ? tag : null, parent);
    }

    return new DomElementBuilder(tag, parent);
}
