export interface DialogOptions {
    title: string;
    body: string | HTMLElement;
    submitable?: boolean;
    closable?: boolean;
    cancelable?: boolean;
    submitOnEnter?: boolean;
    width?: number | string;
    height?: number | string;
    arrangeParents?: boolean;
    submitButtonText?: string;
    cancelButtonText?: string;
    beforeOpen?: () => void;
    onSubmit?: () => boolean | void;
    onCancel?: () => void;
    onDestroy?: () => void;
}

export interface ProgressDialogOptions {
    title: string,
    content?: string,
    determinated?: boolean;
    beforeOpen?: () => void;
    onSubmit?: () => void;
    width?: number | string;
    height?: number | string;
    onDestroy?: () => void;
};

export interface Dialog {
    submit(): void;
    cancel(): void;
    close(): void;
    getRootElement(): HTMLElement;
    disableButtons();
    enableButtons();
    showAlert(text: string, reason?: string, replace?: boolean);
    clearAlert();
}

export interface PorgressDialog extends Dialog {
    updateContent(content: string);
    updateProgress(progress: number);
}

export interface DialogService {
    openConfirm(title?: string, content?: string): Promise<boolean>;
    openConfirm(title?: string, content?: string, callback?: (result: boolean) => void): void;
    openConfirm(title?: string, content?: string, callback?: (result: boolean) => void): Promise<boolean> | void;

    openPrompt(title?: string, content?: string, defVal?: string): Promise<string>;
    openPrompt(title?: string, content?: string, defVal?: string, callback?: (result: string) => void): void;
    openPrompt(title?: string, content?: string, defVal?: string, callback?: (result: string) => void): Promise<string> | void;

    openProgress(options: ProgressDialogOptions): PorgressDialog;

    open(options: DialogOptions): Dialog;

    getAllDialogs(): Dialog[];

    closeAllDialogs();
}
