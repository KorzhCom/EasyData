export interface DialogOptions {
    title: string;
    body: string | HTMLElement;
    closable?: boolean;
    cancelable?: boolean;
    width?: number;
    height?: number;
    beforeOpen?: () => void;
    onSubmit?: () => boolean | void;
    onCancel?: () => void;
    onDestroy?: () => void;
}

export interface DialogService {
    openConfirm(title?: string, content?: string): Promise<boolean>;
    openConfirm(title?: string, content?: string, callback?: (result: boolean) => void): void;
    openConfirm(title?: string, content?: string, callback?: (result: boolean) => void): Promise<boolean> | void;

    openPrompt(title?: string, content?: string, defVal?: string): Promise<string>;
    openPrompt(title?: string, content?: string, defVal?: string, callback?: (result: string) => void): void;
    openPrompt(title?: string, content?: string, defVal?: string, callback?: (result: string) => void): Promise<string> | void;

    open(options: DialogOptions);
}
