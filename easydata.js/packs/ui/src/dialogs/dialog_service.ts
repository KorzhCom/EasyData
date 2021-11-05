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
    beforeOpen?: (dialog: Dialog) => void;
    onShow?: (dialog: Dialog) => void;
    onSubmit?: (dialog: Dialog) => boolean | void;
    onCancel?: (dialog: Dialog) => void;
    onDestroy?: (dialog: Dialog) => void;
}

export interface ProgressDialogOptions {
    title: string,
    content?: string,
    determinated?: boolean;
    beforeOpen?: (dialog: Dialog) => void;
    onShow?: (dialog: Dialog) => void;
    onSubmit?: (dialog: Dialog) => void;
    width?: number | string;
    height?: number | string;
    onDestroy?: (dialog: Dialog) => void;
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

export interface ProgressDialog extends Dialog {
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

    openProgress(options: ProgressDialogOptions): ProgressDialog;

    open(options: DialogOptions): Dialog;

    getAllDialogs(): Dialog[];

    closeAllDialogs();
}
