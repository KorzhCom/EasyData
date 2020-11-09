export namespace browserUtils {

    let _isFirefox: boolean = null;

    let _isIE: boolean = null;

    export function IsIE(): boolean {
        return eval('/*@cc_on!@*/false || !!document.documentMode');

        // if (_isIE === null) {

        //     const ua = navigator.userAgent;

        //     /* MSIE used to detect old browsers and Trident used to newer ones*/
        //     _isIE = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
        // }

        // return _isIE;
        
    }

    export function IsFirefox(): boolean {

        if (_isFirefox === null) {
            const ua = navigator.userAgent;
            _isFirefox = ua.toLowerCase().indexOf('firefox') > -1;
        }

        return _isFirefox;
    }

    let _detectedIsMobileMode: boolean = false;
    let _isMobileMode: boolean = undefined;
    let detectIsMobileMode = () => {
        const oldValue = isMobileMode();

        _detectedIsMobileMode = window.matchMedia('only screen and (max-width: 840px)').matches 
                                        || window.matchMedia('only screen and (max-height: 420px)').matches;

        const newValue = isMobileMode();

        if (newValue !== oldValue && mobileModeChangeHandler) {
            mobileModeChangeHandler(newValue);
        }
    } 
    
    detectIsMobileMode();
    window.addEventListener('resize', () => detectIsMobileMode());
    
    export function isMobileMode(): boolean {
        if (_isMobileMode !== undefined) {
            return _isMobileMode;
        }
        else {
            return _detectedIsMobileMode;
        }
    }
    
    export function setIsMobileMode(value: boolean | undefined) {
        const oldValue = isMobileMode();

        _isMobileMode = value;

        const newValue = isMobileMode();

        if (newValue !== oldValue && mobileModeChangeHandler) {
            mobileModeChangeHandler(newValue);
        }
    }    

    let mobileModeChangeHandler: (newValue: boolean) => void;
    export function onMobileModeChanged(callback: (newValue: boolean) => void) {
        mobileModeChangeHandler = callback;
    }

    export function getMobileCssClass(): string | null {
        return isMobileMode() ? 'k-mobile' : null;
    }

}