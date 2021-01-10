import { 
    EventEmitter, EasyDataTable, 
    DataRow, utils, i18n, DataColumn 
} from '@easydata/core';

import { eqDragManager, DropEffect } from '../utils/drag_manager';
import { domel } from '../utils/dom_elem_builder';
import { getElementAbsolutePos, eqCssPrefix } from '../utils/ui-utils';

import { EasyGridOptions } from './easy_grid_options';
import { 
    GridEventType, GridEvent, 
    ColumnMovedEvent, 
    RowClickEvent,
    AddColumnClickEvent,
    PageChangedEvent,
    ColumnChangedEvent,
    ColumnDeletedEvent,
    ActiveRowChangedEvent
} from './easy_grid_events';

import { GridColumnList, GridColumn, GridColumnAlign } from './easy_grid_columns';
import { GridCellRendererStore } from './easy_grid_cell_renderer';

interface PaginationInfo {
    page: number,
    total: number,
    pageSize: number
}

const DEFAULT_ROW_HEIGHT = 36;
const DEFAULT_ROW_COUNT = 15;

export class EasyGrid {

    protected eventEmitter: EventEmitter;

    protected slot: HTMLElement;

    protected dataTable: EasyDataTable;
    protected columns: GridColumnList;

    protected cssPrefix = "keg";
    protected tableCss?: string;

    protected rootDiv: HTMLDivElement;
    protected headerDiv: HTMLDivElement;
    protected bodyDiv: HTMLDivElement;
    protected footerDiv: HTMLDivElement;
    protected bodyViewportDiv: HTMLDivElement;
    protected headerViewportDiv: HTMLDivElement;
    protected bodyCellContainerDiv: HTMLDivElement;
    protected headerCellContainerDiv: HTMLDivElement;
    protected headerRowDiv: HTMLDivElement;
    protected footerPaginateDiv: HTMLDivElement;

    protected pagination?: PaginationInfo = { page: 1, pageSize: 30, total: 0 }

    public readonly cellRendererStore: GridCellRendererStore;

    protected paginationOptions = {
        maxButtonCount: 10,
        useBootstrap: false //true
    }

    protected defaultDataGridOptions : EasyGridOptions = {
        slot: null,
        dataTable: null,
        fixHeightOnFirstRender: false,
        syncGridColumns: true,
        useRowNumeration: true,
        allowDragDrop: false,
        totals: {
            calcGrandTotals: false,
            calcSubTotals: false,
            calculator: null
        },
        paging: {
            enabled: true,
            pageSize: 30
        },
        addColumns: false,
        viewportRowsCount: null,
        showActiveRow: true
    }

    public readonly options: EasyGridOptions;

    constructor(options: EasyGridOptions) {

        if (options && options.paging) {
            options.paging = utils.assign(this.defaultDataGridOptions.paging,
                options.paging);
        }
     
        this.options = {...this.defaultDataGridOptions, ...options};

        if (!this.options.slot)
            throw Error('"slot" parameter is required to initialize EasyDataGrid');

        if (!this.options.dataTable)
            throw Error('"dataTable" parameter is required to initialize EasyDataGrid');

        this.dataTable = options.dataTable;
        this.eventEmitter = new EventEmitter(this);

        this.cellRendererStore = new GridCellRendererStore(options);
        this.columns = new GridColumnList(this.dataTable.columns, this);

        this.setSlot(this.options.slot);
        this.init(this.options);
    }

    private setSlot(slot: HTMLElement | string) {
        if (typeof slot === 'string') {
            if (slot.length){
                if (slot[0] === '#') {
                    this.slot = document.getElementById(slot.substring(1));
                }
                else if (slot[0] === '.') {
                    const result = document.getElementsByClassName(slot.substring(1));
                    if (result.length) 
                        this.slot = result[0] as HTMLElement;
                }
                else {
                    throw Error('Unrecognized slot parameter ' + 
                    '(Must be id, class or HTMLElement): ' + slot);
                }
            }
        }
        else {
            this.slot = slot;
        }
    }

    private rowsOnPagePromise: Promise<number> = null;

