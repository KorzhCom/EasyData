import { 
    DataType, utils as dataUtils, 
    MetaEntityAttr, 
} from '@easydata/core';

import { domel } from '@easydata/ui';

import { DataContext } from '../main/data_context';

import { ValidationResult, Validator } from '../validators/validator';

import * as crudUtils from '../utils/utils';
import { DateTimeValidator } from '../validators/datetime_validator';

export class EntityEditForm {
    private errorsDiv: HTMLElement;

    private html: HTMLElement;

    constructor(private context: DataContext) {        
    }

    private validators: Validator[] = [ new DateTimeValidator() ];

    public getHtml() {
        return this.html;
    }

    private setHtmlInt(html: HTMLElement) {
        this.html = html;
        this.errorsDiv = this.html.querySelector('.errors-block');
    }

    public validate(): boolean {
        this.clearErrors();

        const inputs = Array.from(this.html.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select'));
        let isValid = true;
        for(const input of inputs) {
            const attr = this.context.getMetaData().getAttributeById(input.name);

            if (input.type === 'checkbox')
                continue;

            const result = this.validateValue(attr, input.value);
            if (!result.successed) {
                if (isValid) {
                    domel(this.errorsDiv)
                        .addChild('ul');
                }

                isValid = false;

                for(const message of result.messages) {
                    this.errorsDiv.firstElementChild.innerHTML += `<li>${attr.caption}: ${message}</li>`;
                }
            }
            
            this.markInputValid(input, result.successed);
        }

        return isValid;
    }

    public getData(): Promise<any> {
        return new Promise((resolve, reject) => {
            const filePromises: Promise<any>[] = [];
            const inputs = Array.from(this.html
                .querySelectorAll<HTMLInputElement | HTMLSelectElement  | HTMLTextAreaElement>('input, select, textarea'));
            let obj = {};
            for (const input of inputs) {
                const property = input.name.substring(input.name.lastIndexOf('.') + 1);
                const attr = this.context.getMetaData().getAttributeById(input.name);

                if (input.type === 'checkbox') {
                    obj[property] = (input as HTMLInputElement).checked;
                }
                else if (input.type === 'file') {
                    filePromises.push(this.fileToBase64((input as HTMLInputElement).files[0])
                        .then(content => obj[property] = content));
                }
                else {
                    obj[property] = this.mapValue(attr.dataType, input.value);
                }
            }

            Promise.all(filePromises)
                .then(() => resolve(obj))
                .catch((e) => reject(e));
        });
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result.toString();
                resolve(result.substring(result.indexOf(',') + 1));
            } 
            reader.onerror = error => reject(error);
        })
    }

    public useValidator(...validator: Validator[]) {
        this.useValidators(validator);
    }

    public useValidators(validators: Validator[]) {
        this.validators = this.validators.concat(validators);
    }

    private mapValue(type: DataType, value: string) {
        if (dataUtils.getDateDataTypes().indexOf(type) >= 0) {
            if (type !== DataType.Time && value && value.length) {
                const editFormat =  crudUtils.getEditDateTimeFormat(type);
                const internalFormat = crudUtils.getInternalDateTimeFormat(type);

                const date = dataUtils.strToDateTime(value, editFormat);
                return dataUtils.dateTimeToStr(date, internalFormat)
            }     

            return value && value.length ? value : null;
        }

        if (dataUtils.isIntType(type))
            return parseInt(value);

        if (dataUtils.isNumericType(type))
            return parseFloat(value);

        return value;
    }

    private clearErrors() {
        this.errorsDiv.innerHTML = '';

        this.html.querySelectorAll('input, select').forEach(el => {
            el.classList.remove('is-valid');
            el.classList.remove('is-invalid');
        });
    }

    private markInputValid(input: HTMLElement, valid: boolean) {
        input.classList.add(valid ? 'is-valid' : 'is-invalid');
    }

    private validateValue(attr: MetaEntityAttr, value: any): ValidationResult {
        const result = { successed: true, messages: []}
        for(const validator of this.validators) {
            const res = validator.validate(attr, value);
            if (!res.successed) {
                result.successed = false;
                result.messages = result.messages.concat(res.messages);
            }
        }

        return result;
    }  
}
