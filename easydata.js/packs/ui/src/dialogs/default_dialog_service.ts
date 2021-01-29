import { i18n, utils } from '@easydata/core';

import { DialogService, DialogOptions, Dialog } from './dialog_service';

import { domel } from '../utils/dom_elem_builder';

const cssPrefix = "kdlg";

export class DefaultDialogService implements DialogService {

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
        }

        if (callback) {
            options.onSubmit = () => {
                callback(true);
            };
            options.onCancel = () => {
                callback(false);
            }

            this.open(options);
            return;
        }

        return new Promise<boolean>((resolve) => {
            options.onSubmit = () => {
                resolve(true);
            }
            options.onCancel = () => {
                resolve(false);
            }
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
        }

        const processInput = (callback) => {
            const input = document.getElementById(`${cssPrefix}-dialog-form-input`) as HTMLInputElement;
            const result = input.value;
            if (result && result.replace(/\s/g, '').length > 0) {
                callback(result);
                return true;
            }

            input.classList.add('eqjs-invalid');
            return false;
        }

        if (callback) {
            options.onSubmit = () => { 
               return processInput(callback);
            };
            options.onCancel = () => {
                callback("");
            }

            this.open(options);
            return;
        }

        return new Promise<string>((resolve) => {
            options.onSubmit = () => {
                return processInput(resolve);
            }
            options.onCancel = () => {
                resolve("");
            }
            this.open(options);
        });
    }

    public open(options: DialogOptions) {
        const dlg = new DefaultDialog(options);
        dlg.open();
        return dlg;
    }

}

export class DefaultDialog implements Dialog {

    private slot: HTMLElement;
    private window: HTMLElement;
    private header: HTMLElement;
    private body: HTMLElement;
    private footer: HTMLElement;

    constructor(private options: DialogOptions) {

        const id = utils.generateId('dlg');
        this.slot = 
            domel('div', document.body)
            .attr('tab-index', '-1')
            .data('dialog-id', id)
            .addClass('kdlg-modal', 'is-active')
            .addChild('div', b => b
                .addClass('kdlg-modal-background')
            )
            .addChild('div', b => this.window = b
                .addClass('kdlg-modal-window')
                .addChild('header', b => {
                    this.header = b
                        .addClass('kdlg-header')
                        .addChild('p', b => b
                            .addClass('kdlg-header-title')
                            .addText(options.title)
                        )
                        .toDOM();

                    if (options.closable !== false)
                        b.addChild('button', b => b
                            .addClass('kdlg-modal-close')
                            .on('click', () => {
                                this.cancelHandler();
                            })
                        );
                })
                .addChild('section', b =>  { 
                    this.body = b
                        .addClass('kdlg-body')
                        .toDOM();

                    if (typeof options.body === 'string') {
                        b.addHtml(options.body)
                    }
                    else {
                        b.addChildElement(options.body);
                    }
                })
                .addChild('footer', b => {
                        this.footer = b
                            .addClass('kdlg-footer', 'align-right')
                            .toDOM();

                        if (options.submitable === false)
                            return;

                        b.addChild('button', b => b
                            .addClass('kfrm-button', 'is-info')
                            .addText(i18n.getText('ButtonOK'))
                            .on('click', (e) => {
                                this.submitHandler();
                            })
                        )

                        if (options.cancelable !== false)
                            b.addChild('button', builder => builder
                                .addClass('kfrm-button')
                                .addText(i18n.getText('ButtonCancel'))
                                .on('click', (e) => {
                                    this.cancelHandler();
                                })
                            )
                })
                .toDOM()                
            )
            .toDOM();
    }

    public getRootElement() {
        return this.slot;
    }

    public open() {
        if (this.options.beforeOpen) {
            this.options.beforeOpen();
        }

        domel(this.slot).show();

        if (this.options.arrangeParents) {
            this.arrangeParents(true);
        }

        const windowDiv = this.slot
            .querySelector<HTMLElement>('.kdlg-modal-window');

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

    public showAlert(text: string, reason: string = '') {
        let alert = domel('div')
            .addClass(`kdlg-alert ${reason}`)
            .addChild('span', b => b
                .addClass('kdlg-alert-closebtn')
                .text('×')
                .on('click', (ev) => {
                    const alert = (ev.target as HTMLElement).parentElement;
                    alert.parentElement.removeChild(alert)
                })
            )
            .addText(text)
            .toDOM();

        this.window.insertBefore(alert, this.footer);
    }


    protected destroy() {
        if (this.options.arrangeParents) {
            this.arrangeParents(false);
        }

        document.body.removeChild(this.slot);

        if (this.options.submitOnEnter) {
            window.removeEventListener('keydown', this.keydownHandler, false);
        }

        if (this.options.onDestroy) {
            this.options.onDestroy();
        }
    }

    private submitHandler = (): boolean => {
        if (this.options.onSubmit && this.options.onSubmit() === false) {
            return false;
        }

        this.destroy();
        return true;
    }

    private cancelHandler = () => {
        if (this.options.onCancel) {
            this.options.onCancel();
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