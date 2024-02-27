import { 
    EventEmitter, EasyDataTable, 
    DataRow, utils, i18n, DataType,
    DataGroup
} from '@easydata/core';

import { eqDragManager, DropEffect } from '../utils/drag_manager';
import { domel } from '../utils/dom_elem_builder';
import { getElementAbsolutePos, eqCssPrefix } from '../utils/ui-utils';

import { EasyGridOptions, AutoResizeColumns } from './easy_grid_options';
import { 
    GridEventType, GridEvent, 
    ColumnMovedEvent, 
    RowClickEvent,
    AddColumnClickEvent as PlusButtonClickEvent,
    PageChangedEvent,
    ColumnChangedEvent,
    ColumnDeletedEvent,
    ActiveRowChangedEvent
} from './easy_grid_events';

import { EasyGridBase } from './easy_grid_types';
import { GridColumnList, GridColumn, GridColumnAlign } from './easy_grid_columns';
import { CellRendererType, GridCellRenderer, GridCellRendererStore } from './easy_grid_cell_renderer';

interface PaginationInfo {
    page: number,
    total: number,
    pageSize: number
}

const DEFAULT_ROW_HEIGHT = 36;
const DEFAULT_ROW_COUNT = 15;

/** Represents a grid widget with columns rows, paging, custom rendering and more */
export class EasyGrid implements EasyGridBase {
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
        useBootstrap: false
    }

    protected defaultDataGridOptions : EasyGridOptions = {
        slot: null,
        dataTable: null,
        fixHeightOnFirstRender: false,
        syncGridColumns: true,
        useRowNumeration: true,
        allowDragDrop: false,
        aggregates: {
            settings: null,
            calculator: null
        },
        paging: {
            enabled: true,
            pageSize: 30,
            pageSizeItems: [20, 30, 50, 100, 200]
        },
        columnWidths: {
            autoResize: AutoResizeColumns.Always,
            stringColumns: {
                min: 100,
                max: 500,
                default: 250
            },
            numberColumns: {
                min: 60,
                default: 120
            },
            boolColumns: {
                min: 50,
                default: 80
            },
            dateColumns: {
                min: 80,
                default: 200
            },
            otherColumns: {
                min: 100,
                max: 500,
                default: 250
            },
            rowNumColumn: {
                min: 40,
                default: 60
            }
        },
        showPlusButton: false,
        viewportRowsCount: null,
        showActiveRow: true
    }

    public readonly options: EasyGridOptions;

    /** Creates and initializes all internal properties of the grid object */
    constructor(options: EasyGridOptions) {
        if (options && options.paging) {
            options.paging = utils.assign(this.defaultDataGridOptions.paging,
                options.paging);
        }
     
        this.options = this.mergeOptions(options);
        this.processColumnWidthsOptions();

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

    private mergeOptions(options: EasyGridOptions): EasyGridOptions {
        const aggrOptions = utils.assignDeep({}, this.defaultDataGridOptions.aggregates, options.aggregates )
        const colWidthOptions = utils.assignDeep({}, this.defaultDataGridOptions.columnWidths, options.columnWidths);
        const pagingOptions = utils.assignDeep({}, this.defaultDataGridOptions.paging, options.paging);

        const result: EasyGridOptions = utils.assign({}, this.defaultDataGridOptions, options);
        
        result.aggregates = aggrOptions;
        result.columnWidths = colWidthOptions;
        result.paging = pagingOptions;
        
        return result;
    }

    private processColumnWidthsOptions() {
        const widthOptions = this.options.columnWidths;
        if (!widthOptions) return;

        //string columns
        utils.getStringDataTypes().forEach(dataType => {
            widthOptions[dataType] = { ...widthOptions.stringColumns, ...widthOptions[dataType] };
        });

        //numeric columns
        utils.getNumericDataTypes().forEach(dataType => {
            widthOptions[dataType] = { ...widthOptions.numberColumns, ...widthOptions[dataType] };
        });

        //bool columns
        widthOptions[DataType.Bool] = { ...widthOptions.boolColumns, ...widthOptions[DataType.Bool] };

        //date columns
        utils.getDateDataTypes().forEach(dataType => {
            widthOptions[dataType] = { ...widthOptions.dateColumns, ...widthOptions[dataType] };
        });

        //other columns
        const knownTypes = [
            ...utils.getStringDataTypes(),
            ...utils.getNumericDataTypes(),
            ...utils.getDateDataTypes(),
            DataType.Bool
        ]

        utils.getAllDataTypes().forEach(dataType => {
            if (!(dataType in knownTypes)) {
                widthOptions[dataType] = { ...widthOptions.otherColumns, ...widthOptions[dataType] };
            }
        });
        widthOptions[DataType.Unknown] = widthOptions.otherColumns;
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

    /** Initializes grid widget according to the options passed in the parameter */
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
        if (options.onPlusButtonClick) {
            this.addEventListener('plusButtonClick', options.onPlusButtonClick);
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

        utils.assign(this.paginationOptions, options.pagination);

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

    /** Fires a grid event. You can pass either an event type 
     * (like 'init', 'rowClick', 'pageChanged', etc ) 
     * or a ready-to-use grid event object
     * */
    public fireEvent(event: GridEvent | GridEventType) {
        if (typeof event === "string") {
            this.eventEmitter.fire(event);
        }
        else {
            this.eventEmitter.fire(event.type, event);
        }
    }

    /** Allows to set the data (represented by a EasyDataTable object)
     *  or to replace the existing one associated with the grid */
    public setData(data: EasyDataTable) {
        this.dataTable = data;
        this.clear();
        this.refresh();
    }

    /** Returns the EasyDataTable object associated with the grid via `setData()` call */
    public getData(): EasyDataTable {
        return this.dataTable;
    }

    /** Gets the list of grid columns */
    public getColumns(): GridColumnList {
        return this.columns;
    }

    /** This function is called when the grid is destroyed */
    public destroy() {
        this.slot.innerHTML = "";
    }

    /** Clears the current DOM object and re-renders everything from the scratch */
    public refresh() {
        this.clearDOM();
        this.render();
    }

    protected clearDOM() {
        this.slot.innerHTML = '';
    }

    /** Clears all DOM object in the grid and return it to its initial state */
    public clear() {
        this.pagination.page = 1;
        this.clearDOM();
    }

    private containerInitialHeight: number = 0;

    private firstRender = true;

    /** Renders the grid */
    protected render() {
        if (!this.hasData() && !this.options.showPlusButton) 
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

        const needAutoResize = this.options.columnWidths.autoResize !== AutoResizeColumns.Never;

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
                this.updateHeight()
                .then(() => {
                    this.firstRender = false;
                    if (needAutoResize) {
                        this.resizeColumns();
                    }
                });
            }, 100);    
        }
    }

    protected updateHeight() {
        return new Promise<void>((resolve) => {
            if (this.options.viewportRowsCount) {
                const firstRow = this.bodyCellContainerDiv.firstElementChild;
                const rowHeight = firstRow ? (firstRow as HTMLElement).offsetHeight : DEFAULT_ROW_HEIGHT;
                const rowCount = this.options.viewportRowsCount; // || DEFAULT_ROW_COUNT;
                let viewportHeight = rowHeight * rowCount;
                domel(this.bodyViewportDiv)
                    .setStyle('height', `${viewportHeight}px`);
    
                setTimeout(() => {
                    const sbHeight = this.bodyViewportDiv.offsetHeight - this.bodyViewportDiv.clientHeight;
                    viewportHeight = viewportHeight + sbHeight;
                    domel(this.bodyViewportDiv)
                        .setStyle('height', `${viewportHeight}px`);

                        resolve();
                }, 100);

                return;
            }
            else if (this.containerInitialHeight > 0) {
                // comment for now since it does not work in all cases
                // const bodyHeight = this.containerInitialHeight - this.headerDiv.offsetHeight - this.footerDiv.offsetHeight;
                // domel(this.bodyDiv)
                //     .setStyle('height', `${bodyHeight}px`);
            }
            resolve();
        })
        .then(() => {
            if (this.options.fixHeightOnFirstRender && this.firstRender) {
                this.slot.style.height = `${this.slot.offsetHeight}px`
            }
        });        
    }

    protected getContainerWidth() : number {
        return this.columns.getItems()
            .filter(col => col.isVisible)
            .map(col => col.width)
            .reduce((sum, current) => {return sum + current});
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
                        .addChildElement(this.renderHeaderButtons());
                }
            }); 

        const containerWidth = this.getContainerWidth();
        domel(this.headerCellContainerDiv)
            .setStyle('width', `${containerWidth}px`)
    
    }

    protected hasData(): boolean {
        return this.dataTable.columns.count > 0;
    }

    protected renderColumnHeader(column: GridColumn, index: number): HTMLElement {
        let colBuilder = domel('div')
            .addClass(`${this.cssPrefix}-header-cell`)
            .data('col-idx', `${index}`)
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

        if (column.description) {
            domel('div', colDiv)
                .addClass('question-mark')
                .title(column.description);
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
                    dragImage.classList.add(`${this.cssPrefix}-sortable-helper`);
                    
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

        const showAggrs = this.canShowAggregates();

        if (this.dataTable) {
            this.showProgress();
            this.rowsOnPagePromise = this.getRowsToRender()
                .then((rows) => { 
                    this.pagination.total = this.dataTable.getTotal();

                    this.hideProgress();

                    //prevent double rendering (bad solution, we have to figure out how to avoid this behavior properly)
                    this.bodyCellContainerDiv.innerHTML = '';

                    this.prevRowTotals = null;

                    let rowsToRender = 0;                            
                    if (rows.length) {
                        const groups = showAggrs 
                            ? this.options.aggregates.settings.getGroups() 
                            : [];
                            

                        rowsToRender = (rows.length < this.pagination.pageSize)
                                ? rows.length
                                : this.pagination.pageSize;
                                
                        rows.forEach((row, index) => {
                            if (showAggrs)
                                this.updateTotalsState(groups, row);

                            //we don't actually render the last row
                            if (index < rowsToRender) {
                                const tr = this.renderRow(row, index);
                                this.bodyCellContainerDiv.appendChild(tr);    
                            }    
                        });
    
                        const showGrandTotalsOnEachPage = this.options.aggregates && this.options.aggregates.showGrandTotalsOnEachPage;
                        if (showAggrs && (this.isLastPage() || showGrandTotalsOnEachPage)) {
                            const row = new DataRow(this.dataTable.columns, new Array(this.dataTable.columns.count));
                            this.updateTotalsState(groups, row, true);
                        }
                    }

                    const needAutoResize = this.options.columnWidths.autoResize !== AutoResizeColumns.Never;
                    if (needAutoResize) {
                        this.resizeColumns();
                    }
                    else {
                        const containerWidth = this.getContainerWidth();
                        domel(this.bodyCellContainerDiv)
                            .setStyle('width', `${containerWidth}px`);                    
                    }

                    return rowsToRender;
                })
                .catch(error => { console.error(error); return 0 });
        }

        this.bodyViewportDiv.addEventListener('scroll', ev => {
            domel(this.headerViewportDiv)
                .setStyle('margin-left', `-${this.bodyViewportDiv.scrollLeft}px`);
        })

        this.bodyViewportDiv.addEventListener('keydown', this.onViewportKeydown.bind(this));
    }

    private isLastPage() {
        if (this.dataTable.elasticChunks) {
            return this.dataTable.totalIsKnown()
                && (this.pagination.page * this.pagination.pageSize) >= this.pagination.total;
        }

        return this.pagination.page * this.pagination.pageSize >= this.pagination.total;
    }

    private canShowAggregates(): boolean {
        if (!this.options || !this.options.aggregates || !this.options.aggregates.settings)
            return false;

        const aggrSettings = this.options.aggregates.settings;
        const result = (aggrSettings.hasAggregates() || aggrSettings.hasRecordCount()) 
                        && (aggrSettings.hasGroups() || aggrSettings.hasGrandTotals()); 
        return result;
    }

    private prevRowTotals: DataRow = null;

    private updateTotalsState(groups: DataGroup[], newRow: DataRow, isLast = false) {
        const aggrSettings = this.options.aggregates.settings;
        if (this.prevRowTotals && aggrSettings.hasGroups()) {
            let changeLevel = -1;
            for (let level = 1; level <= groups.length; level++) {
                const group = groups[level - 1];
                for (const col of group.columns) {
                    if (!aggrSettings.compareValues(this.prevRowTotals.getValue(col), newRow.getValue(col))) {
                        changeLevel = level;
                        break;
                    }
                }

                if (changeLevel !== -1)
                    break;
            }
          
            if (changeLevel !== -1) {
                for (let level = groups.length; level >= changeLevel; level--) {
                    const row = new DataRow(this.dataTable.columns, this.prevRowTotals.toArray());                    
                    const tr = this.renderTotalsRow(level, row);
                    this.bodyCellContainerDiv.appendChild(tr);
                }
            }
        }

        if (isLast && aggrSettings.hasGrandTotals() && aggrSettings.hasAggregates()) {
            const tr = this.renderTotalsRow(0, newRow);
            this.bodyCellContainerDiv.appendChild(tr);
        }

        this.prevRowTotals = newRow;
    }

    private applyGroupColumnTemplate(template: string, value: any, count: number): string {
        let result = template.replace(/{{\s*GroupValue\s*}}/g, value ? `${value}` : '-');
        result = result.replace(/{{\s*GroupCount\s*}}/g, count ? `${count}` : '-');
        return result;
    }

    private renderTotalsRow(level: number, row: DataRow): HTMLElement {
        const aggrSettings = this.options.aggregates.settings;
        const group = (level > 0)
            ?  aggrSettings.getGroups()[level - 1]
            : { columns: [], aggregates: aggrSettings.getAggregates() };

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

            let val = '';
            const colIndex = !column.isRowNum
                ? this.dataTable.columns.getIndex(column.dataColumn.id)
                : -1;

            if (!column.isRowNum && column.dataColumn) {
                if (group.columns.indexOf(column.dataColumn.id) >= 0) {
                    val = row.getValue(colIndex);
                };
            }
                           
            if (colIndex == this.dataTable.columns.count - 1) {
                val = '.  .  .  .  .  .'
            }

            rowElement.appendChild(this.renderCell(column, index, val, rowElement));
        });
        
        const aggrContainer = this.options.aggregates.calculator.getAggrContainer();
        const aggrCols = aggrSettings.getAggregates().map(c => c.colId);

        const key = aggrSettings.buildGroupKey(group, row);

        aggrContainer.getAggregateData(level, key)
            .then((values) => {
                for (const aggrColId of aggrCols) {
                    row.setValue(aggrColId, values[aggrColId]);
                }

                rowElement.innerHTML = '';

                this.columns.getItems().forEach((column, index) => {
                    if (!column.isVisible) {
                        return;
                    }
        
                    let val = '';
                    const colIndex = !column.isRowNum
                        ? this.dataTable.columns.getIndex(column.dataColumn.id)
                        : -1;
    
                    if (!column.isRowNum) {
                        let isLastGroupColumn = false;
                        if (column.dataColumn) {
                            const groupColIndex = group.columns.indexOf(column.dataColumn.id);
                            const aggrColIndex = aggrCols.indexOf(column.dataColumn.id);
                            if (level > 0) {
                                isLastGroupColumn = groupColIndex == group.columns.length - 1;
                            } 
                            else {
                                //if it's a grand total row consider first column as the last group column
                                isLastGroupColumn = colIndex == 0;
                            }

                            if (groupColIndex >= 0 || aggrColIndex >= 0) {
                                val = row.getValue(colIndex);
                            };
                        }
           
                        let groupFooterTemplate = '';
                        
                        if (level > 0) {
                            groupFooterTemplate = column.dataColumn.groupFooterColumnTemplate;  
                            //set the default template for the last grouping column
                            if (!groupFooterTemplate && aggrSettings.hasRecordCount() && isLastGroupColumn) {
                                groupFooterTemplate = '{{GroupValue}} ({{GroupCount}})';
                            }
                        } 

                        if (groupFooterTemplate) {
                            const cellDiv = this.renderCell(column, index, val, rowElement);
                            const innerCell = (cellDiv.firstChild as HTMLElement);
                            val = innerCell.innerHTML;
                            val = this.applyGroupColumnTemplate(groupFooterTemplate, val, values[aggrSettings.COUNT_FIELD_NAME]);
                        }
                    }    

                    const cellDiv = this.renderCell(column, index, val, rowElement);
                    rowElement.appendChild(cellDiv);
                });
            })
            .catch((error) => console.error(error));
        
        return rowElement;
    }

    private onViewportKeydown(ev: KeyboardEvent) {
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


    /** Returns a promise with the list of the rows to render on one page.
     * The list contains pageSize+1 row to make it possible 
     * to render the totals row (if it appears to be on the edge between pages) 
     */
    private getRowsToRender():Promise<DataRow[]> {
        if (this.options.paging.enabled === false) {
            return Promise.resolve(this.dataTable.getCachedRows());
        }

        return this.dataTable.getRows({ 
            offset: (this.pagination.page - 1) * this.pagination.pageSize,
            limit: this.pagination.pageSize + 1
        })
        .catch(error => {
            console.error(error);
            return [];
        });
    }

    protected renderFooter() {
        this.footerDiv = domel('div')
                    .addClass(`${this.cssPrefix}-footer`)
                    .toDOM();
        
        if (this.rowsOnPagePromise) {
            this.rowsOnPagePromise.then(count => {
                this.footerDiv.innerHTML = '';

                this.footerPaginateDiv = this.renderPageNavigator();
                this.footerDiv.appendChild(this.footerPaginateDiv);
                const pageInfoBlock = this.renderPageInfoBlock(count);
                this.footerDiv.appendChild(pageInfoBlock);
            });
        }   
    }

    protected renderPageInfoBlock(count: number): HTMLDivElement {
        const pageInfoDiv = domel('div')
            .addClass(`${this.cssPrefix}-page-info`)
            .toDOM()

        const rowCount = this.dataTable.getTotal();
        if (rowCount > 0) {
            const fistPageRecordNum = count 
                ? (this.pagination.page - 1) * this.pagination.pageSize + 1 
                : 0;

            const lastPageRecordNum = count 
                ? fistPageRecordNum + count - 1 
                : 0;
                
            let totalStr = this.dataTable.getTotal().toString();

            if (this.dataTable.elasticChunks) {
                const count = this.dataTable.getCachedCount();
                const total = this.dataTable.getTotal();
                if (count !== total)
                    totalStr = '?';
            }

            pageInfoDiv.innerHTML = i18n.getText('GridPageInfo')
                .replace('{FirstPageRecordNum}', `<span>${fistPageRecordNum.toString()}</span>`)
                .replace('{LastPageRecordNum}', `<span>${lastPageRecordNum.toString()}</span>`)
                .replace('{Total}', `<span>${totalStr}</span>`);
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

        this.columns.getItems().forEach((column, index) => {
            if (!column.isVisible) {
                return;
            }

            const colindex = column.isRowNum ? -1 : this.dataTable.columns.getIndex(column.dataColumn.id);
            let val = column.isRowNum ? indexGlobal + 1 : row.getValue(colindex);

            rowElement.appendChild(this.renderCell(column, index, val, rowElement));
        });
        
        return rowElement;
    }

    protected renderCell(column: GridColumn, colIndex: number, value: any, rowElement: HTMLElement): HTMLDivElement {
        const builder = domel('div')
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

        const cellElement = builder.toDOM();
        const valueCell = cellElement.appendChild(
            domel('div')
            .addClass(`${this.cssPrefix}-cell-value`)
            .toDOM()
        );

        const cellRenderer = this.getCellRenderer(column);

        if (cellRenderer) {
            cellRenderer(value, column, valueCell, rowElement);
        }

        return cellElement;
    }

    public getCellRenderer(column : GridColumn) : GridCellRenderer {
        let cellRenderer : GridCellRenderer;
        if (column.isRowNum) {
            cellRenderer = this.cellRendererStore.getDefaultRendererByType(CellRendererType.NUMBER);
        }
        else {
            cellRenderer = this.cellRendererStore.getDefaultRenderer(column.type);
        }

        if (this.options && this.options.onGetCellRenderer) {
            cellRenderer = this.options.onGetCellRenderer(column, cellRenderer) || cellRenderer;
        }

        return cellRenderer;
    }

    /** Sets current grid pages (if paging is used) */
    public setPage(page: number) {
        this.pagination.page = page;
        this.fireEvent({ type: "pageChanged", page: page });
        this.refresh();
        this.bodyViewportDiv.focus();
    }

    protected renderPageNavigator(): HTMLDivElement {
        let paginateDiv = document.createElement('div');
        paginateDiv.className = `${this.cssPrefix}-pagination-wrapper`;
        const rowCount = this.dataTable.getTotal();

        const totalRows = this.dataTable.getTotal()
        const pageSize = this.pagination.pageSize
        const totalPages = Math.ceil(totalRows / pageSize)
        const distance: number = 10, islandSize = 3
        const prefix = this.paginationOptions.useBootstrap ? '' : `${this.cssPrefix}-`

        if (!this.options.paging || !this.options.paging.enabled || rowCount <= pageSize) {
            return paginateDiv
        }

        const buttonClickHandler = (ev: MouseEvent) => {
            const element = ev.target as HTMLElement;
            if (element.hasAttribute('data-page')) {
                const page = parseInt(element.getAttribute('data-page'));
                this.setPage(page);
            }
        };

        const renderPaginationItem = (
            pageIndex: number, 
            content?: string,
            disabled?: boolean, 
            extreme?: boolean, 
            active?: boolean
        ): HTMLElement => {
            const li = document.createElement('li');
            li.className = `${prefix}page-item`;

            if (!extreme) {
                if (active) {
                    li.className += ' active';
                }
                const a = document.createElement('a');
                a.setAttribute('href', 'javascript:void(0)');
                a.innerHTML = content || pageIndex.toString();
                a.setAttribute("data-page", `${pageIndex}`);
                a.className = `${prefix}page-link`;
                a.addEventListener("click", buttonClickHandler);
                li.appendChild(a);
                return li;
            }

            let a: HTMLElement = document.createElement('span');
            a.setAttribute('aria-hidden', 'true');

            a.className = `${prefix}page-link`;

            if (disabled) {
                li.className += ' disabled';
            }
            else {
                if (this.paginationOptions.useBootstrap) {
                    a = document.createElement('a');
                    a.setAttribute('href', 'javascript:void(0)');
                    a.setAttribute("data-page", `${pageIndex}`);
                }
                else {
                    let newA = document.createElement('a');
                    newA.setAttribute('href', 'javascript:void(0)');
                    newA.setAttribute('data-page', `${pageIndex}`);
                    a = newA;
                }
                a.className = `${prefix}page-link`;
                a.addEventListener("click", buttonClickHandler);
            }
            a.innerHTML = content;

            li.appendChild(a);

            return li;
        }

        const pageIndex = this.pagination.page || 1;

        let ul = document.createElement('ul');
        ul.className = `${prefix}pagination`;
        ul.style.userSelect = 'none'
        paginateDiv.appendChild(ul);

        if (this.dataTable.elasticChunks) {
            let cell = renderPaginationItem(pageIndex - 1, '&laquo;', pageIndex == 1, true, false);
            ul.appendChild(cell);

            cell = renderPaginationItem(pageIndex + 1, '&raquo;', this.isLastPage(), true, false);
            ul.appendChild(cell);
        } else {
            const prev = renderPaginationItem(pageIndex - 1, '&laquo;', pageIndex == 1, true, false)
            ul.appendChild(prev);

            ul.appendChild(renderPaginationItem(1, '1', pageIndex == 1, false, pageIndex === 1));
            
            if (distance === 0 || totalPages <= 10) {
                for (let i = 2; i < totalPages; i++) {
                    ul.appendChild(renderPaginationItem(i, `${i}`, pageIndex === i, false, pageIndex === i));
                } 
            } else {
                if (pageIndex < distance) {
                    for (let i = 2; i <= distance; i++) {
                        ul.appendChild(renderPaginationItem(i, `${i}`, false, false, pageIndex === i));
                    }

                    if (totalPages > distance) {
                        ul.appendChild(renderPaginationItem(-1, `...`, true, true, false))
                    }
                } else if (pageIndex <= totalPages && pageIndex > totalPages - distance + 1) {
                    if (totalPages > distance) {
                        ul.appendChild(renderPaginationItem(-1, `...`, true, true, false))
                    }

                    for (let i = totalPages - distance + 1; i < totalPages; i++) {
                        ul.appendChild(renderPaginationItem(i, `${i}`, pageIndex === i, false, pageIndex === i));
                    }
                } else {
                    ul.appendChild(renderPaginationItem(-1, `...`, true, true, false))

                    // Island Left Side
                    for(let i = islandSize; i > 0; i--) {
                        ul.appendChild(renderPaginationItem(pageIndex - i, `${pageIndex - i}`, false, false, false))
                    }
                    
                    // Center of Island
                    ul.appendChild(renderPaginationItem(pageIndex, `${pageIndex}`, false, false, true))
                    
                    // Island Right Size
                    for(let i = 1; i <= islandSize; i++) {
                        ul.appendChild(renderPaginationItem(pageIndex + i, `${pageIndex + i}`, false, false, false))
                    }

                    ul.appendChild(renderPaginationItem(-1, `...`, true, true, false))
                }
            }
            
            if (totalPages > 1 || pageIndex < totalPages) {
                ul.appendChild(renderPaginationItem(totalPages, `${totalPages}`, pageIndex === totalPages, false, pageIndex === totalPages))
            } 

            const next = renderPaginationItem(pageIndex + 1, '&raquo;', pageIndex == totalPages, true, false)
            ul.appendChild(next);

            if (pageIndex === 1) {
                prev.classList.add("disabled");
            }

            if (pageIndex === totalPages) {
                next.classList.add("disabled");
            }
        }

        if (this.options.paging.allowPageSizeChange) {
            const selectChangeHandler = (ev: Event) => {
                const newValue = parseInt((ev.target as HTMLOptionElement).value);
                this.pagination.pageSize = newValue;
                this.pagination.page = 1;
                this.refresh();
            };

            const pageSizes = document.createElement('div');
            pageSizes.className = `${this.cssPrefix}-page-sizes`;

            const selectSize = document.createElement('div');
            selectSize.className = `kfrm-select ${this.cssPrefix}-page-sizes-select`;
            pageSizes.appendChild(selectSize);

            const sel = document.createElement('select');
            const selOptions = this.options.paging.pageSizeItems || [];
            const selSet = new Set(selOptions);
            selSet.add(this.options.paging.pageSize || 20);


            Array.from(selSet).forEach(el => {
                const option = document.createElement("option");
                option.value = el.toString();
                option.text = el.toString();
                sel.appendChild(option);
            });

            sel.value = (this.pagination.pageSize || 20).toString();
            selectSize.appendChild(sel);
            sel.addEventListener('change', selectChangeHandler);

            const labelDiv = document.createElement('div');
            labelDiv.className = `${this.cssPrefix}-page-sizes-label`;
            pageSizes.appendChild(labelDiv);

            const label = document.createElement('span');
            label.innerText = i18n.getText('GridItemsPerPage');
            labelDiv.appendChild(label);

            paginateDiv.appendChild(pageSizes);
        }

        return paginateDiv;
    }

    public addEventListener(eventType: 'init', handler: () => void): string;
    public addEventListener(eventType: 'rowClick', handler: (ev: RowClickEvent) => void): string;
    public addEventListener(eventType: 'rowDbClick', handler: (ev: RowClickEvent) => void): string;
    public addEventListener(eventType: 'pageChanged', handler: (ev: PageChangedEvent) => void): string;
    public addEventListener(eventType: 'plusButtonClick', handler: (ev: PlusButtonClickEvent) => void): string;
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

    protected renderHeaderButtons(): HTMLElement {
        if (this.options.showPlusButton) {
            return domel('div')
                .addClass(`${this.cssPrefix}-header-btn-plus`)
                .title(this.options.plusButtonTitle || 'Add')
                .addChild('a', builder => builder
                    .attr('href', 'javascript:void(0)')
                    .on('click', (e) => {
                        e.preventDefault();   
                        this.fireEvent({
                            type: 'plusButtonClick',
                            sourceEvent: e
                        } as PlusButtonClickEvent);
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

    /** Makes the grid focused for keyboard events */
    public focus() {
        this.bodyViewportDiv.focus();
    }

    /** Resizes columns according to the data they represent */
    public resizeColumns() {
        if (this.options.columnWidths.autoResize === AutoResizeColumns.Never) return;

        const containerWidth = this.bodyCellContainerDiv.style.width;
        this.bodyCellContainerDiv.style.visibility = 'hidden';
        this.bodyCellContainerDiv.style.width = '1px';

        //this.headerRowDiv.style.visibility = 'hidden';
        this.headerRowDiv.style.width = '1px';
        
        let sumWidth = 0;
        const columns = this.columns.getItems();
        const headerCells = this.headerCellContainerDiv.querySelectorAll(`.${this.cssPrefix}-header-cell`);
        let headerIdx = 0;

        for (let idx = 0; idx < this.columns.count; idx++) {
            const column = columns[idx];
            if (!column.isVisible) continue;

            const calculatedWidth = this.options.columnWidths.autoResize !== AutoResizeColumns.Always && column.dataColumn 
                        ? column.dataColumn.calculatedWidth 
                        : 0;

            const cellValues = this.bodyCellContainerDiv.querySelectorAll(`.${this.cssPrefix}-cell[data-col-idx="${idx}"] > .${this.cssPrefix}-cell-value`);
            
            let maxWidth = 0;

            if (calculatedWidth > 0) {
                sumWidth += calculatedWidth
                column.width = calculatedWidth;

                cellValues.forEach(value => {
                    (value as HTMLDivElement).parentElement.style.width = `${calculatedWidth}px`;
                });

                (headerCells[headerIdx] as HTMLDivElement).style.width = `${calculatedWidth}px`;
            }
            else {
                if (cellValues.length == 0) {
                    (headerCells[headerIdx] as HTMLDivElement).style.width = null;
                    (headerCells[headerIdx] as HTMLDivElement).style.whiteSpace = 'nowrap';
                }
                maxWidth = (headerCells[headerIdx] as HTMLDivElement).offsetWidth;

                if (cellValues.length > 0) {
                    cellValues.forEach(value => {
                        (value as HTMLDivElement).parentElement.style.width = null;
                        const width = (value as HTMLDivElement).parentElement.offsetWidth;
                        if (width > maxWidth) {
                            maxWidth = width;
                        }
                    })

                    maxWidth += 3;

                    const maxOption = column.isRowNum 
                            ? this.options.columnWidths.rowNumColumn.max || 500 
                            : this.options.columnWidths[column.dataColumn.type].max || 2000;

                    const minOption = column.isRowNum 
                            ? this.options.columnWidths.rowNumColumn.min || 0 
                            : this.options.columnWidths[column.dataColumn.type].min || 20;

                    if (maxWidth > maxOption) {
                        maxWidth = maxOption;
                    }                

                    if (maxWidth < minOption) {
                        maxWidth = minOption;
                    }

                    if (utils.isNumericType(column.type)) {
                        //increase the calculated width in 1.3 times for numeric columns
                        maxWidth = Math.round(maxWidth * 1.3);
                    }

                    sumWidth += maxWidth;
                    column.width = maxWidth;

                    cellValues.forEach(value => {
                        (value as HTMLDivElement).parentElement.style.width = `${maxWidth}px`;
                    });

                    (headerCells[headerIdx] as HTMLDivElement).style.width = `${maxWidth}px`;

                    if (column.dataColumn) {
                        column.dataColumn.calculatedWidth = maxWidth;
                    }
                }
                else {
                    sumWidth += maxWidth;
                }
            }
            headerIdx++;
        }

        if (sumWidth > 0) {
            this.bodyCellContainerDiv.style.width = `${sumWidth}px`;
            this.headerCellContainerDiv.style.width = `${sumWidth}px`;
        }
        else {
            this.bodyCellContainerDiv.style.width = containerWidth;
            this.headerCellContainerDiv.style.width = containerWidth;
        }
        this.bodyCellContainerDiv.style.visibility = null;
        this.headerRowDiv.removeAttribute('style');
    }
}