    protected init(options: EasyGridOptions) {
        if (options.onInit) {
            this.addEventListener('init', options.onInit);
        }
        if (options.onRowClick) {
            this.addEventListener('rowClick', options.onRowClick);
        }
        if (options.onRowDbClick) {
            this.addEventListener('rowDbClick', options.onRowDbClick);
        }
        if (options.onAddColumnClick) {
            this.addEventListener('addColumnClick', options.onAddColumnClick);
        }
        if (options.onColumnChanged) {
            this.addEventListener('columnChanged', options.onColumnChanged);
        }
        if (options.onColumnDeleted) {
            this.addEventListener('columnDeleted', options.onColumnDeleted);
        }
        if (options.onColumnMoved) {
            this.addEventListener('columnMoved', options.onColumnMoved);
        }
        if (options.onPageChanged) {
            this.addEventListener('pageChanged', options.onPageChanged);
        }
        if (options.onActiveRowChanged) {
            this.addEventListener('activeRowChanged', options.onActiveRowChanged);
        }

        this.addEventListener('pageChanged', ev => this.activeRowIndex = -1);


        utils.assignDeep(this.paginationOptions, options.pagination);

        this.pagination.pageSize = this.options.paging.pageSize
            || this.pagination.pageSize;

        if (this.options.allowDragDrop) {
            eqDragManager.registerDropContainer({
                element: this.slot,
                scopes: ["gridColumnMove"],
                onDragEnter: (_, ev) => {  
                    this.slot.classList.add(`${eqCssPrefix}-drophover`);
                    this.showLandingSlot(ev.pageX, ev.pageY);
                },
                onDragOver: (_, ev) => {
                    this.showLandingSlot(ev.pageX, ev.pageY);
                },
                onDragLeave: (_, ev) => {
                    ev.dropEffect = DropEffect.Forbid;
                    this.slot.classList.remove(`${eqCssPrefix}-drophover`);
                    this.hideLandingSlot();
                },
                onDrop: (_, ev) => {
                    this.dataTable.columns.move(ev.data.column, this.landingIndex);
                    this.refresh();

                    this.fireEvent({
                        type: 'columnMoved',
                        columnId: ev.data.column.id,
                        newIndex: this.landingIndex
                    } as ColumnMovedEvent);
                }
            });
        }

        this.refresh();
        this.fireEvent('init');
    }

    public fireEvent(event: GridEvent | GridEventType) {
        if (typeof event === "string") {
            this.eventEmitter.fire(event);
        }
        else {
            this.eventEmitter.fire(event.type, event);
        }
    }

    public setData(data: EasyDataTable) {
        this.dataTable = data;
        this.clear();
        this.refresh();
    }

    public getData(): EasyDataTable {
        return this.dataTable;
    }

    public getColumns(): GridColumnList {
        return this.columns;
    }

    public destroy() {
        this.slot.innerHTML = "";
    }

    public refresh() {
        this.clearDOM();
        this.render();
    }

    protected clearDOM() {
        this.slot.innerHTML = '';
    }

    public clear() {
        this.pagination.page = 1;
        this.clearDOM();
    }

    private containerInitialHeight: number = 0;

    private firstRender = true;

    protected render() {
        if (!this.hasData() && !this.options.addColumns) 
            return;

        this.containerInitialHeight = this.slot.clientHeight;

        this.rootDiv = document.createElement('div');
        this.rootDiv.style.width = '100%';
        this.rootDiv.classList.add(`${this.cssPrefix}-root`);

        this.columns.sync(this.dataTable.columns, this.options.useRowNumeration);

        this.renderHeader();
        this.rootDiv.appendChild(this.headerDiv);

        this.renderBody();
        this.rootDiv.appendChild(this.bodyDiv);
    
        this.renderFooter();
        this.rootDiv.appendChild(this.footerDiv);

        let gridContainer = document.createElement('div');
        gridContainer.classList.add(`${this.cssPrefix}-container`);
        gridContainer.appendChild(this.rootDiv);

        this.slot.appendChild(gridContainer);

        if (this.rowsOnPagePromise) {
            this.rowsOnPagePromise
                .then(() => this.updateHeight())
                .then(() =>  {
                    this.firstRender = false;
                    this.rowsOnPagePromise = null
                });
        }
        else {
            setTimeout(() => {
                this.updateHeight();

                this.firstRender = false;
            }, 100);    
        }

    }

