import { i18n, utils as dataUtils } from '@easydata/core';
import { 
    browserUtils, CellRendererType,
    domel, EasyGrid, 
    GridCellRenderer, GridColumn, DFMT_REGEX
} from '@easydata/ui';
import { DataFilter } from '../filter/data_filter';

export interface TextFilterWidgetOptions {
    focus?: boolean,
    instantMode?: boolean;
    instantTimeout?: number
}

export class TextFilterWidget {

    private options = {
        focus: false,
        instantMode: false,
        instantTimeout: 1000
    }

    constructor(
        private slot: HTMLElement, 
        private grid: EasyGrid, 
        private filter: DataFilter,
        options?: TextFilterWidgetOptions) {

        this.options = dataUtils.assignDeep(this.options, options || {});

        const stringDefRenderer = this.grid.cellRendererStore
            .getDefaultRendererByType(CellRendererType.STRING);
         this.grid.cellRendererStore
            .setDefaultRenderer(CellRendererType.STRING, (value, column, cellElement, rowElement) => 
                this.highlightCellRenderer(stringDefRenderer, value, column, cellElement, rowElement));

        const numDefRenderer = this.grid.cellRendererStore
            .getDefaultRendererByType(CellRendererType.NUMBER);
        this.grid.cellRendererStore
            .setDefaultRenderer(CellRendererType.NUMBER, (value, column, cellElement, rowElement) => 
                this.highlightCellRenderer(numDefRenderer, value, column, cellElement, rowElement));

        this.render();
    }

    private filterInput: HTMLInputElement;

    private render() {
        
        const horizClass = browserUtils.IsIE() 
            ? 'kfrm-fields-ie is-horizontal' 
            : 'kfrm-fields is-horizontal';

        const isEdgeOrIE = browserUtils.IsIE() || browserUtils.IsEdge();
        
        domel(this.slot)
        .addClass(horizClass)
        .addChild('div', b => {
            b
            .addClass('control')
            .addChild('input', b => { 
                this.filterInput = b.toDOM();
                b  
                .attr('placeholder', i18n.getText('SearchInputPlaceholder'))
                .type('text')

                b.on('keydown', this.inputKeydownHandler.bind(this))

                if (this.options.instantMode) {
                    b.on('keyup', this.inputKeyupHandler.bind(this));
                }
            });

            if (!isEdgeOrIE) {
                b                
                .addClass('has-icons-right')
                .addChild('span', b => {
                    b
                    .addClass('icon')
                    .addClass('is-right')
                    .addClass('is-clickable')
                    .html('&#x1F5D9;')
                    .on('click', this.clearButtonClickHander.bind(this));
                });
            }
        });

        if (!this.options.instantMode) {
            domel(this.slot)
                .addChild('button', b => b
                    .addClass('kfrm-button')
                    .addText(i18n.getText('SearchBtn'))
                    .on('click', this.searchButtonClickHandler.bind(this))
                );
        }

        if (this.options.focus) {
            this.filterInput.focus();
        }
    }

    private applyFilterTimeout: any;

    private inputKeydownHandler(ev: Event) {
        if ((ev as KeyboardEvent).keyCode == 13) {
            this.applyFilter();
        }
    }

    private inputKeyupHandler() {
        if (this.applyFilterTimeout) {
            clearTimeout(this.applyFilterTimeout);
        }

        this.applyFilterTimeout = setTimeout(() => {
            this.applyFilter();
        }, this.options.instantTimeout);
    }

    private clearButtonClickHander() {
        this.filterInput.value = '';
        this.filterInput.focus();

        this.applyFilter();
    }

    private searchButtonClickHandler() {
       this.applyFilter();
    }

    private applyFilter() {
        if (this.applyFilterTimeout) {
            clearTimeout(this.applyFilterTimeout);
        }

        const filterValue = this.filter.getValue();
        if (filterValue != this.filterInput.value) {
            this.filter.apply(this.filterInput.value)
                .then(data => {
                    this.grid.setData(data);
                });
        }
    }

    private highlightCellRenderer(defaultRenderer: GridCellRenderer, value: any, column: GridColumn, cellElement: HTMLElement, rowElement: HTMLElement) {   
        if (dataUtils.isNumericType(column.type) 
            || dataUtils.getStringDataTypes().indexOf(column.type) >= 0) 
        {
            if (value) {
                if (column.dataColumn && column.dataColumn.displayFormat
                    && DFMT_REGEX.test(column.dataColumn.displayFormat)) {
                    value = column.dataColumn.displayFormat.replace(DFMT_REGEX, (_, $1) => {
                        return i18n.numberToStr(value, $1);
                    });
                }
                else {
                    value = value.toLocaleString();
                }

                value = this.highlightText(value.toString());
            }
        }

        defaultRenderer(value, column, cellElement, rowElement);
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