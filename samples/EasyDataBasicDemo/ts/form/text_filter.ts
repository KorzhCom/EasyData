import { DataRow, EasyDataTable, utils as dataUtils } from '@easydata/core';
import { 
    CellRendererType, EasyGrid,
    GridCellRenderer, GridColumn 
} from '@easydata/ui';
import { EasyDataContext } from '../main/easy_data_context';

export class TextFilter {

    private filteredTable: EasyDataTable;
    private initTable: EasyDataTable;

    private filterValue = '';

    //turns off client-side search
    //for test purposes
    private justServerSide = false;

    constructor (private grid: EasyGrid, private context: EasyDataContext, private entityId?: string) {
        const stringDefRenderer =  this.grid.cellRendererStore
            .getDefaultRendererByType(CellRendererType.STRING);
        this.grid.cellRendererStore
            .setDefaultRenderer(CellRendererType.STRING, (value, column, cell) => 
                this.highlightCellRenderer(stringDefRenderer, value, column, cell));

        const numDefRenderer =  this.grid.cellRendererStore
                .getDefaultRendererByType(CellRendererType.NUMBER);
        this.grid.cellRendererStore
            .setDefaultRenderer(CellRendererType.NUMBER, (value, column, cell) => 
                this.highlightCellRenderer(numDefRenderer, value, column, cell));

        this.initTable = grid.getData();
    }

    private highlightCellRenderer(defaultRenderer: GridCellRenderer, value: any, column: GridColumn, cell: HTMLElement) {   
        if (dataUtils.isIntType(column.type) 
        || dataUtils.getStringDataTypes().indexOf(column.type) >= 0) {
            if (value) {
                if(typeof value == 'number') {
                    value = value.toLocaleString();
                }

                value = this.highlightText(value.toString());
            }
        }

        defaultRenderer(value, column, cell);
    }

    private highlightText(content: string): string {
        const normalizedContent = content.toLowerCase();
        if (this.filterValue && this.filterValue.length > 0 && content && content.length > 0) {
            const insertValue1 = `<span style='background-color: yellow'>`;
            const insertValue2 = `</span>`;
    
            let indexInMas = [];
            const words = this.filterValue.split('||').map(w => w.trim().toLowerCase());
            for(let i = 0; i < words.length; i++) {
                let pos = 0;
                let lowerWord = words[i];
                if (lowerWord === normalizedContent) {
                    return insertValue1 + content + insertValue2;
                }
                while (pos < content.length - 1) {
                    const index = normalizedContent.indexOf(lowerWord, pos);
                    if (index >= 0) {
                        indexInMas.push({index: index, length: words[i].length});
                        pos = index + lowerWord.length;
                    } else {
                        pos++;
                    }
                }
            }
    
            if (indexInMas.length > 0) {
                
                //sort array item by index
                indexInMas.sort((item1, item2) => {
    
                    if (item1.index > item2.index) {
                        return 1;
                    } 
                    else if (item1.index == item2.index2) {
                        return 0;
                    } 
                    else {
                        return -1;
                    }
    
                });
    
                //remove intersecting gaps
                for(let i = 0; i < indexInMas.length - 1;) {
                    const delta = indexInMas[i + 1].index - (indexInMas[i].index + indexInMas[i].length);
                    if (delta < 0) {
                        const addDelta = indexInMas[i + 1].length + delta;
                        if (addDelta > 0) {
                            indexInMas[i].length += addDelta;
                        }
                        indexInMas.splice(i + 1, 1);
                    } else {
                        i++;
                    }
                }
    
                let result = '';
                for (let i = 0; i < indexInMas.length; i++) {
                    if (i === 0) {
                        result += content.substring(0, indexInMas[i].index);
                    }
    
                    result += insertValue1 
                        + content.substring(indexInMas[i].index, 
                            indexInMas[i].index + indexInMas[i].length) 
                        + insertValue2;
    
                    if (i < indexInMas.length - 1) {
                        result += content.substring(indexInMas[i].index 
                            + indexInMas[i].length, indexInMas[i + 1].index);
                    } else {
                        result += content.substring(indexInMas[i].index 
                            + indexInMas[i].length);
                    }
    
                }
    
                content = result;
            }
        }

        return content;
    }
    
    public apply(value: string) {
        if (this.filterValue != value) {
            this.filterValue = value;
        }
        else {
            return;
        }

        if (this.filterValue) {
            this.applyCore()
                .then(table => {
                    this.filteredTable = table;
                    this.grid.setData(this.filteredTable);
                })
        }
        else {
           this.drop();
        }
    }

    public drop() {
        this.filterValue = '';
        this.grid.setData(this.initTable)
        this.filteredTable = null;
    }

    private applyCore(): Promise<EasyDataTable> {
        if (this.initTable.getTotal() == this.initTable.getCachedCount() && !this.justServerSide) {
            return this.applyInMemoryFilter();
        }
        else {
            return this.context.getDataLoader().loadChunk({ 
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
                        loadChunk: (params) => this.context.getDataLoader()
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
                loader: this.context.getDataLoader()
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