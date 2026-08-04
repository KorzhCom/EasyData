import "./dom-setup";

import { expect } from "@olton/latte";
import { browserUtils } from "../src/utils/browser_utils";

const originalMatchMedia = (window as any).matchMedia;

/**
 * Stubs window.matchMedia.
 * @param matches decides the result for every media query
 * @param supportsPointerFeatures when false - the browser doesn't understand
 *        the "hover"/"pointer" media features and reports them as "not all"
 */
function stubMatchMedia(matches: (query: string) => boolean, supportsPointerFeatures = true) {
    (window as any).matchMedia = (query: string) => {
        const understood = supportsPointerFeatures || !/hover|pointer/.test(query);
        return {
            matches: understood ? matches(query) : false,
            media: understood ? query : "not all",
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
        };
    };
}

const isSmallScreen = (query: string) => query.includes("max-width") || query.includes("max-height");
const isTouchDevice = (query: string) => query.includes("hover: none");

describe("browserUtils.detectMobileMode", () => {
    afterEach(() => {
        (window as any).matchMedia = originalMatchMedia;
        browserUtils.setIsMobileMode(undefined);
    });

    it("turns the mobile mode on for a small screen of a touch device", () => {
        stubMatchMedia(query => isSmallScreen(query) || isTouchDevice(query));
        expect(browserUtils.detectMobileMode()).toBeTrue();
    });

    it("keeps the regular UI in a narrow window of a desktop browser", () => {
        //a side pane or a half-screen window: small enough, but there is a mouse
        stubMatchMedia(query => isSmallScreen(query));
        expect(browserUtils.detectMobileMode()).toBeFalse();
    });

    it("keeps the regular UI on a large screen of a touch device", () => {
        stubMatchMedia(query => isTouchDevice(query));
        expect(browserUtils.detectMobileMode()).toBeFalse();
    });

    it("falls back to the screen size when the browser has no pointer media features", () => {
        stubMatchMedia(query => isSmallScreen(query), false);
        expect(browserUtils.detectMobileMode()).toBeTrue();
    });

    it("is overridden by setIsMobileMode", () => {
        stubMatchMedia(query => isSmallScreen(query) || isTouchDevice(query));

        browserUtils.setIsMobileMode(false);
        expect(browserUtils.isMobileMode()).toBeFalse();

        browserUtils.setIsMobileMode(true);
        expect(browserUtils.isMobileMode()).toBeTrue();
    });
});
