export class ProgressBar {

    constructor(private slot: HTMLElement) {
        this.hide();
        this.slot.classList.add('ed-progress-bar');
    }

    public show() {
        this.slot.style.removeProperty('display');
    }

    public hide() {
        this.slot.style.display = 'none';
    }
}