    protected updateHeight() {
        return new Promise<void>((resolve) => {
            if (this.options.viewportRowsCount) {
                const firstRow = this.bodyCellContainerDiv.firstElementChild;
                const rowHeight = firstRow ? (firstRow as HTMLElement).offsetHeight : DEFAULT_ROW_HEIGHT;
                const rowCount = this.options.viewportRowsCount; // || DEFAULT_ROW_COUNT;
                let bodyHeight = rowHeight * rowCount;
                domel(this.bodyDiv)
                    .setStyle('height', `${bodyHeight}px`);
    
                setTimeout(() => {
                    const sbHeight = this.bodyViewportDiv.offsetHeight - this.bodyViewportDiv.clientHeight;
                    bodyHeight = bodyHeight + sbHeight;
                    domel(this.bodyDiv)
                        .setStyle('height', `${bodyHeight}px`);

                        resolve();
                }, 100);

                return;
            }
            else if (this.containerInitialHeight > 0) {
                const bodyHeight = this.containerInitialHeight - this.headerDiv.offsetHeight - this.footerDiv.offsetHeight;
                domel(this.bodyDiv)
                    .setStyle('height', `${bodyHeight}px`);

            }
            resolve();
        })
        .then(() => {
            if (this.options.fixHeightOnFirstRender && this.firstRender) {
                this.slot.style.height = `${this.slot.offsetHeight}px`
            }
        });
        
    }

    protected renderHeader() {
        this.headerDiv = domel('div')
            .addClass(`${this.cssPrefix}-header`)
            .toDOM();

            this.headerViewportDiv = domel('div', this.headerDiv)
            .addClass(`${this.cssPrefix}-header-viewport`)
            .toDOM();

        this.headerCellContainerDiv = domel('div', this.headerViewportDiv)
            .addClass(`${this.cssPrefix}-header-cell-container`)
            .toDOM();

            this.headerRowDiv = domel('div', this.headerCellContainerDiv)
            .addClass(`${this.cssPrefix}-header-row`)
            .toDOM();
            
            this.columns.getItems().forEach((column, index) => {
                if (!column.isVisible) {
                    return;
                }
    
                let hd = this.renderColumnHeader(column, index);
                this.headerRowDiv.appendChild(hd);
    
                if (column.isRowNum) {
                    domel(hd)
                        .addChildElement(this.renderAddColumnButton());
                }
            }); 

        const containerWidth = this.columns.getItems().map(column => column.width).reduce((sum, current) => {return sum + current});
        domel(this.headerCellContainerDiv)
            .setStyle('width', `${containerWidth}px`)
    
    }

    protected hasData(): boolean {
        return this.dataTable.columns.count > 0;
    }

    protected renderColumnHeader(column: GridColumn, index: number): HTMLElement {
        let colBuilder = domel('div')
            .addClass(`${this.cssPrefix}-header-cell`)
            .data('col-idx', `${index + 1}`)
            .setStyle('width', `${column.width}px`);

        if (column.dataColumn) {
            colBuilder
                .data('col-id', `${column.dataColumn.id}`)
        }

        let colDiv = colBuilder.toDOM(); 

        domel('div', colDiv)
            .addClass(`${this.cssPrefix}-header-cell-resize`)

        if (!column.isRowNum) {
            domel('div', colDiv)
                .addClass(`${this.cssPrefix}-header-cell-label`)
                .text(column.label);
        }

        if (this.options.allowDragDrop) {
            eqDragManager.registerDraggableItem({
                element: colDiv,
                scope: "gridColumnMove",
                data: { column: column },
                renderer: (dragImage) => {
                    dragImage.innerHTML = '';

                    const attrLabel = document.createElement('div');
                    attrLabel.innerText = column.label;
                    dragImage.classList.add('ui-sortable-helper');
                    
                    dragImage.appendChild(attrLabel);
                },
                onDragStart: (ev) => {
                    ev.dropEffect = DropEffect.Allow;
                }
            });
        }

        return colDiv; 
    }

