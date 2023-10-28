import { TimePicker } from './time_picker';
export declare class DefaultTimePicker extends TimePicker {
    protected hoursInput: HTMLInputElement;
    protected minutesInput: HTMLInputElement;
    protected timeText: HTMLElement;
    setTime(time: Date): void;
    render(): HTMLElement;
    protected updateDisplayedTime(): void;
}
