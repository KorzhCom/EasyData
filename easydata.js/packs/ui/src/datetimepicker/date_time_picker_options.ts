import { DateLike } from "./calendar";

export interface DateTimePickerOptions {
    yearRange?: string;
    showTimePicker?: boolean;
    showCalendar?: boolean;
    oneClickDateSelection?: boolean;
    showDateTimeInput?: boolean;
    zIndex?: number;
    minDate?: DateLike;
    maxDate?: DateLike;
    defaultDate?: DateLike;
    beforeShow?: () => void;
    onApply?: (dateTime: Date) => void;
    onCancel?: () => void;
    onDateTimeChanged?: (date: Date, apply?: boolean) => void;
} 