    protected renderBody() {
        this.bodyDiv = domel('div')
            .addClass(`${this.cssPrefix}-body`)
            .toDOM();

        this.bodyViewportDiv = domel('div', this.bodyDiv)
            .addClass(`${this.cssPrefix}-body-viewport`)
            .attr('tabIndex', '0')
            .toDOM();

        this.bodyCellContainerDiv = domel('div', this.bodyViewportDiv)
            .addClass(`${this.cssPrefix}-cell-container`)
            .toDOM();


        if (this.dataTable) {
            this.showProgress();
            this.rowsOnPagePromise = this.getRowsToRender()
                .then((rows) => {                    
                    this.hideProgress();

                    //prevent double rendering (bad solution, we have to figure out how to avoid this behavior properly)
                    this.bodyCellContainerDiv.innerHTML = '';

                    this.prevRowTotals = null;

                    if (rows.length) {
                        const calcTotals = this.calcTotals();
                        const keyCols = this.getTotalsKeyCols();
     
                        rows.forEach((row, index) => {
                            if (calcTotals)
                                this.updateTotalsState(keyCols, row);

                            const tr = this.renderRow(row, index);
                            this.bodyCellContainerDiv.appendChild(tr);
                        });
    
                        if (calcTotals && this.isLastPage()) {    
                            const row = new DataRow(this.dataTable.columns, new Array(this.dataTable.columns.count));
                            this.updateTotalsState(keyCols, row, true);
                        }
                    }

                    const containerWidth = this.columns.getItems()
                    .map(column => column.width).reduce((sum, current) => {return sum + current});
                    domel(this.bodyCellContainerDiv)
                        .setStyle('width', `${containerWidth}px`)

                    return rows.length;
                })
                .catch(error => { console.error(error); return 0 });

        }

        this.bodyViewportDiv.addEventListener('scroll', ev => {
            domel(this.headerViewportDiv)
                .setStyle('margin-left', `-${this.bodyViewportDiv.scrollLeft}px`);
        })

        this.bodyViewportDiv.addEventListener('keydown', this.onVieportKeydown.bind(this));
    }

    private isLastPage() {
        return this.pagination.page * this.pagination.pageSize >= this.pagination.total;
    }

    private calcTotals(): boolean {
        return this.options.totals && (this.options.totals.calcGrandTotals || this.options.totals.calcSubTotals)
         && this.dataTable.columns.getItems()
            .filter(col => col.isAggr).length > 0;
    }

    private prevRowTotals: DataRow = null;

    private getTotalsKeyCols() {
        const keyCols = this.dataTable.columns.getItems()
            .filter(col => !col.isAggr);
        keyCols.pop();

        return keyCols;
    } 

    private updateTotalsState(keyCols: DataColumn[], newRow: DataRow, isLast = false) {
        if (this.prevRowTotals && this.options.totals.calcSubTotals) {
            let changeLevel = -1;
            for(let i = 0; i < keyCols.length; i++) {
                const col = keyCols[i];
                if (this.prevRowTotals.getValue(col.id) !== newRow.getValue(col.id)) {
                    changeLevel = i;
                    break;
                }
            }

            if (changeLevel != -1) {
                for(let i = keyCols.length; i > changeLevel; i--) {
                    const row = new DataRow(this.dataTable.columns, this.prevRowTotals.toArray());
                    const tr = this.renderTotalsRow(i, row);
                    this.bodyCellContainerDiv.appendChild(tr);
                }
            }
        }

        if (isLast && this.options.totals.calcGrandTotals) {
            const tr = this.renderTotalsRow(0, newRow);
            this.bodyCellContainerDiv.appendChild(tr);
        }

        this.prevRowTotals = newRow;
    }

    private renderTotalsRow(level: number, row: DataRow): HTMLElement {
        const rowBuilder = domel('div')
                .addClass(`${this.cssPrefix}-row`)
                .addClass(`${this.cssPrefix}-row-totals`)
                .addClass(`${this.cssPrefix}-totals-lv${level}`)
                .data('totals-level', `${level}`)
                .attr('tabindex', '-1');

        const rowElement = rowBuilder.toDOM();
        this.columns.getItems().forEach((column, index) => {
            if (!column.isVisible) {
                return;
            }

            const colIndex = column.isRowNum ? -1 : this.dataTable.columns.getIndex(column.dataColumn.id);
            let val = (colIndex == level || level == 0 && colIndex == 0) ? this.getTotalsTitle(level) : '';
            if (colIndex == this.dataTable.columns.count - 1) {
                val = 'Calculating...'
            }

            rowElement.appendChild(this.renderCell(column, colIndex, val, rowElement));
        });
        
        const totals = this.options.totals.calculator.getTotals();
        totals.fillTotals(level, row)
            .then(() => {
                rowElement.innerHTML = '';

                this.columns.getItems().forEach((column, index) => {
                    if (!column.isVisible) {
                        return;
                    }
        
                    const colIndex = column.isRowNum ? -1 : this.dataTable.columns.getIndex(column.dataColumn.id);
                    let val = (colIndex == level || level == 0 && colIndex == 0) ? this.getTotalsTitle(level) : '';
                    if (!column.isRowNum && column.dataColumn.isAggr) {
                        val = row.getValue(colIndex);
                    }
        
                    rowElement.appendChild(this.renderCell(column, colIndex, val, rowElement));
                });
            })
            .catch((error) => console.error(error));
        
        return rowElement;
    }

