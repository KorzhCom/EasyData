export interface TimePickerOptions {
    onTimeChanged?: (time: Date) => void;
}

export abstract class TimePicker {

    protected currentTime: Date;
    protected options: TimePickerOptions;
    protected slot: HTMLElement;

    protected get cssPrefix(): string {
        return 'kdtp-tp';
    }

    constructor(slot: HTMLElement, options?: TimePickerOptions) {
        this.slot = slot;
        this.options = options || {};
    }

    public setTime(time: Date) {
        this.currentTime = new Date(time);
    }

    public getTime(): Date {
        return new Date(this.currentTime)
    }

    public abstract render();

    protected timeChanged() {
        if (this.options.onTimeChanged) {
            this.options.onTimeChanged(this.currentTime);
        }
    }
}