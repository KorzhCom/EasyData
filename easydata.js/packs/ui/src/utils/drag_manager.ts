import { getElementAbsolutePos } from './ui-utils';
import { domel } from '../utils/dom_elem_builder';
import { utils } from '@easydata/core';

const touchEventIsDefined = typeof TouchEvent !== 'undefined';

export enum DropEffect {
    None = 'none',
    Allow = 'allow',
    Forbid = 'forbid'
}

export interface EqDropContainer {
    element: HTMLElement;
    scopes: string[];
    data?: any;
}

export class EqDragEvent {
    public readonly item: EqDragItem;
    public dropEffect: DropEffect = DropEffect.Allow;
    public readonly dragImage: HTMLDivElement;
    public readonly data?: any;
    public readonly sourceEvent: MouseEvent | TouchEvent;

    public readonly pageX: number = 0;
    public readonly pageY: number = 0;

    constructor (item: EqDragItem, dragImage: HTMLDivElement, sourceEvent: MouseEvent | TouchEvent) {
        this.item = item;
        this.dragImage = dragImage;
        this.data = item.data;
        this.sourceEvent = sourceEvent;

        if (sourceEvent && sourceEvent instanceof MouseEvent) {
            this.pageX = sourceEvent.pageX,
            this.pageY = sourceEvent.pageY
        }

        if (sourceEvent && touchEventIsDefined && sourceEvent instanceof TouchEvent 
            && sourceEvent.touches[0]) {

            this.pageX = sourceEvent.touches[0].pageX,
            this.pageY = sourceEvent.touches[0].pageY
        }
    }
}

export interface EqDragItem {
    element: HTMLElement;
    scope: string;
    data?: any;
}

export interface DragItemDescriptor  {
    element: HTMLElement,
    scope: string;
    data?: any;
    renderer?: (dragImage: HTMLDivElement) => void;
    beforeDragStart?: () => void;
    onDragStart?: (event: EqDragEvent) => void;
    onDragEnd?: (event: EqDragEvent) => void;
}

export interface DropContainerDescriptor {
    element: HTMLElement,
    scopes: string[];
    data?: any;
    onDragEnter?: (container: EqDropContainer, event: EqDragEvent) => void;
    onDragOver?: (container: EqDropContainer, event: EqDragEvent) => void;
    onDragLeave?: (container: EqDropContainer, event: EqDragEvent) => void;
    onDrop?: (container: EqDropContainer, event: EqDragEvent) => void;
}

class Position {
    x: number;
    y: number;

    constructor (ev?: MouseEvent | TouchEvent) {
        if (ev && ev instanceof MouseEvent) {
            this.x = ev.pageX,
            this.y = ev.pageY
        }

        if (ev && touchEventIsDefined && ev instanceof TouchEvent && ev.touches[0]) {
            this.x = ev.touches[0].pageX,
            this.y = ev.touches[0].pageY
        }
    }
}

export class DragManager  {
   
    private readonly delta = 5;

    private draggableItem: EqDragItem = null;
    private dragImage: HTMLDivElement = null;

    private finishedSuccessfully = false;

    private mouseDownPosition: Position = null;

    private containerDescriptors: DropContainerDescriptor[] = [];

    private containerDescriptorIndex = -1;

    private dropEffect = DropEffect.None;

    public readonly DRAG_DISABLED_ATTR;

    constructor() {
        this.DRAG_DISABLED_ATTR = 'drag-disabled';
    }

