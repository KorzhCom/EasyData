import { DataLoader, DataRow, EasyDataTable, utils as dataUtils } from '@easydata/core';
import { DataFilter } from './data_filter';
import { EasyDataContext } from '../main/easy_data_context';

export class TextDataFilter implements DataFilter {

    private filteredTable: EasyDataTable;

    private filterValue = '';

    //turns off client-side search
    //for test purposes
    private justServerSide = false;

    constructor (
        private loader: DataLoader, 
        private initTable: EasyDataTable,  
        private entityId: string) {
    }

    public getValue() {
        return this.filterValue;
    }
    
    public apply(value: string): Promise<EasyDataTable> {

        this.filterValue = value;

        if (this.filterValue) {
            return this.applyCore()
                .then(table => {
                    this.filteredTable = table;
                    return this.filteredTable;
                });
        }
        else {
           return this.drop();
        }
    }

    public drop(): Promise<EasyDataTable> {
        this.filterValue = '';
        this.filteredTable = null;
        return Promise.resolve(this.initTable);
    }

    private applyCore(): Promise<EasyDataTable> {
        if (this.initTable.getTotal() == this.initTable.getCachedCount() && !this.justServerSide) {
            return this.applyInMemoryFilter();
        }
        else {
            return this.loader.loadChunk({ 
                offset: 0, 
                limit: this.initTable.chunkSize, 
                needTotal: true, 
                filter: this.filterValue,
                entityId: this.entityId
            } as any)
            .then(data => {

                const filteredTable = new EasyDataTable({
                    chunkSize: this.initTable.chunkSize,
                    loader: {
                        loadChunk: (params) => this.loader
                            .loadChunk({ ...params, filter: this.filterValue, entityId: this.entityId } as any)
                    }
                });

                for(const col of data.table.columns.getItems()) {
                    filteredTable.columns.add(col);
                }

                filteredTable.setTotal(data.total);

                for(const row of data.table.getCachedRows()) {
                    filteredTable.addRow(row);
                }

                return filteredTable;
            })

        }
    }

    private applyInMemoryFilter(): Promise<EasyDataTable> {
        return new Promise((resolve, reject) => {
            const filteredTable = new EasyDataTable({
                chunkSize: this.initTable.chunkSize,
                loader: this.loader
            });

            for(const col of this.initTable.columns.getItems()) {
                filteredTable.columns.add(col);
            }   
            
            const words = this.filterValue.split('||').map(w => w.trim().toLowerCase());
            const hasEnterance = (row: DataRow) => {
                for (const col of this.initTable.columns.getItems()) {
                    if (dataUtils.isIntType(col.type) 
                        || dataUtils.getStringDataTypes().indexOf(col.type) >= 0) {
                        const value = row.getValue(col.id);
                        if (value) {
                           const normalized = value.toString()
                            .toLowerCase();

                            for(const word of words) {
                                if (normalized.indexOf(word) >= 0) {
                                    return true;
                                }
                            }
                        }
                    }
                }

                return false;
            }

            for(const row of this.initTable.getCachedRows()) {
                if (hasEnterance(row)) {
                    filteredTable.addRow(row); 
                }
            }

            resolve(filteredTable);
        });
    }
    
}