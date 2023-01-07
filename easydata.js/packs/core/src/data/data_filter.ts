import { EasyDataTable } from './easy_data_table';

export interface DataFilter {
    getValue();
    apply(value): Promise<EasyDataTable>;
    clear(): Promise<EasyDataTable>;
}