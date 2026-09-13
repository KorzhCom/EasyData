/**
 * The test DOM (jsdom) doesn't implement innerText: setting it does nothing.
 * Map it to textContent, which is the same for the plain text the views set.
 */
export function polyfillInnerText(): void {
    const probe = document.createElement('span');
    probe.innerText = 'x';
    if (probe.textContent === 'x') {
        return;
    }

    Object.defineProperty((window as any).HTMLElement.prototype, 'innerText', {
        configurable: true,
        get() {
            return this.textContent;
        },
        set(value: string) {
            this.textContent = value;
        }
    });
}
