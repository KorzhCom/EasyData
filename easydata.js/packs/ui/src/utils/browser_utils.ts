export namespace browserUtils {
    let _isFirefox: boolean = null;

    let _isIE: boolean = null;

    let mobileModeChangeHandler: (newValue: boolean) => void;

    export function isIE(): boolean {
        if (_isIE === null) {
             const ua = navigator.userAgent;
            return ua.includes('MSIE') || ua.includes('Trident')
        }
        return _isIE;
    }

    export function isEdge(): boolean {
        const ua = window.navigator.userAgent;
        return !isIE() && ua.includes('Edge/')
    }

    export function isFirefox(): boolean {
        if (_isFirefox === null) {
            const ua = navigator.userAgent;
            _isFirefox = ua.toLowerCase().includes('firefox');
        }
        return _isFirefox;
    }

    /**
     * The screen sizes we consider small enough for the mobile UI.
     */
    const smallScreenQueries = [
        'only screen and (max-width: 840px)',
        'only screen and (max-height: 420px)'
    ];

    /**
     * A device which is really driven by fingers: its primary pointer is coarse
     * and it cannot hover.
     */
    const touchDeviceQuery = '(hover: none) and (pointer: coarse)';

    /**
     * Detects whether the mobile UI (full-page menus instead of drop-downs, no drag and drop,
     * no hover-driven interactions) should be used.
     * <p>
     * The size of the window alone is not a sufficient signal: a narrow or a short window of a
     * desktop browser - a side pane, a half-screen window, a window with the dev tools opened -
     * is still driven by a mouse, and the mobile UI only gets in the way there.
     * So the mobile mode is turned on for small screens of touch devices only.
     * </p>
     */
    export function detectMobileMode(): boolean {
        if (typeof window === 'undefined' || !window.matchMedia) {
            return false;
        }

        const smallScreen = smallScreenQueries.some(query => window.matchMedia(query).matches);
        if (!smallScreen) {
            return false;
        }

        const touchQuery = window.matchMedia(touchDeviceQuery);

        //a browser which doesn't support the "hover"/"pointer" media features returns
        //an unparsed query ("not all") - in that case we rely on the screen size only
        return touchQuery.media === touchDeviceQuery
            ? touchQuery.matches
            : true;
    }

    let _detectedIsMobileMode: boolean = false;
    let _isMobileMode: boolean = undefined;
    let detectIsMobileMode = () => {
        const oldValue = isMobileMode();

        _detectedIsMobileMode = detectMobileMode();

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

    export function onMobileModeChanged(callback: (newValue: boolean) => void) {
        mobileModeChangeHandler = callback;
    }
}