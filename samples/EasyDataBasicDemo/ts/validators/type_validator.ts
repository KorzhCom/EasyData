import { MetaEntityAttr, utils as dataUtils } from '@easydata/core';
import { ValidationResult, Validator } from './validator';

export class TypeValidator extends Validator {

    constructor() {
        super();
        this.name = 'Type';
    }

    public validate(attr: MetaEntityAttr, value: any): ValidationResult {
       
        if (!dataUtils.IsDefinedAndNotNull(value) || value == '')
            return { successed: true };

        if (dataUtils.isNumericType(attr.dataType)) {
            if (!dataUtils.isNumeric(value))
                return { 
                    successed: false, 
                    messages: ['Value should be a number']
                };


            if (dataUtils.isIntType(attr.dataType) 
                && !Number.isInteger(Number.parseFloat(value))) {
                    return {
                        successed: false,
                        messages: ['Value should be an integer number']
                    }
                }
        }

        return { successed: true };
    }
}