    private getTotalsTitle(level: number) {
        return (level) ? 'Sub totals: ' : 'Grand totals: ';
    }

    private onVieportKeydown(ev: KeyboardEvent) {
        if (this.options.showActiveRow) {
            const rowCount = this.bodyCellContainerDiv.querySelectorAll(`.${this.cssPrefix}-row`).length;
            let newValue;
            switch (ev.key) {
                case 'ArrowLeft':
                    break;
                case 'ArrowRight':
                    break;
                case 'ArrowUp':
                    ev.preventDefault();
                    newValue = this.activeRowIndex < 0 || this.activeRowIndex >= rowCount ? rowCount - 1 : this.activeRowIndex - 1;
                    this.activeRowIndex = newValue >= 0 ? newValue : 0; 
                    break;
                case 'ArrowDown':
                    ev.preventDefault();
                    newValue = this.activeRowIndex < 0 || this.activeRowIndex >= rowCount ? 0 : this.activeRowIndex + 1;
                    this.activeRowIndex = newValue < rowCount ? newValue : rowCount - 1; 
                    break;
            }
        }
    }

    public ensureRowVisibility(rowOrIndex: HTMLElement | number) {
        const row = typeof rowOrIndex === 'number'
            ? this.getDataRow(rowOrIndex)
            : rowOrIndex;

        if (row) { 
            let rowRect = row.getBoundingClientRect();
            const viewportRect = this.bodyViewportDiv.getBoundingClientRect();

            const rowTop = rowRect.top - viewportRect.top;
            const rowBottom = rowRect.bottom - viewportRect.top;
            const viewportHeight = this.bodyViewportDiv.clientHeight;
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;

            if (rowTop > 0 && 
                rowBottom <= viewportHeight && 
                rowRect.top > 0 &&
                rowRect.bottom < windowHeight) {
            
                    return;
            }

            if (rowTop < 0) {
                this.bodyViewportDiv.scrollTop = this.bodyViewportDiv.scrollTop + rowTop;
            }
            else if (rowBottom > viewportHeight) {
                this.bodyViewportDiv.scrollTop = this.bodyViewportDiv.scrollTop + rowBottom - viewportHeight;
            }

            rowRect = row.getBoundingClientRect();

            if (rowRect.top < 0) {
                document.documentElement.scrollTop = document.documentElement.scrollTop + rowRect.top;
            }
            else if (rowRect.bottom > windowHeight) {
                document.documentElement.scrollTop = document.documentElement.scrollTop + rowRect.bottom - windowHeight;
            }
        }
    }


    private getRowsToRender():Promise<DataRow[]> {
        if (this.options.paging.enabled === false) {
            return Promise.resolve(this.dataTable.getCachedRows());
        }

        return this.dataTable.getRows({ 
            page: this.pagination.page, 
            pageSize: this.pagination.pageSize
        })
        .catch(error => {
            console.error(error);
            return [];
        });;
    }

    protected renderFooter() {
        this.footerDiv = domel('div')
                    .addClass(`${this.cssPrefix}-footer`)
                    .toDOM();

        this.footerPaginateDiv = this.renderPageNavigator();
        this.footerDiv.appendChild(this.footerPaginateDiv);
        const pageInfoBlock = this.renderPageInfoBlock();
        this.footerDiv.appendChild(pageInfoBlock);
    }

    protected renderPageInfoBlock(): HTMLDivElement {

        const pageInfoDiv = domel('div')
            .addClass(`${this.cssPrefix}-page-info`)
            .toDOM()

        if (this.rowsOnPagePromise) {
            this.rowsOnPagePromise.then(count => {

                const fistPageRecordNum = count ? (this.pagination.page - 1) * this.pagination.pageSize + 1 : 0;
                const lastPageRecordNum = count ? fistPageRecordNum + count - 1 : 0;
                const total = this.dataTable.getTotal();

                pageInfoDiv.innerHTML = i18n.getText('GridPageInfo')
                    .replace('{FirstPageRecordNum}', `<span>${fistPageRecordNum.toString()}</span>`)
                    .replace('{LastPageRecordNum}', `<span>${lastPageRecordNum.toString()}</span>`)
                    .replace('{Total}', `<span>${total.toString()}</span>`);
            });
        }
    

        return pageInfoDiv;
    }

