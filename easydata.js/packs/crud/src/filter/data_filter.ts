import { EasyDataTable } from '@easydata/core';

export interface DataFilter {
    getValue();
    apply(value): Promise<EasyDataTable>;
    drop(): Promise<EasyDataTable>;
}