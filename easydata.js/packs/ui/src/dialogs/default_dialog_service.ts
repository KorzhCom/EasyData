import { i18n, utils, liquid } from '@easydata/core';

import { DialogService, DialogOptions, Dialog, ProgressDialogOptions, ProgressDialog, DialogSet, DialogFooterAlignment } from './dialog_service';

import { domel } from '../utils/dom_elem_builder';

const cssPrefix = "kdlg";

declare var grecaptcha;

export class DefaultDialogService implements DialogService {
    private static openDialogs: Dialog[] = [];

    public openConfirm(title?: string, content?: string): Promise<boolean>;
    public openConfirm(title?: string, content?: string, callback?: (result: boolean) => void): void;
    public openConfirm(title?: string, content?: string, callback?: (result: boolean) => void): Promise<boolean> | void {
        
        const template = `<div id="${cssPrefix}-dialog-confirm">${content}</div>`;

        const options: DialogOptions = {
            title: title,
            closable: false,
            submitable: true,
            cancelable: true,
            body: template
        };

        if (callback) {
            options.onSubmit = () => {
                callback(true);
            };
            options.onCancel = () => {
                callback(false);
            };

            this.open(options);
            return;
        }

        return new Promise<boolean>((resolve) => {
            options.onSubmit = () => {
                resolve(true);
            };
            options.onCancel = () => {
                resolve(false);
            };
            this.open(options);
        });
    }

    public openPrompt(title?: string, content?: string, defVal?: string): Promise<string>;
    public openPrompt(title?: string, content?: string, defVal?: string, callback?: (result: string) => void): void;
    public openPrompt(title?: string, content?: string, defVal?: string, callback?: (result: string) => void): Promise<string> | void {

        const template = `<div id="${cssPrefix}-dialog-form" class="kfrm-form">
            <div class="kfrm-fields label-above">
                <label for="${cssPrefix}-dialog-form-input" id="${cssPrefix}-dialog-form-content">${content}</label>
                <input type="text" name="${cssPrefix}-dialog-form-input" id="${cssPrefix}-dialog-form-input" />
            </div>
        </div>`;

        const options: DialogOptions = {
            title: title,
            submitable: true,
            closable: true,
            cancelable: true,
            submitOnEnter: true,
            body: template,
            arrangeParents: false,
            beforeOpen: () => {
                const input = document.getElementById(`${cssPrefix}-dialog-form-input`) as HTMLInputElement;
                if (defVal) {
                    input.value = defVal;
                }
                input.focus();
            }
        };

        const processInput = (callback) => {
            const input = document.getElementById(`${cssPrefix}-dialog-form-input`) as HTMLInputElement;
            const result = input.value;
            if (result && result.replace(/\s/g, '').length > 0) {
                callback(result);
                return true;
            }

            input.classList.add('eqjs-invalid');
            return false;
        };

        if (callback) {
            options.onSubmit = () => { 
               return processInput(callback);
            };
            options.onCancel = () => {
                callback("");
            };

            this.open(options);
            return;
        }

        return new Promise<string>((resolve) => {
            options.onSubmit = () => {
                return processInput(resolve);
            };
            options.onCancel = () => {
                resolve("");
            };
            this.open(options);
        });
    }

    public open(options: DialogOptions, data? : any) {
        const dialog = new DefaultDialog(options, data);

        const onDestroy = options.onDestroy;
        options.onDestroy = (dlg) => {
            this.untrack(dlg);
            onDestroy && onDestroy(dlg);
        };

        dialog.open();

        this.track(dialog);
        return dialog;
    }

    public createSet(options: DialogOptions[]): DialogSet {
        return new DefaultDialogSet(options, this);
    }

    private untrack(dlg: Dialog) {
        const index = DefaultDialogService.openDialogs.indexOf(dlg);
        if (index >= 0) {
            DefaultDialogService.openDialogs.splice(index, 1);
        }
    }

