// latte's jsdom environment lacks window.matchMedia, which browser_utils.ts
// touches at module-import time. Polyfill it before any UI module is imported.
if (typeof window !== "undefined" && !(window as any).matchMedia) {
    (window as any).matchMedia = (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    });
}
