/**
 * Wraps all the elements inside "parent" by "wrapper" element
 * @param parent The element to add wrapper to.
 * @param wrapper The element that will wrap child elements.
 */
export declare function wrapInner(parent: HTMLElement, wrapper: HTMLElement): void;
/**
 * Creates ands adds a new [[HTMLElement]] to "parent"
 * @param parent The element to add new element to.
 * @param tag Html tag of the new element.
 * @param options The options. In particular, options.cssClass sets the new element class.
 * @returns New element.
 */
export declare function addElement(parent: HTMLElement, tag: string, options?: any): HTMLElement;
/**
 * Adds css class to the html element.
 * @param element The element to add css class to.
 * @param className The name of the css class to be added.
 */
export declare function addCssClass(element: HTMLElement, className: string): void;
/**
 * Hides the html element.
 * @param element The element to be hidden.
 */
export declare function hideElement(element: HTMLElement): void;
/**
 * Shows the html element.
 * @param element The element to be shown.
 * @param display The value of "display" style to be set. Default value is "block".
 */
export declare function showElement(element: HTMLElement, display?: string): void;
/**
 * Hides the "first" element and shows the "second".
 * @param first The element to be hidden.
 * @param second The element to be shown.
 * @param options The options. The following options are applied:
 * - display - the value of "display" style to be set. Default value is "block"
 * - duration - the duration of fading in and out
 * - complete - the callback to be called when toggle is complete
 */
export declare function toggleVisibility(first: HTMLElement, second: HTMLElement, options: any): void;
/**
 * Checks if element is visible
 * @param element The element to check.
 * @returns `true` if visible, otherwise - `false`.
 */
export declare function isVisible(element: HTMLElement): boolean;
export declare function createBrowserEvent(eventName: any): any;
export declare function getViewportSize(): {
    width: number;
    height: number;
};
export declare function getDocSize(): {
    width: number;
    height: number;
};
export declare function getScrollPos(): {
    top: number;
    left: number;
};
export declare function getElementAbsolutePos(element: HTMLElement): {
    x: number;
    y: number;
};
export declare function getWinSize(): {
    width: number;
    height: number;
};
export declare function slideDown(target: HTMLElement, duration: number, callback?: () => void): void;
export declare function slideUp(target: HTMLElement, duration: number, callback?: () => void): void;
export declare const eqCssPrefix = "eqjs";
export declare const eqCssMobile = "eqjs-mobile";
