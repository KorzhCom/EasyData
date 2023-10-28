import { DialogService, DialogOptions, Dialog, ProgressDialogOptions, ProgressDialog, DialogSet } from './dialog_service';
export declare class DefaultDialogService implements DialogService {
    private static openDialogs;
    openConfirm(title?: string, content?: string): Promise<boolean>;
    openConfirm(title?: string, content?: string, callback?: (result: boolean) => void): void;
    openPrompt(title?: string, content?: string, defVal?: string): Promise<string>;
    openPrompt(title?: string, content?: string, defVal?: string, callback?: (result: string) => void): void;
    open(options: DialogOptions, data?: any): DefaultDialog;
    createSet(options: DialogOptions[]): DialogSet;
    private untrack;
    private track;
    openProgress(options: ProgressDialogOptions): DefaultProgressDialog;
    getAllDialogs(): Dialog[];
    closeAllDialogs(): void;
}
export declare class DefaultDialog implements Dialog {
    private options;
    protected dialogId: string;
    protected slot: HTMLElement;
    protected windowElement: HTMLElement;
    protected headerElement: HTMLElement;
    protected bodyElement: HTMLElement;
    protected footerElement: HTMLElement;
    protected alertElement: HTMLElement;
    protected data?: any;
    constructor(options: DialogOptions, data?: any);
    getData(): any;
    getRootElement(): HTMLElement;
    getSubmitButtonElement(): HTMLButtonElement | null;
    getCancelButtonElement(): HTMLButtonElement | null;
    open(): void;
    submit(): void;
    cancel(): void;
    close(): void;
    disableButtons(): void;
    enableButtons(): void;
    showAlert(text: string, reason?: string, replace?: boolean): void;
    clearAlert(): void;
    protected destroy(): void;
    private submitHandler;
    private cancelHandler;
    private keydownHandler;
    private isActiveDialog;
    private arrangeParents;
}
export declare class DefaultProgressDialog extends DefaultDialog implements ProgressDialog {
    protected contentElement: HTMLElement;
    protected progressElement: HTMLElement;
    constructor(options: ProgressDialogOptions, data?: any);
    updateContent(content: string): void;
    updateProgress(progress: number): void;
    private in01;
}
export declare class DefaultDialogSet {
    private options;
    private dialogService;
    private currentDialog;
    private currentIndex;
    constructor(options: DialogOptions[], dialogService: DialogService);
    getCurrent(): Dialog;
    openNext(data?: any): Dialog;
    openPrev(data?: any): Dialog;
    open(page: number, data?: any): Dialog;
    close(): void;
}
