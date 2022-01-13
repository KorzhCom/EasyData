import { 
    DataLoader, DataRow, 
    EasyDataTable, utils as dataUtils 
} from '@easydata/core';

import { DataFilter } from './data_filter';

export class TextDataFilter implements DataFilter {
    private filterValue = '';

    //turns off client-side search
    //for test purposes
    private justServerSide = false;

    constructor (
        private loader: DataLoader, 
        private sourceTable: EasyDataTable,  
        private sourceId: string,
        private isLookup = false) {
    }

    public getValue() {
        return this.filterValue;
    }
    
    public apply(value: string): Promise<EasyDataTable> {
        this.filterValue = value;

        if (this.filterValue) {
            return this.applyCore();
        }
        else {
           return this.clear();
        }
    }

    public clear(): Promise<EasyDataTable> {
        this.filterValue = '';
        return Promise.resolve(this.sourceTable);
    }

    private applyCore(): Promise<EasyDataTable> {
        if (this.sourceTable.getTotal() == this.sourceTable.getCachedCount() && !this.justServerSide) {
            return this.applyInMemoryFilter();
        }
        else {
            const filters = [
                { class: "__substring", value: this.filterValue }
            ]
            return this.loader.loadChunk({ 
                offset: 0, 
                limit: this.sourceTable.chunkSize, 
                needTotal: true, 
                filters: filters,
                sourceId: this.sourceId,
                lookup: this.isLookup
            } as any)
            .then(data => {
                const filteredTable = new EasyDataTable({
                    chunkSize: this.sourceTable.chunkSize,
                    loader: {
                        loadChunk: (params) => this.loader
                            .loadChunk({ ...params, filters: filters, sourceId: this.sourceId, lookup: this.isLookup } as any)
                    }
                });

                for (const col of this.sourceTable.columns.getItems()) {
                    filteredTable.columns.add(col);
                }

                filteredTable.setTotal(data.total);

                for (const row of data.table.getCachedRows()) {
                    filteredTable.addRow(row);
                }

                return filteredTable;
            })
        }
    }

    private applyInMemoryFilter(): Promise<EasyDataTable> {
        return new Promise((resolve, reject) => {
            const filteredTable = new EasyDataTable({
                chunkSize: this.sourceTable.chunkSize,
                inMemory: true
            });

            for(const col of this.sourceTable.columns.getItems()) {
                filteredTable.columns.add(col);
            }   
            
            const words = this.filterValue.split('||').map(w => w.trim().toLowerCase());
            const suitableColumns = this.sourceTable.columns.getItems()
                                        .filter(col => dataUtils.isIntType(col.type) 
                                                || dataUtils.getStringDataTypes().indexOf(col.type) >= 0)
            const hasEnterance = (row: DataRow) => {
                for (const col of suitableColumns) {
                    const value = row.getValue(col.id);
                    if (value) {
                       const normalized = value.toString().toLowerCase();

                        for(const word of words) {
                            if (normalized.indexOf(word) >= 0) {
                                return true;
                            }
                        }
                    }
            }

                return false;
            }

            for (const row of this.sourceTable.getCachedRows()) {
                if (hasEnterance(row)) {
                    filteredTable.addRow(row); 
                }
            }

            filteredTable.setTotal(filteredTable.getCachedCount());

            resolve(filteredTable);
        });
    }
    
}