    public registerDraggableItem(descriptor: DragItemDescriptor): void {

        const element = descriptor.element;

        if (!element) {
            throw Error("Element in draggle item is null or undefined");
        }

        element.ondragstart = function () {
            return false;
        }
        
        const detectDragging = (ev: MouseEvent | TouchEvent) => {

            if (element.hasAttribute(this.DRAG_DISABLED_ATTR)) {
                return;
            }

            ev.preventDefault();
            if (ev instanceof MouseEvent) {
                ev.stopPropagation();
            }
            
            const cursorPosition = new Position(ev as MouseEvent);
            if (Math.abs(cursorPosition.x - this.mouseDownPosition.x) > this.delta 
            || Math.abs(cursorPosition.y - this.mouseDownPosition.y) > this.delta) {
                startDragging(ev);
            }
        }

        const mouseMoveEventListener = (ev: MouseEvent | TouchEvent) => {
            this.mouseMoveDragListener(ev);
        }

        const startDragging = (ev: MouseEvent | TouchEvent) => {
            ev.preventDefault();
            ev.stopPropagation();

            element.removeEventListener('mousemove', detectDragging);
            element.removeEventListener('touchmove', detectDragging);

            this.finishedSuccessfully = false;
            
            if (descriptor.beforeDragStart)
                descriptor.beforeDragStart();

            this.dragImage = domel('div')
                .setStyle('position', 'absolute')
                .setStyle('z-index', '65530')
                .toDOM(); 

            document.body.appendChild(this.dragImage);

            this.dragImage.appendChild(element.cloneNode(true)); 

            if (descriptor.renderer) {
                descriptor.renderer(this.dragImage);
            }

            this.dropEffect = DropEffect.None;
            this.updateCusror(this.dropEffect);
            this.updateImageClass(this.dropEffect);

            this.draggableItem = {
                element: element,
                scope: descriptor.scope,
                data: descriptor.data
            };

            this.updateDragItemPosition(ev);

            const event: EqDragEvent = new EqDragEvent(this.draggableItem, this.dragImage, ev);
            event.dropEffect = this.dropEffect;

            if (descriptor.onDragStart) {
                descriptor.onDragStart(event);
            }

            if (this.dropEffect !== event.dropEffect) {
                this.dropEffect = event.dropEffect;
                this.updateImageClass(this.dropEffect);
            }

            document.addEventListener('mousemove', mouseMoveEventListener, true);
            document.addEventListener('touchmove', mouseMoveEventListener, true);
            
        }

        const mouseDownListener = (ev: MouseEvent | TouchEvent) => {

            if (touchEventIsDefined && ev instanceof TouchEvent) {
                ev.preventDefault();
            }

            this.mouseDownPosition = new Position(ev);

            element.addEventListener('mousemove', detectDragging);
            element.addEventListener('touchmove', detectDragging);

            document.addEventListener('mouseup', mouseUpListener);
            document.addEventListener('touchend', mouseUpListener);
        }

        element.addEventListener('mousedown', mouseDownListener);
        element.addEventListener('touchstart', mouseDownListener);

        const mouseUpListener = (ev: MouseEvent | TouchEvent) => {
            this.mouseDownPosition = null;

            element.removeEventListener('mousemove', detectDragging);
            element.removeEventListener('touchmove', detectDragging);

            document.removeEventListener('mousemove', mouseMoveEventListener, true);
            document.removeEventListener('touchmove', mouseMoveEventListener, true);

            if (this.draggableItem) {
                endDraggind(ev);
            }
        } 

        const endDraggind = (ev: MouseEvent | TouchEvent) => {  
            try {
                if (this.containerDescriptorIndex >= 0) {

                    const dropContDesc = this.containerDescriptors[this.containerDescriptorIndex];
    
                    const container: EqDropContainer = {
                        element: dropContDesc.element,
                        scopes: dropContDesc.scopes,
                        data: dropContDesc.data
                    };
    
                    const event: EqDragEvent = new EqDragEvent(this.draggableItem, this.dragImage, ev);
    
                    try {
                        if (container.scopes.indexOf(this.draggableItem.scope) >= 0 
                            && this.dropEffect === DropEffect.Allow) {
                        
                            this.finishedSuccessfully = true;
            
                            if (dropContDesc.onDrop) {
                                dropContDesc.onDrop(container, event);
                            }
                        }
                    }
                    finally {
                        if (dropContDesc.onDragLeave) {
                            dropContDesc.onDragLeave(container, event);
                        }
                    }
                }    
            }
            finally {
                try {
                    const event: EqDragEvent = new EqDragEvent(this.draggableItem, this.dragImage, ev);
                    event.data.finishedSuccessfully = this.finishedSuccessfully;

                    if (descriptor.onDragEnd) {
                        descriptor.onDragEnd(event);
                    }
                }
                finally {
                    this.draggableItem = null;
    
                    if (this.dragImage && this.dragImage.parentElement) {
                        this.dragImage.parentElement.removeChild(this.dragImage);
                    }
                    
                    this.dragImage = null;
                    this.finishedSuccessfully = false;
        
                    document.removeEventListener('mouseup', mouseUpListener);
                    document.removeEventListener('touchend', mouseUpListener);                    
                }

            }
        }
    }

    public registerDropContainer(descriptor?: DropContainerDescriptor) {

        const element = descriptor.element;

        if (!element) {
            throw Error("Element in drop container is null or undefined");
        }

        this.containerDescriptors.push(descriptor);
    }

    public removeDropContainer(descriptorOrSlot: DropContainerDescriptor | HTMLElement) {
        const descs = this.containerDescriptors
            .filter(desc => desc === descriptorOrSlot 
                || desc.element == descriptorOrSlot);
        
        if (descs) {
            for(const desc of descs) {
                utils.removeArrayItem(this.containerDescriptors, desc);
            }
        }
    }

    private mouseMoveDragListener(ev: MouseEvent | TouchEvent) {

        if (ev instanceof MouseEvent) {
            ev.preventDefault();
        }

        ev.stopPropagation();

        this.updateDragItemPosition(ev);

        if (this.containerDescriptorIndex == -1) {

            for(let i = 0; i < this.containerDescriptors.length; i++) {
                const descriptor = this.containerDescriptors[i];
                if (this.detectDragEnterEvent(descriptor.element, ev)) {
                    this.containerDescriptorIndex = i;
                    break;
                }
            }

            if (this.containerDescriptorIndex >= 0) {
                this.dragEnterEvent(ev);   
            }

        } else {
            const descriptor = this.containerDescriptors[this.containerDescriptorIndex];
            if (this.detectDragLeaveEvent(descriptor.element, ev)) {
                this.dragLeaveEvent(ev)
                this.containerDescriptorIndex = -1;
            }
        }

        if (this.containerDescriptorIndex >= 0) {
            const descriptor = this.containerDescriptors[this.containerDescriptorIndex];

            const container: EqDropContainer = {
                element: descriptor.element,
                scopes: descriptor.scopes,
                data: descriptor.data
            };

            if (container.scopes.indexOf(this.draggableItem.scope) >= 0) {

                const event: EqDragEvent = new EqDragEvent(this.draggableItem, this.dragImage, ev);
                event.dropEffect = this.dropEffect;

                if (descriptor.onDragOver) {
                    descriptor.onDragOver(container, event);
                }
            }

        }
    }