    private track(dlg: Dialog) {
        DefaultDialogService.openDialogs.push(dlg);
    }

    public openProgress(options: ProgressDialogOptions) {
        const dialog = new DefaultProgressDialog(options);
        const onDestroy = options.onDestroy;
        options.onDestroy = (dlg) => {
            this.untrack(dlg);
            onDestroy && onDestroy(dlg);
        };

        dialog.open();

        this.track(dialog);
        return dialog;
    }

    public getAllDialogs() {
        return Array.from(DefaultDialogService.openDialogs);
    }

    public closeAllDialogs() {
        for (const dialog of Array.from(DefaultDialogService.openDialogs)) {
            dialog.close();
        }
    }
}

export class DefaultDialog implements Dialog {
    protected dialogId: string;
    protected slot: HTMLElement;
    protected windowElement: HTMLElement;
    protected headerElement: HTMLElement;
    protected bodyElement: HTMLElement;
    protected footerElement: HTMLElement;
    protected alertElement: HTMLElement;
    protected data?: any;

    constructor(private options: DialogOptions, data? : any) {
        this.dialogId = utils.generateId('dlg');
        this.data = data;

        this.slot = 
            domel('div', document.body)
            .attr('tab-index', '-1')
            .data('dialog-id', this.dialogId)
            .addClass(`${cssPrefix}-modal`, 'is-active')
            .focus()
            .addChild('div', b => b
                .addClass('kdlg-modal-background')
            )
            .addChild('div', b => this.windowElement = b
                .addClass(`${cssPrefix}-modal-window`)
                .addChild('header', b => {
                    this.headerElement = b
                        .addClass(`${cssPrefix}-header`)
                        .addChild('p', b => b
                            .addClass(`${cssPrefix}-header-title`)
                            .addText(options.title)
                        )
                        .toDOM();

                    if (options.closable !== false)
                        b.addChild('button', b => b
                            .addClass(`${cssPrefix}-modal-close`)
                            .on('click', () => {
                                this.cancelHandler();
                            })
                            .focus()
                        );
                })
                .addChild('div', b => {
                    b .addClass(`${cssPrefix}-alert-container`);
                    this.alertElement = b.toDOM();
                })
                .addChild('section', b =>  { 
                    this.bodyElement = b
                        .addClass(`${cssPrefix}-body`)
                        .toDOM();

                    if (typeof options.body === 'string') {
                        const html = liquid.renderLiquidTemplate(options.body, data);
                        b.addHtml(html);
                    }
                    else {
                        b.addChildElement(options.body);
                    }
                })
                .addChild('footer', b => {
                        let alignClass = null;
                        if (options.footerAlignment && options.footerAlignment == DialogFooterAlignment.Center) {
                            alignClass = 'align-center';
                        }
                        else {
                            alignClass = 'align-right';
                        }

                        this.footerElement = b
                            .addClass(`${cssPrefix}-footer`)
                            .toDOM();

                        b.addClass(alignClass)

                        if (options.submitable === false)
                            return;

                        b.addChild('button', bb => {
                            bb.id(this.dialogId + '-btn-submit')
                            .addClass('kfrm-button', 'is-info')
                            .addText(options.submitButtonText || i18n.getText('ButtonOK'));

                            if (options.recaptchaSiteKey) {
                                bb.data('sitekey', options.recaptchaSiteKey);
                                bb.addClass('g-recaptcha');
                                bb.on('click', (e) => {
                                    if (grecaptcha) {
                                        grecaptcha.ready(() => {
                                            grecaptcha.execute(options.recaptchaSiteKey, {action: 'submit'})
                                                .then((token) => {
                                                    this.submitHandler(token);
                                                });
                                        });    
                                    }
                                    else {
                                       this.submitHandler(); 
                                    }
                                });
                            }
                            else {
                                bb.on('click', (e) => {
                                    this.submitHandler();
                                });
                            }
                            bb.focus();
                        });

                        if (options.cancelable !== false)
                            b.addChild('button', bb => bb
                                .id(this.dialogId + '-btn-cancel')
                                .addClass('kfrm-button')
                                .addText(options.cancelButtonText || i18n.getText('ButtonCancel'))
                                .on('click', (e) => {
                                    this.cancelHandler();
                                })
                            )
                })
                .toDOM()                
            )
            .toDOM();
    }