    protected showProgress() {

    }

    protected hideProgress() {

    }

    protected getLocalIndexByGlobal(index: number) {
        if (this.pagination) {
            return index % this.pagination.pageSize;
        }
        else {
            return index;
        }
    }

    protected getGlobalIndexByLocal(index: number) {
        if (this.pagination) {
            return (this.pagination.page - 1) * this.pagination.pageSize + index;
        }
        else {
            return index;
        }
    }

    protected renderRow(row: DataRow, index: number): HTMLDivElement {
        let indexGlobal = this.getGlobalIndexByLocal(index);

        let rowBuilder = domel('div')
                .addClass(`${this.cssPrefix}-row`)
                .addClass(`${this.cssPrefix}-row-${index % 2 == 1 ? 'odd' : 'even'}`)
                .data('row-idx', `${indexGlobal}`)
                .attr('tabindex', '-1')
                .on('click', (ev) => {
                    this.activeRowIndex = index;
 
                    this.fireEvent({
                        type: 'rowClick',
                        row:  row,
                        rowIndex: index,
                        sourceEvent: ev
                    } as RowClickEvent)
                })
                .on('dblclick', (ev) => {
                    this.fireEvent({
                        type: 'rowDbClick',
                        row: row,
                        rowIndex: index,
                        sourceEvent: ev
                    } as RowClickEvent)
                });
        
        if (index == 0) {
            rowBuilder.addClass(`${this.cssPrefix}-row-first`);
        }

        let rowElement = rowBuilder.toDOM();

        if (this.options.showActiveRow && index == this.activeRowIndex) {
            rowBuilder.addClass(`${this.cssPrefix}-row-active`);
        }

        this.columns.getItems().forEach((column) => {
            if (!column.isVisible) {
                return;
            }

            const colindex = column.isRowNum ? -1 : this.dataTable.columns.getIndex(column.dataColumn.id);
            let val = column.isRowNum ? indexGlobal + 1 : row.getValue(colindex);

            rowElement.appendChild(this.renderCell(column, colindex, val, rowElement));
        });
        
        return rowElement;
    }

    protected renderCell(column: GridColumn, colIndex: number, value: any, rowElement: HTMLElement): HTMLDivElement {
        let builder = domel('div')
            .addClass(`${this.cssPrefix}-cell`)
            .data('col-idx', `${colIndex}`)
            .attr('tabindex', '-1')
            .setStyle('width', `${column.width}px`);

        if (column.align == GridColumnAlign.LEFT) {
            builder.addClass(`${this.cssPrefix}-cell-align-left`);
        }
        else if (column.align == GridColumnAlign.RIGHT) {
            builder.addClass(`${this.cssPrefix}-cell-align-right`);
        }
        else if (column.align == GridColumnAlign.CENTER) {
            builder.addClass(`${this.cssPrefix}-cell-align-center`);
        }

        if (column.cellRenderer) {
            column.cellRenderer(value, column, builder.toDOM(), rowElement);
        }

        return builder.toDOM();
    }

