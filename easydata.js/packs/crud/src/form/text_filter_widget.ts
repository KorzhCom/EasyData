import { utils as dataUtils } from '@easydata/core';
import { browserUtils, CellRendererType, domel, EasyGrid, GridCellRenderer, GridColumn } from '@easydata/ui';
import { DataFilter } from '../filter/data_filter';

export interface TextFilterWidgetOptions {
    instantMode?: boolean;
}

export class TextFilterWidget {

    private options = {
        instantMode: false
    }

    constructor(
        private slot: HTMLElement, 
        private grid: EasyGrid, 
        private filter: DataFilter,
        options?: TextFilterWidgetOptions) {

        this.options = dataUtils.assignDeep(this.options, options || {});

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

        this.render();
    }

    private filterInput: HTMLInputElement;

    private render() {
        
        const horizClass = browserUtils.IsIE() 
            ? 'kfrm-fields-ie is-horizontal' 
            : 'kfrm-fields is-horizontal';

        domel(this.slot)
        .addClass(horizClass)
        .addChild('input', b => { 
                this.filterInput = b.toDOM();
            b  
            .attr("placeholder", "Search..")
            .type('search')
            .on('search', this.inputSearchHandler.bind(this));

            if (this.options.instantMode) {
                b.on('keyup', this.inputKeyupHandler.bind(this));
            }
        })
        .addChild('button', b => b
            .addClass('kfrm-button')
            .addText('Search')
            .on('click', this.buttonClickHandler.bind(this))
        )
    }

    private applyFilterTimeout: any;

    private inputKeyupHandler() {
        if (this.applyFilterTimeout) {
            clearTimeout(this.applyFilterTimeout);
        }

        this.applyFilterTimeout = setTimeout(() => {
            this.toggleFilter();
        }, 1000);
    }

    private inputSearchHandler() {
        this.toggleFilter();
    }

    private buttonClickHandler() {
       this.toggleFilter();
    }

    private toggleFilter() {

        if (this.applyFilterTimeout) {
            clearTimeout(this.applyFilterTimeout);
        }

        const filterValue = this.filter.getValue();
        if (filterValue != this.filterInput.value) {
            if (this.filterInput.value) {
                this.filter.apply(this.filterInput.value)
                    .then(data => {
                        this.grid.setData(data);
                    });
            }
            else {
                this.filter.drop()
                    .then(data => {
                        this.grid.setData(data);
                    });
            }
        }
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
        const filterValue = this.filter.getValue().toString();
        if (filterValue && filterValue.length > 0 && content && content.length > 0) {
            const insertValue1 = `<span style='background-color: yellow'>`;
            const insertValue2 = `</span>`;
    
            let indexInMas = [];
            const words = filterValue.split('||').map(w => w.trim().toLowerCase());
            for(let i = 0; i < words.length; i++) {
                let pos = 0;
                let lowerWord = words[i];
                if (!lowerWord.length)
                    continue;
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
}