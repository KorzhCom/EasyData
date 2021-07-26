import { i18n } from '@easydata/core';
import { DataType } from '@easydata/core';

const internalDateFormat = 'yyyy-MM-dd';
const internalTimeFormat = 'HH:mm';

export const getInternalDateTimeFormat = (dtype: DataType): string => {
    if (dtype == DataType.Date)
        return internalDateFormat;

    if (dtype == DataType.Time)
        return internalTimeFormat;

    return `${internalDateFormat}T${internalTimeFormat}`;
}

export const getEditDateTimeFormat = (dtype: DataType): string => {
    const settings = i18n.getLocaleSettings();
    if (dtype == DataType.Date)
        return settings.editDateFormat;

    if (dtype == DataType.Time)
        return settings.editTimeFormat;

    return `${settings.editDateFormat} ${settings.editTimeFormat}`;
}

export const setLocation = (path: string) => {
    const state = window.history.state;
    history.replaceState(state, document.title, path)
    window.dispatchEvent(new Event('ed_set_location'));
}