export interface TimePickerOptions {
    onTimeChanged?: (time: Date) => void;
}
export declare abstract class TimePicker {
    protected currentTime: Date;
    protected options: TimePickerOptions;
    protected slot: HTMLElement;
    protected get cssPrefix(): string;
    constructor(slot: HTMLElement, options?: TimePickerOptions);
    setTime(time: Date): void;
    getTime(): Date;
    abstract render(): any;
    protected timeChanged(): void;
}
