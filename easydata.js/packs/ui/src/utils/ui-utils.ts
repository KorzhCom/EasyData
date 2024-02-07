import { browserUtils } from './browser_utils';

/**
 * Wraps all the elements inside "parent" by "wrapper" element
 * @param parent The element to add wrapper to.
 * @param wrapper The element that will wrap child elements.
 */
export function wrapInner(parent: HTMLElement, wrapper: HTMLElement) {
    parent.appendChild(wrapper);

    while (parent.firstChild !== wrapper) {
            wrapper.appendChild(parent.firstChild);
    }
}


/**
 * Creates ands adds a new [[HTMLElement]] to "parent"
 * @param parent The element to add new element to.
 * @param tag Html tag of the new element.
 * @param options The options. In particular, options.cssClass sets the new element class.
 * @returns New element.
 */
export function addElement(parent: HTMLElement, tag: string, options?: any) : HTMLElement {
    let element = document.createElement(tag);
    let opts = options || { };

    if (opts.cssClass) {
        element.className = opts.cssClass;
    }

    parent.appendChild(element);
    
    return element;
}

/**
 * Adds css class to the html element.
 * @param element The element to add css class to.
 * @param className The name of the css class to be added.
 */
export function addCssClass(element: HTMLElement, className: string) : void {
    element.className =  (element.className)
            ? element.className + ' ' + className 
            : className;
}

/**
 * Hides the html element.
 * @param element The element to be hidden.
 */
export function hideElement(element: HTMLElement): void {
    element.style.display = 'none';
}

/**
 * Shows the html element.
 * @param element The element to be shown.
 * @param display The value of "display" style to be set. Default value is "block".
 */
export function showElement(element: HTMLElement, display?: string): void {
    if (!display) {
        display = '';
    }
    element.style.display = display;
}

/**
 * Hides the "first" element and shows the "second".
 * @param first The element to be hidden.
 * @param second The element to be shown.
 * @param options The options. The following options are applied:
 * - display - the value of "display" style to be set. Default value is "block"
 * - duration - the duration of fading in and out
 * - complete - the callback to be called when toggle is complete
 */
export function toggleVisibility(first : HTMLElement, second: HTMLElement, options : any) : void {
    if (!options) {
        options = {};
    }

    if (!options.display) {
        options.display = '';
    }

    if (!options.duration) {
        options.duration = 200;
    }

    //TODO: later we need to make it fading in and out
    hideElement(first);
    showElement(second, options.display);

    if (options.complete) {
        options.complete();
    }
}

/**
 * Checks if element is visible
 * @param element The element to check.
 * @returns `true` if visible, otherwise - `false`.
 */
export function isVisible(element: HTMLElement): boolean {
    return element.style.display != 'none'
            && element.offsetWidth != 0 
            && element.offsetHeight != 0;
}

export function createBrowserEvent(eventName) {
    var event;
    if (typeof(Event) === 'function') {
        event = new Event(eventName);
    } else {
        event = document.createEvent('Event');
        event.initEvent(eventName, true, true);
    }
    return event;
}

export function getViewportSize() {
    const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    return {
        width: width,
        height: height
    }
}

export function getDocSize() {

    if (browserUtils.isIE())
        return getWinSize();

    const width = Math.max(document.documentElement.clientWidth, document.body.clientWidth || 0);
    const height = Math.max(document.documentElement.clientHeight,  document.body.clientHeight || 0);

    return {
        width: width,
        height: height
    }
}

export function getScrollPos() {
    const body = document.body;
    const docElem = document.documentElement;

    return {
        top: window.pageYOffset || docElem.scrollTop || body.scrollTop,
        left: window.pageXOffset || docElem.scrollLeft || body.scrollLeft
    }
}

export function getElementAbsolutePos(element: HTMLElement) {
    let res = { x: 0, y: 0 }
    if (element !== null) {
        const position = offset(element);
        res = { x: position.left , y: position.top };
    }
    return res;
}


function offset(element: HTMLElement) {

    const defaultBoundingClientRect = { top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 };

    let box;

    try {
        box = element.getBoundingClientRect();
    } catch {
        box = defaultBoundingClientRect;
    }
    
    const body = document.body;
    const docElem = document.documentElement;

    const scollPos = getScrollPos();
    const scrollTop = scollPos.top;
    const scrollLeft = scollPos.left;

    const clientTop = docElem.clientTop || body.clientTop || 0;
    const clientLeft = docElem.clientLeft || body.clientLeft || 0;

    const top  = box.top +  scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;
    
    return { top: Math.round(top), left: Math.round(left) }

}

export function getWinSize() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    }
}


export function slideDown(target: HTMLElement, duration: number, callback?: () => void) {

    target.style.removeProperty('display');
    let display = window.getComputedStyle(target).display;

    if (display === 'none')
      display = 'block';

    target.style.display = display;
    let height = target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = 0 + 'px';
    target.style.paddingTop = 0 + 'px';
    target.style.paddingBottom = 0 + 'px';
    target.style.marginTop = 0 + 'px';
    target.style.marginBottom = 0 + 'px'; 
    target.offsetHeight;
    target.style.boxSizing = 'border-box';
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + 'ms';
    target.style.height = height + 'px';
    target.style.removeProperty('padding-top');
    target.style.removeProperty('padding-bottom');
    target.style.removeProperty('margin-top');
    target.style.removeProperty('margin-bottom');
    window.setTimeout( () => {
      target.style.removeProperty('height');
      target.style.removeProperty('overflow');
      target.style.removeProperty('transition-duration');
      target.style.removeProperty('transition-property');
      target.style.removeProperty('box-sizing');

      if (callback) {
        callback();
      }

    }, duration);
}

export function slideUp(target: HTMLElement,  duration: number, callback?: () => void) {
   
    target.style.transitionProperty = 'height, margin, padding';
    target.style.transitionDuration = duration + 'ms';
    target.style.boxSizing = 'border-box';
    target.style.height = target.offsetHeight + 'px';
    target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = 0 + 'px';
    target.style.paddingTop = 0 + 'px';
    target.style.paddingBottom = 0 + 'px';
    target.style.marginTop = 0 + 'px';
    target.style.marginBottom = 0 + 'px';
    window.setTimeout( () => {
      target.style.display = 'none';
      target.style.removeProperty('height');
      target.style.removeProperty('padding-top');
      target.style.removeProperty('padding-bottom');
      target.style.removeProperty('margin-top');
      target.style.removeProperty('margin-bottom');
      target.style.removeProperty('overflow');
      target.style.removeProperty('transition-duration');
      target.style.removeProperty('transition-property');
      target.style.removeProperty('box-sizing');

      if (callback) {
        callback();
      }
      
    }, duration);
}

export const eqCssPrefix = 'eqjs';
export const eqCssMobile = 'eqjs-mobile';
export function getMobileCssClass(): string | null {
    return browserUtils.isMobileMode() ? 'k-mobile' : null;
}
