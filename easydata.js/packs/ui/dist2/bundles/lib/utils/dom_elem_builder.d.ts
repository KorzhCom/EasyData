export declare class DomElementBuilder<TElement extends HTMLElement> {
    protected element: TElement;
    constructor(tag: string | TElement, parent?: HTMLElement);
    addChild(tag: "div", childBuilder?: (builder: DomElementBuilder<HTMLDivElement>) => void): this;
    addChild(tag: "button", childBuilder?: (builder: DomElementBuilder<HTMLButtonElement>) => void): this;
    addChild(tag: "a", childBuilder?: (builder: DomElementBuilder<HTMLAnchorElement>) => void): this;
    addChild(tag: "img", childBuilder?: (builder: DomElementBuilder<HTMLImageElement>) => void): this;
    addChild(tag: "input", childBuilder?: (builder: DomInputElementBuilder) => void): this;
    addChild(tag: "textarea", childBuilder?: (builder: DomTextAreaElementBuilder) => void): this;
    addChild(tag: "select", childBuilder?: (builder: DomSelectElementBuilder) => void): this;
    addChild(tag: string, childBuilder?: (builder: DomElementBuilder<HTMLElement>) => void): this;
    addChildElement(element: HTMLElement): this;
    attr(attrId: string, attrValue: string): this;
    id(value: string): this;
    focus(): this;
    title(value: string): this;
    data(dataId: string, dataValue?: string): this;
    show(): this;
    hide(toHide?: boolean): this;
    visible(isVisible?: boolean): this;
    isVisible(): boolean;
    addClass(className: string, ...classNames: string[]): this;
    removeClass(className: string, ...classNames: string[]): this;
    toggleClass(className: string, force?: boolean): this;
    on(eventType: string, listener: (event: Event, options?: boolean | AddEventListenerOptions) => any): this;
    off(eventType: string, listener: (event: Event, options?: boolean | AddEventListenerOptions) => any): this;
    setStyle(styleId: string, styleValue: string): this;
    removeStyle(styleId: string): this;
    text(text: string): this;
    html(html: string): this;
    clear(): void;
    addText(text: string): this;
    addHtml(html: string): this;
    toDOM(): TElement;
    appendTo(parent: HTMLElement): this;
}
export declare class DomTextAreaElementBuilder extends DomElementBuilder<HTMLTextAreaElement> {
    constructor(element?: HTMLTextAreaElement, parent?: HTMLElement);
    name(value: string): this;
    rows(rows: number): this;
    cols(cols: number): this;
    value(value: string): this;
}
export declare class DomInputElementBuilder extends DomElementBuilder<HTMLInputElement> {
    constructor(element?: HTMLInputElement, parent?: HTMLElement);
    name(value: string): this;
    type(value: string): this;
    size(value: number): this;
    value(value: string | number | Date): this;
    mask(maskPattern: string): this;
}
export declare class DomSelectElementBuilder extends DomElementBuilder<HTMLSelectElement> {
    constructor(element?: HTMLSelectElement, parent?: HTMLElement);
    addOption(value: {
        value: string;
        title?: string;
        selected?: boolean;
    } | string): DomSelectElementBuilder;
    value(value: string): DomSelectElementBuilder;
}
export declare function domel(tag: "div" | HTMLDivElement, parent?: HTMLElement): DomElementBuilder<HTMLDivElement>;
export declare function domel(tag: "span" | HTMLSpanElement, parent?: HTMLElement): DomElementBuilder<HTMLSpanElement>;
export declare function domel(tag: "a" | HTMLAnchorElement, parent?: HTMLElement): DomElementBuilder<HTMLAnchorElement>;
export declare function domel(tag: "button" | HTMLButtonElement, parent?: HTMLElement): DomElementBuilder<HTMLButtonElement>;
export declare function domel(tag: "img" | HTMLImageElement, parent?: HTMLElement): DomElementBuilder<HTMLImageElement>;
export declare function domel(tag: "input" | HTMLInputElement, parent?: HTMLElement): DomInputElementBuilder;
export declare function domel(tag: "textarea" | HTMLTextAreaElement, parent?: HTMLElement): DomTextAreaElementBuilder;
export declare function domel(tag: "select" | HTMLInputElement, parent?: HTMLElement): DomSelectElementBuilder;
export declare function domel(tag: string, parent?: HTMLElement): DomElementBuilder<HTMLElement>;