    public getData(): any {
        return this.data;
    }

    public getRootElement() {
        return this.slot;
    }

    public getSubmitButtonElement() : HTMLButtonElement | null {
        return document.getElementById(this.dialogId + '-btn-submit') as HTMLButtonElement;
    }

    public getCancelButtonElement() : HTMLButtonElement | null {
        return document.getElementById(this.dialogId + '-btn-cancel') as HTMLButtonElement;
    }

    public open() {
        if (this.options.beforeOpen) {
            this.options.beforeOpen(this);
        }

        domel(this.slot).show();

        if (this.options.arrangeParents) {
            this.arrangeParents(true);
        }

        const windowDiv = this.slot
            .querySelector<HTMLElement>(`.${cssPrefix}-modal-window`);

        if (this.options.height) {
            windowDiv.style.height = typeof this.options.height === 'string'
                ? this.options.height
                : `${this.options.height}px`;
        }
        if (this.options.width) {
            windowDiv.style.width = typeof this.options.width === 'string'
                ? this.options.width
                : `${this.options.width}px`;
        }

        if (this.options.submitOnEnter) {
            window.addEventListener('keydown', this.keydownHandler, false);
        }

        //clear alert on change in any input element 
        this.slot.querySelectorAll('input')
        .forEach(element =>  
            element.addEventListener('input', () => {
                this.clearAlert();
                if (this.options.onInput) {
                    this.options.onInput(this);
                }
            })
        );

        if (this.options.onShow) {
            this.options.onShow(this);
        }
    }

    public submit() {
        this.submitHandler();
    }

    public cancel() {
        this.cancelHandler();
    }

    public close() {
        this.destroy();
    }

    public disableButtons() {
        const buttons = this.slot.querySelectorAll<HTMLButtonElement>('button');
        buttons.forEach(button => button.disabled = true);
    }

    public enableButtons() {
        const buttons = this.slot.querySelectorAll<HTMLButtonElement>('button');
        buttons.forEach(button => button.disabled = false);
    }

    public showAlert(text: string, reason?: string, replace?: boolean) {
        let alert = domel('div')
            .addClass(`${cssPrefix}-alert ${reason || ''}`)
            .addChild('span', b => b
                .addClass(`${cssPrefix}-alert-closebtn`)
                .text('×')
                .on('click', (ev) => {
                    const alert = (ev.target as HTMLElement).parentElement;
                    alert.parentElement.removeChild(alert)
                })
            )
            .addText(text)
            .toDOM();

        if (replace === true) {
            this.clearAlert();
        }

        this.alertElement.appendChild(alert);
    }

    public clearAlert() {
        this.alertElement.innerHTML = '';
    }

    protected destroy() {
        const elem = document.querySelectorAll(`[data-dialog-id="${this.dialogId}"]`); 
        if (elem.length <= 0) return;

        if (this.options.arrangeParents) {
            this.arrangeParents(false);
        }

        document.body.removeChild(this.slot);

        if (this.options.submitOnEnter) {
            window.removeEventListener('keydown', this.keydownHandler, false);
        }
        
        if (this.options.onDestroy) {
            this.options.onDestroy(this);
        }
    }

    private submitHandler = (token?: any): boolean => {
        if (this.options.onSubmit && this.options.onSubmit(this, token) === false) {
            return false;
        }

        this.destroy();
        return true;
    }

    private cancelHandler = () => {
        if (this.options.onCancel) {
            this.options.onCancel(this);
        }

        this.destroy();
    }

