export declare enum DropEffect {
    None = "none",
    Allow = "allow",
    Forbid = "forbid"
}
export interface EqDropContainer {
    element: HTMLElement;
    scopes: string[];
    data?: any;
}
export declare class EqDragEvent {
    readonly item: EqDragItem;
    dropEffect: DropEffect;
    readonly dragImage: HTMLDivElement;
    readonly data?: any;
    readonly sourceEvent: MouseEvent | TouchEvent;
    readonly pageX: number;
    readonly pageY: number;
    constructor(item: EqDragItem, dragImage: HTMLDivElement, sourceEvent: MouseEvent | TouchEvent);
}
export interface EqDragItem {
    element: HTMLElement;
    scope: string;
    data?: any;
}
export interface DragItemDescriptor {
    element: HTMLElement;
    scope: string;
    data?: any;
    renderer?: (dragImage: HTMLDivElement) => void;
    beforeDragStart?: () => void;
    onDragStart?: (event: EqDragEvent) => void;
    onDragEnd?: (event: EqDragEvent) => void;
}
export interface DropContainerDescriptor {
    element: HTMLElement;
    scopes: string[];
    data?: any;
    onDragEnter?: (container: EqDropContainer, event: EqDragEvent) => void;
    onDragOver?: (container: EqDropContainer, event: EqDragEvent) => void;
    onDragLeave?: (container: EqDropContainer, event: EqDragEvent) => void;
    onDrop?: (container: EqDropContainer, event: EqDragEvent) => void;
}
export declare class DragManager {
    private readonly delta;
    private draggableItem;
    private dragImage;
    private finishedSuccessfully;
    private mouseDownPosition;
    private containerDescriptors;
    private containerDescriptorIndex;
    private dropEffect;
    readonly DRAG_DISABLED_ATTR: any;
    constructor();
    registerDraggableItem(descriptor: DragItemDescriptor): void;
    registerDropContainer(descriptor?: DropContainerDescriptor): void;
    removeDropContainer(descriptorOrSlot: DropContainerDescriptor | HTMLElement): void;
    private mouseMoveDragListener;
    private updateCusror;
    private classPrefix;
    private updateImageClass;
    private setCursorStyle;
    private updateDragItemPosition;
    private dragEnterEvent;
    private dragLeaveEvent;
    private detectDragEnterEvent;
    private detectDragLeaveEvent;
}
export declare const eqDragManager: DragManager;