    protected renderPageNavigator(): HTMLDivElement {
        let paginateDiv = document.createElement('div');
        paginateDiv.className = `${this.cssPrefix}-pagination-wrapper`;

        this.pagination.total = this.dataTable.getTotal();
        if (this.options.paging && this.options.paging.enabled
             && this.pagination.total > this.pagination.pageSize) {
            const prefix = this.paginationOptions.useBootstrap ? '' : `${this.cssPrefix}-`;
            paginateDiv.innerHTML = "";

            const pageIndex = this.pagination.page || 1;
            const pageCount = Math.ceil(this.pagination.total / this.pagination.pageSize) || 1;
        
            const buttonClickHandler = (ev: MouseEvent) => {
                const element = ev.target as HTMLElement;
                if (element.hasAttribute('data-page')) {
                    let page = parseInt(element.getAttribute('data-page'));
                    this.pagination.page = page;
                    this.fireEvent({ type: "pageChanged", page: page });
                    this.refresh();
                    this.bodyViewportDiv.focus();
                }        
            };
        
            const maxButtonCount = this.paginationOptions.maxButtonCount || 10;
            const zeroBasedIndex = pageIndex - 1;
            let firstPageIndex = zeroBasedIndex - (zeroBasedIndex % maxButtonCount) + 1;
            let lastPageIndex = firstPageIndex + maxButtonCount - 1;
            if (lastPageIndex > pageCount) {
                lastPageIndex = pageCount;
            }
        
            let ul = document.createElement('ul');
            ul.className = `${prefix}pagination`;
        
            let li = document.createElement('li');
            li.className = `${prefix}page-item`;
        
            let a:HTMLElement = document.createElement('span');
            a.setAttribute("aria-hidden", 'true');
        
            a.className = `${prefix}page-link`;
        
            if (firstPageIndex == 1) {
                li.className += " disabled";
            }
            else {
                if (this.paginationOptions.useBootstrap) {
                    a = document.createElement('a');
                    a.setAttribute('href', 'javascript:void(0)');
                    a.setAttribute("data-page", `${firstPageIndex - 1}`);
                } 
                else {
                    let newA = document.createElement('a');
                    newA.setAttribute('href', 'javascript:void(0)');
                    newA.setAttribute("data-page", `${firstPageIndex - 1}`);
                    a = newA; 
                }
                a.className = `${prefix}page-link`;
                a.addEventListener("click", buttonClickHandler);
            }
            a.innerHTML = "&laquo;";
        
            li.appendChild(a);
            ul.appendChild(li);
        
            for (let i = firstPageIndex; i <= lastPageIndex; i++) {
                li = document.createElement('li');
                li.className = `${prefix}page-item`;

                if (i == pageIndex)
                    li.className += " active";
        
                a = document.createElement('a');
                a.setAttribute('href', 'javascript:void(0)');
                a.innerHTML = i.toString();
                a.setAttribute('data-page', i.toString());
                a.className = `${prefix}page-link`;
                a.addEventListener("click", buttonClickHandler);
                li.appendChild(a);
                ul.appendChild(li);
            }
        
            li = document.createElement('li');
            li.className = `${prefix}page-item`;
            a = document.createElement("span");
            a.setAttribute('aria-hidden', 'true');
        
            a.className = `${prefix}page-link`;
            if (lastPageIndex == pageCount) {
                li.className += " disabled";
            }
            else {
                if (this.paginationOptions.useBootstrap) {
                    a = document.createElement('a');
                    a.setAttribute('href', 'javascript:void(0)');
                    a.setAttribute("data-page", `${lastPageIndex + 1}`);
                } else {
                    let newA = document.createElement('a');
                    newA.setAttribute('href', 'javascript:void(0)');
                    newA.setAttribute("data-page", `${lastPageIndex + 1}`);
                    a = newA; 
                }
                a.className = `${prefix}page-link`;
                a.addEventListener("click", buttonClickHandler);
            }
            a.innerHTML = "&raquo;";
        
            li.appendChild(a);
            ul.appendChild(li);

            paginateDiv.appendChild(ul);   
        }
        return paginateDiv;
    }

    public addEventListener(eventType: 'init', handler: () => void): string;
    public addEventListener(eventType: 'rowClick', handler: (ev: RowClickEvent) => void): string;
    public addEventListener(eventType: 'rowDbClick', handler: (ev: RowClickEvent) => void): string;
    public addEventListener(eventType: 'pageChanged', handler: (ev: PageChangedEvent) => void): string;
    public addEventListener(eventType: 'addColumnClick', handler: (ev: AddColumnClickEvent) => void): string;
    public addEventListener(eventType: 'columnChanged', handler: (ev: ColumnChangedEvent) => void): string;
    public addEventListener(eventType: 'columnMoved', handler: (ev: ColumnMovedEvent) => void): string;
    public addEventListener(eventType: 'columnDeleted', handler: (ev: ColumnDeletedEvent) => void): string;
    public addEventListener(eventType: 'activeRowChanged', handler: (ev: ActiveRowChangedEvent) => void): string;
    public addEventListener(eventType: GridEventType | string, handler: (data: any) => void): string {
        return this.eventEmitter.subscribe(eventType, event => handler(event.data));
    }
    
