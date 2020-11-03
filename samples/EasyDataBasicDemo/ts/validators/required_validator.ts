import { MetaEntityAttr, utils as dataUtils } from '@easydata/core';
import { ValidationResult, Validator } from "./validator";

export class RequiredValidator extends Validator {

    constructor() {
        super();
        this.name = 'Required';
    }

    public validate(attr: MetaEntityAttr, value: any): ValidationResult {
       
        if (!attr.isNullable && (
            !dataUtils.IsDefinedAndNotNull(value)
            || value === ''))

            return {
                successed: false,
                messages: ['Value is required.']
            }

        return { successed: true };
    }
}