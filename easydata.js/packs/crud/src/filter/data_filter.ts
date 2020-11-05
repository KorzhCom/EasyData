import { EasyDataTable } from '@easydata/core';

export interface DataFilter {
    getValue();
    apply(value): Promise<EasyDataTable>;
    clear(): Promise<EasyDataTable>;
}