    public removeEventListener(eventType: string, handlerId: string) {
        this.eventEmitter.unsubscribe(eventType, handlerId);
    } 

    protected renderAddColumnButton(): HTMLElement {
        if (this.options.addColumns) {

            return domel('div')
                .addClass(`${this.cssPrefix}-addrow`)
                .title(this.options.addColumnsTitle || 'Add column')
                .addChild('a', builder => builder
                    .attr('href', 'javascript:void(0)')
                    .on('click', (e) => {
                        e.preventDefault();   
                        this.fireEvent({
                            type: 'addColumnClick',
                            sourceEvent: e
                        } as AddColumnClickEvent);
                    })
                )
                .toDOM();
        }

        return domel('span')
            .addText('#')
            .toDOM();
    }


    private landingIndex = -1;
    private landingSlot = domel('div')
                .addClass(`${this.cssPrefix}-col-landing-slot`)
                .addChildElement(
                    domel('div')
                    .toDOM())
                .toDOM();
    
    private showLandingSlot(pageX: number, pageY: number) {

        const colElems = this.headerRowDiv.querySelectorAll(`[class*=${this.cssPrefix}-table-col]`) as NodeListOf<HTMLElement>;
        const cols: HTMLElement[] = [];

        for(let i = 1; i < colElems.length; i++) {

            const rowElem = colElems[i];
            if (rowElem.style.display === 'none')
                continue;

            cols.push(rowElem)
        }

        if (cols.length === 0) {
            this.landingIndex = 0;
            this.headerRowDiv.appendChild(this.landingSlot);
            return;
        }

        const landingPos = getElementAbsolutePos(this.landingSlot);
        if (pageX >= landingPos.x && pageX <= landingPos.x + this.landingSlot.offsetWidth) {
            return;
        }

        let newLandingIndex = this.landingIndex;
        for (let col of cols) {
            const colPos = getElementAbsolutePos(col);
            const width = col.offsetWidth;

            if (pageX > colPos.x && pageX < colPos.x + width) {
                // -1 as we don't need to count add button here
                newLandingIndex = parseInt(col.getAttribute('data-col-idx')) - 1;
            }
        }

        if (newLandingIndex != this.landingIndex) {
            this.landingIndex = newLandingIndex;

            if (this.landingIndex < cols.length) {
                this.headerRowDiv.insertBefore(this.landingSlot, cols[this.landingIndex]);
            }
            else {
                this.headerRowDiv.appendChild(this.landingSlot);
            }

        }
    }

    private hideLandingSlot() {
        this.landingIndex = -1;
        setTimeout(() => {
            if (this.landingSlot.parentElement) {
                this.landingSlot.parentElement.removeChild(this.landingSlot);
            }
        }, 10);
    }

    private _activeRowIndex: number = -1;
    get activeRowIndex(): number {
        return this._activeRowIndex;
    }
    set activeRowIndex(value: number) {
        if (value !== this._activeRowIndex) {
            const oldValue = this._activeRowIndex;
            this._activeRowIndex = value;
            this.updateActiveRow();
            this.fireEvent({
                type: 'activeRowChanged',
                oldValue,
                newValue: this.activeRowIndex,
                rowIndex: this.getGlobalIndexByLocal(this.activeRowIndex)
            } as ActiveRowChangedEvent)
        }
    }

    private updateActiveRow() {
        if (this.options.showActiveRow) {
            const rows = this.bodyCellContainerDiv.querySelectorAll(`[class*=${this.cssPrefix}-row-active]`) as NodeListOf<HTMLElement>;
            rows.forEach(el => { el.classList.remove(`${this.cssPrefix}-row-active`)});

            const activeRow = this.getActiveRow();
            if (activeRow) {
                activeRow.classList.add(`${this.cssPrefix}-row-active`);
                this.ensureRowVisibility(this.activeRowIndex);
            }
        }
    }

    private getActiveRow(): HTMLElement {
        return this.getDataRow(this.activeRowIndex);
    }

    private getDataRow(index: number): HTMLElement {
        const rows = Array.from(this.bodyCellContainerDiv.querySelectorAll<HTMLElement>(`.${this.cssPrefix}-row:not(.${this.cssPrefix}-row-totals)`));
        if (index >= 0 && index < rows.length)
            return rows[index];
        return null;
    }

    public focus() {
        this.bodyViewportDiv.focus();
    }
}