import { MetaEntityAttr, i18n, utils as dataUtils } from '@easydata/core';
import { ValidationResult, Validator } from './validator';

import { getEditDateTimeFormat } from '../utils/utils';

export class DateTimeValidator extends Validator {

    constructor() {
        super();
        this.name = 'DateTime';
    }

    public validate(attr: MetaEntityAttr, value: any): ValidationResult {

        if (!dataUtils.IsDefinedAndNotNull(value) || value == '')
            return { successed: true };

        if (dataUtils.getAllDataTypes().indexOf(attr.dataType) >= 0)

            try {
                const editFormat = getEditDateTimeFormat(attr.dataType);
                const newDate = dataUtils.strToDateTime(value, editFormat);
            }
            catch {
                return {
                    successed: false,
                    messages: [i18n.getText('DateTimeError')]
                }
            }
          

        return { successed: true };
    }
}