    private updateCusror(dropEffect: DropEffect) {
        switch(dropEffect) {
            case DropEffect.Allow:
                this.setCursorStyle(this.dragImage, 'grabbing');
                break;
            case DropEffect.Forbid:
                this.setCursorStyle(this.dragImage, 'no-drop');
                break;
            default:
                this.setCursorStyle(this.dragImage, 'grabbing');
                break;
        }
    }

    private classPrefix = 'eqjs-drop';

    private updateImageClass(dropEffect: DropEffect) {

        this.dragImage.classList.remove(`${this.classPrefix}-allow`);
        this.dragImage.classList.remove(`${this.classPrefix}-forbid`);
        this.dragImage.classList.remove(`${this.classPrefix}-none`);

        switch(dropEffect) {
            case DropEffect.Allow:
                this.dragImage.classList.add(`${this.classPrefix}-allow`);
                break;
            case DropEffect.None:
                this.dragImage.classList.add(`${this.classPrefix}-none`);
                break;
            case DropEffect.Forbid:
                this.dragImage.classList.add(`${this.classPrefix}-forbid`);
                break;
            default:
                this.dragImage.classList.add(`${this.classPrefix}-none`);
                break;
        }
    }

    private setCursorStyle(element: HTMLElement, cursor: string) {
        if (element) {
            element.style.cursor = cursor;
            
            for(let i = 0; i < element.children.length; i++) {
                this.setCursorStyle(element.children[i] as HTMLElement, cursor);
            }
        }
    }    

    private updateDragItemPosition(ev: MouseEvent | TouchEvent) {
        if (this.dragImage) {
            const pos = new Position(ev);
            this.dragImage.style.top = (pos.y - this.dragImage.offsetHeight / 2) + 'px';
            this.dragImage.style.left = (pos.x - this.dragImage.offsetWidth / 2) + 'px';
        }
    }

    private dragEnterEvent(ev: MouseEvent | TouchEvent) {

        const descriptor = this.containerDescriptors[this.containerDescriptorIndex]
        const container: EqDropContainer = {
            element: descriptor.element,
            scopes: descriptor.scopes,
            data: descriptor.data
        };
        
        if (container.scopes.indexOf(this.draggableItem.scope) >= 0) {

            const event: EqDragEvent = new EqDragEvent(this.draggableItem, this.dragImage, ev);
            event.dropEffect = DropEffect.Allow;

            if (descriptor.onDragEnter) {
                descriptor.onDragEnter(container, event);
            }

            this.dropEffect = event.dropEffect;
            this.updateCusror(this.dropEffect);
            this.updateImageClass(this.dropEffect);

        } else {
            if (this.dropEffect !== DropEffect.Forbid) {
                this.dropEffect = DropEffect.None
                this.updateCusror(this.dropEffect);
                this.updateImageClass(this.dropEffect);
            }
        }
    }

    private dragLeaveEvent(ev: MouseEvent | TouchEvent) {
        
        const descriptor = this.containerDescriptors[this.containerDescriptorIndex]
        const container: EqDropContainer = {
            element: descriptor.element,
            scopes: descriptor.scopes,
            data: descriptor.data
        };

        if (container.scopes.indexOf(this.draggableItem.scope) >= 0) {

            const event: EqDragEvent = new EqDragEvent(this.draggableItem, this.dragImage, ev);
            event.dropEffect = DropEffect.None;

            if (descriptor.onDragLeave) {
                descriptor.onDragLeave(container, event);
            }

            this.dropEffect = event.dropEffect;
            this.updateCusror(this.dropEffect);
            this.updateImageClass(this.dropEffect);
        } 
    }

    private detectDragEnterEvent(container: HTMLElement, ev: MouseEvent | TouchEvent): boolean {

        const containerPos = getElementAbsolutePos(container);

        const pos = new Position(ev);

        if (pos.y < containerPos.y || pos.y > containerPos.y + container.offsetHeight) {
            return false
        }

        if (pos.x < containerPos.x || pos.x > containerPos.x + container.offsetWidth) {
            return false
        }

        return true;
    }

    private detectDragLeaveEvent(container: HTMLElement, ev: MouseEvent | TouchEvent): boolean {

        const containerPos = getElementAbsolutePos(container);
        const pos = new Position(ev);

        if (pos.y > containerPos.y && pos.y < containerPos.y + container.offsetHeight
            && pos.x > containerPos.x && pos.x < containerPos.x + container.offsetWidth) {
            return false
        }

        return true;
    }
}

//global variable
export const eqDragManager = new DragManager();