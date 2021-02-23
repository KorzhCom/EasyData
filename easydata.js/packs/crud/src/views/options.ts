export interface EasyDataViewOptions {
    showBackToEntities?: boolean
}

export interface EasyDataViewDispatcherOptions extends EasyDataViewOptions {
    endpoint?: string,
    basePath?: string,
    rootEntity?: string,
    container?: HTMLElement | string;
}