    private keydownHandler = (ev: KeyboardEvent) => {
        if (ev.keyCode == 13 && this.isActiveDialog()) {
            ev.preventDefault();
            ev.stopPropagation();
            if (this.submitHandler()) {
                window.removeEventListener('keydown', this.keydownHandler, false);
                return false;
            }
        }

        return true;
    }

    private isActiveDialog(): boolean {
        const windowDivs = document.documentElement.querySelectorAll<HTMLElement>('.kdlg-modal');
        return windowDivs[windowDivs.length - 1] === this.slot;
    }

    private arrangeParents(turnOn: boolean) {
        const windowDivs = document.documentElement.querySelectorAll<HTMLElement>('.kdlg-modal-window');

        for (let i = 0; i < windowDivs.length - 1; i++) {
            if (turnOn) {
                const offset = i == 0 ? 20 : i * 40 + 20;
                domel(windowDivs[i])
                    .setStyle('margin-top', `${offset}px`)
                    .setStyle('margin-left', `${offset}px`);
            }
            else {
                domel(windowDivs[i])
                    .removeStyle('margin-top')
                    .removeStyle('margin-left');
            }
        }
    }
}


export class DefaultProgressDialog extends DefaultDialog implements ProgressDialog {
    protected contentElement: HTMLElement;
    protected progressElement: HTMLElement;

    constructor(options: ProgressDialogOptions, data? : any) {
        let contentElement: HTMLDivElement;
        let progressElement: HTMLDivElement;
        const body = domel('div')
            .addChild('div', b => contentElement = b
                .text(options.content || '')
                .toDOM()
            )
            .addChild('div', b => { b
                .addClass(`${cssPrefix}-progress-line`)
                .addChild('div', b => { 
                    progressElement = b
                    .addClass('fill')
                    .toDOM();

                    if (options.determinated) {
                        b.setStyle('width', '0%')
                    }
                    else {
                        b.addClass('indeterminate');
                    }
                })
            })
            .toDOM();

        super({
            title: options.title,
            body: body,
            beforeOpen: options.beforeOpen,
            onSubmit: options.onSubmit,
            width: options.width,
            height: options.height,
            submitable: false,
            cancelable: false,
            closable: false,
            onDestroy: options.onDestroy
        }, data);

        this.contentElement = contentElement;
        this.progressElement = progressElement;
    }

    updateContent(content: string) {
        this.contentElement.innerText = content;
    }

    updateProgress(progress: number) {
        progress = this.in01(progress);
        this.progressElement.style.width = `${progress * 100}%`;
        if (progress === 1) {
            // postpone for 0.5s for smooth closing
            setTimeout(() => {
                this.submit();
            }, 500)
        }
    }

    private in01(num: number) {
        if (num > 1)
            return 1;
        
        if (num < 0)
            return 0;

        return num;
    }
}

export class DefaultDialogSet {
    private currentDialog: Dialog = null;
    private currentIndex: number = 0;

    constructor(private options: DialogOptions[], private dialogService: DialogService) {
        this.options = options;
        this.dialogService = dialogService;
    }

    public getCurrent(): Dialog {
        return this.currentDialog;
    }
    public openNext(data? : any): Dialog {
        return this.open(this.currentIndex + 1, data);
    }

    public openPrev(data?: any): Dialog {
        return this.open(this.currentIndex - 1, data);
    }

    public open(page: number, data?: any): Dialog {
        if (page < 0) {
            this.currentIndex = 0;
        } 
        else if (page >= this.options.length) {
            this.currentIndex = this.options.length - 1;
        } 
        else {
            this.currentIndex = page;
        }

        if (this.currentDialog) {
            try {
                this.currentDialog.close();
            } 
            catch (e) {}
        }

        const dlgOptions = this.options[this.currentIndex];
        this.currentDialog = this.dialogService.open(dlgOptions, data);
        return this.currentDialog;
    }

    public close(): void {
        if (this.currentDialog) {
            this.currentDialog.close();
            this.currentDialog = null;
        }
    }
}
