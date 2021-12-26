import { DataRow, i18n, utils as dataUtils } from '@easydata/core';

import { 
    DefaultDialogService, 
    DialogService, domel, EasyGrid, 
    GridCellRenderer, GridColumn, RowClickEvent 
} from '@easydata/ui';

import { EntityEditFormBuilder } from '../form/entity_form_builder';
import { TextFilterWidget } from '../widgets/text_filter_widget';

import { DataContext } from '../main/data_context';
import { RequiredValidator } from '../validators/required_validator';
import { TypeValidator } from '../validators/type_validator';
import { Validator } from '../validators/validator';
import { EasyDataViewOptions } from './options';
import { setLocation } from '../utils/utils';

export class EntityDataView {

    private options: EasyDataViewOptions = {
        showBackToEntities: true
    }

    private dlg: DialogService;

    private grid: EasyGrid;

    private defaultValidators: Validator[] = [ new RequiredValidator(), new TypeValidator()];

    constructor (
        private slot: HTMLElement, 
        private context: DataContext, 
        private basePath: string,
        options: EasyDataViewOptions) {
        options = options || {}
        
        this.options = dataUtils.assignDeep(this.options, options || {});

        this.dlg = new DefaultDialogService();

        const ent = this.context.getActiveEntity();
        
        this.slot.innerHTML += `<h1>${ent.captionPlural || ent.caption}</h1>`;
        if (this.options.showBackToEntities) {
            domel(this.slot)
                .addChild('a', b => b
                    .attr('href', 'javascript:void(0)')
                    .text(`← ${i18n.getText('BackToEntities')}`)
                    .on('click', (e) => {
                        e.preventDefault();
                        setLocation(this.basePath);
                    })
                );
        }

        this.renderGrid();
    }

    private syncGridColumnHandler(column: GridColumn) {
        if (column.dataColumn) {
            const attr = this.context.getMetaData().getAttributeById(column.dataColumn.id);
            if (attr) {
                column.isVisible = attr.showOnView;
            }
        }
    }

    private renderGrid() {
        this.context.fetchDataset()
            .then(result => {
                const gridSlot = document.createElement('div');
                this.slot.appendChild(gridSlot);
                gridSlot.id = 'Grid';
                this.grid = new EasyGrid(dataUtils.assignDeep({
                    slot: gridSlot,
                    dataTable: result,
                    paging: {
                        pageSize: 15,
                        allowPageSizeChange: true,
                        pageSizeItems: [15, 30, 50, 100, 200]
                    },
                    addColumns: true,
                    addColumnsTitle: i18n.getText('AddBtnTitle'),
                    showActiveRow: false,
                    onAddColumnClick: this.addClickHandler.bind(this),
                    onGetCellRenderer: this.manageCellRenderer.bind(this),
                    onRowDbClick: this.rowDbClickHandler.bind(this),
                    onSyncGridColumn: this.syncGridColumnHandler.bind(this)
                }, this.options.grid || {}));

                let widgetSlot: HTMLElement;
                const filterBar = domel('div')
                    .addClass(`kfrm-form`)
                    .setStyle('margin', '10px 0px')
                    .addChild('div', b => 
                        widgetSlot = b.toDOM()
                    ).toDOM();
                
                this.slot.insertBefore(filterBar, gridSlot);

                const dataFilter = this.context.createFilter();
                new TextFilterWidget(widgetSlot, this.grid, dataFilter);
            });
    }

