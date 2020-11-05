import { MetaEntityAttr } from '@easydata/core';

export interface ValidationResult {
    successed: boolean;
    messages?: string[];
}

export abstract class Validator {

    public name: string;

    public abstract validate(attr: MetaEntityAttr, value: any): ValidationResult;
    
}