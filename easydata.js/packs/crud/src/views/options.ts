import { EasyDataTableOptions } from '@easydata/core';
import { EasyGridOptions } from '@easydata/ui';

export interface EasyDataViewOptions {
    showFilterBox?: boolean;
    showBackToEntities?: boolean,
    grid?: Omit<EasyGridOptions, 'slot' | 'dataTable'>,
    dataTable?: EasyDataTableOptions
}

export interface EasyDataViewDispatcherOptions extends EasyDataViewOptions {
    endpoint?: string,
    basePath? : string;
    rootEntity?: string,
    container?: HTMLElement | string;
}