    private manageCellRenderer(column: GridColumn, defaultRenderer: GridCellRenderer) {
        if (column.isRowNum) {
            column.width = 110;
            return (value: any, column: GridColumn, cell: HTMLElement, rowEl: HTMLElement) => {
                const b = domel('div', cell)
                    .addClass(`keg-cell-value`);
                
                if (this.context.getActiveEntity().isEditable) {
                    b.addChild('a', b => b
                        .attr('href', 'javascript:void(0)')
                        .text(i18n.getText('EditBtn'))
                        .on('click', (ev) =>  this.editClickHandler(ev as MouseEvent, 
                            parseInt(rowEl.getAttribute('data-row-idx'))))
                    )
                    .addChild('span', b => b.text(' | '))
                    .addChild('a', b => b
                        .attr('href', 'javascript:void(0)')
                        .text(i18n.getText('DeleteBtn'))
                        .on('click', (ev) => 
                            this.deleteClickHandler(ev as MouseEvent, 
                                parseInt(rowEl.getAttribute('data-row-idx'))))
                    );
                }
            }
        }
    }

    private addClickHandler() {
        const activeEntity = this.context.getActiveEntity();
        const form = new EntityEditFormBuilder(this.context)
            .onSubmit(() => dlg.submit())
            .build();

        form.useValidators(this.defaultValidators);

        const dlg = this.dlg.open({
            title: i18n.getText('AddDlgCaption')
                .replace('{entity}', activeEntity.caption),
            body: form.getHtml(),
            onSubmit: () => {

                if (!form.validate())
                    return false;
                      
                form.getData()
                .then(obj => this.context.createRecord(obj))
                .then(() => {
                    return this.refreshData();
                })
                .catch((error) => {
                    this.processError(error);
                });
            }
        });
    }

    private editClickHandler(ev: MouseEvent, rowIndex: number) {
        this.context.getData().getRow(rowIndex)
            .then(row => {
                if (row) {
                    this.showEditForm(row);
                }
            })
    }

    private showEditForm(row: DataRow) {
        const activeEntity = this.context.getActiveEntity();

        const form = new EntityEditFormBuilder(this.context, { isEditForm: true, values: row })
            .onSubmit(() => dlg.submit())
            .build();
            
        form.useValidators(this.defaultValidators);

        const dlg = this.dlg.open({
            title: i18n.getText('EditDlgCaption')
                .replace('{entity}', activeEntity.caption),
            body: form.getHtml(),
            onSubmit: () => {
                if (!form.validate())
                    return false;

                form.getData()
                .then(obj => this.context.updateRecord(obj))
                .then(() => {
                    return this.refreshData();
                })       
                .catch((error) => {
                   this.processError(error);
                });
            }
        })
    }

    private rowDbClickHandler(ev: RowClickEvent) {
        if (this.context.getActiveEntity().isEditable) {
            this.showEditForm(ev.row);
        }
    }

    private deleteClickHandler(ev: MouseEvent, rowIndex: number) {
        this.context.getData().getRow(rowIndex)
            .then(row => {
                if (row) {
                    const activeEntity = this.context.getActiveEntity();
                    const keyAttrs = activeEntity.getPrimaryAttrs();
                    const keyVals = keyAttrs.map(attr => row.getValue(attr.id));
                    const keys = keyAttrs.reduce((val, attr, index) => { 
                        const property = attr.id.substring(attr.id.lastIndexOf('.') + 1);
                        val[property] = keyVals[index];
                        return val; 
                    }, {});
                    this.dlg.openConfirm(
                        i18n.getText('DeleteDlgCaption')
                            .replace('{entity}', activeEntity.caption), 
                        i18n.getText('DeleteDlgMessage')
                            .replace('{recordId}', Object.keys(keys)
                                .map(key => `${key}:${keys[key]}`).join(';')), 
                    )
                    .then((result) => {
                        if (result) {
                            this.context.deleteRecord(keys)
                                .then(() => {
                                    return this.refreshData();
                                })
                                .catch((error) => {
                                    this.processError(error);
                                });
                        }
                    })
                }
            });
    }

    private processError(error) {
        this.dlg.open({
            title: 'Ooops, something went wrong',
            body: error.message,
            closable: true,
            cancelable: false
        });
    }

    private refreshData(): Promise<void> {
        return this.context.fetchDataset()
            .then(() => {
                this.grid.refresh();
            });
    }
}