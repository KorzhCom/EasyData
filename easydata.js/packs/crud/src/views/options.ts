import { EasyGridOptions } from '@easydata/ui';

export interface EasyDataViewOptions {
    showBackToEntities?: boolean,
    grid?: Omit<EasyGridOptions, 'slot' | 'dataTable'>
}

export interface EasyDataViewDispatcherOptions extends EasyDataViewOptions {
    endpoint?: string,
    basePath?: string,
    rootEntity?: string,
    container?: HTMLElement | string;
}