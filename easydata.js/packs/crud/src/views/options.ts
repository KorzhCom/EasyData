export interface EasyDataViewOptions {
    showBackToEntities?: boolean
}

export interface EasyDataViewDispatcherOptions extends EasyDataViewOptions {
    endpoint?: string,
    basePath?: string,
    container?: HTMLElement | string;
}