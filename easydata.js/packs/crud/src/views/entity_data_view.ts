import { utils as dataUtils } from '@easydata/core';

import { 
    DefaultDialogService, 
    DialogService, domel, EasyGrid, 
    GridCellRenderer, GridColumn 
} from '@easydata/ui';

import { EasyForm } from '../form/easy_form';
import { TextFilterWidget } from '../widgets/text_filter_widget';

import { EasyDataContext } from '../main/easy_data_context';
import { RequiredValidator } from '../validators/required_validator';
import { TypeValidator } from '../validators/type_validator';
import { Validator } from '../validators/validator';
import { EasyDataViewOptions } from './options';

export class EntityDataView {

    private options = {
        showBackToEntities: true
    }

    private dlg: DialogService;

    private grid: EasyGrid;

    private defaultValidators: Validator[] = [ new RequiredValidator(), new TypeValidator()];

    constructor (
        private slot: HTMLElement, 
        private context: EasyDataContext, 
        private basePath: string,
        options: EasyDataViewOptions) {
        options = options || {}
        
        this.options = dataUtils.assignDeep(this.options, options || {});

        this.dlg = new DefaultDialogService();

        this.slot.innerHTML = `<h1>${this.context.getActiveEntity().caption}</h1>`;
        if (this.options.showBackToEntities) {
            this.slot.innerHTML += `<a href="${this.basePath}"> ← Back to entities</a>`;
        }

        this.renderGrid();
    }

    private renderGrid() {
        this.context.getEntities()
            .then(result => {
                const gridSlot = document.createElement('div');
                this.slot.appendChild(gridSlot);
                gridSlot.id = 'Grid';
                this.grid = new EasyGrid({
                    slot: gridSlot,
                    dataTable: result,
                    paging: {
                        pageSize: 15,
                    },
                    addColumns: true,
                    onAddColumnClick: this.addClickHandler.bind(this),
                    onGetCellRenderer: this.manageCellRenderer.bind(this)
                });

                let widgetSlot: HTMLElement;
                const filterBar = domel('div')
                    .addClass(`kfrm-form`)
                    .setStyle('margin', '10px 0px')
                    .addChild('div', b => widgetSlot = b.toDOM()
                    ).toDOM();
                
                this.slot.insertBefore(filterBar, gridSlot);

                const dataFilter = this.context.createFilter();
                new TextFilterWidget(widgetSlot, this.grid, dataFilter);
            });
    }

    private manageCellRenderer(column: GridColumn, defaultRenderer: GridCellRenderer) {
        if (column.isRowNum) {
            column.width = 100;
            return (value: any, column: GridColumn, cell: HTMLElement) => {
                domel('div', cell)
                    .addClass(`keg-cell-value`)
                    .addChild('a', b => b
                        .attr('href', 'javascript:void(0)')
                        .text('Edit')
                        .on('click', (ev) => this.editClickHandler(ev as MouseEvent, cell))
                    )
                    .addChild('span', b => b.text(' | '))
                    .addChild('a', b => b
                        .attr('href', 'javascript:void(0)')
                        .text('Delete')
                        .on('click', (ev) => this.deleteClickHandler(ev as MouseEvent, cell))
                    );
            }
        }
    }

    private addClickHandler() {

        const form = EasyForm.build(this.context);

        form.useValidators(this.defaultValidators);

        this.dlg.open({
            title: `Create ${this.context.getActiveEntity().caption}`,
            body: form.getHtml(),
            onSubmit: () => {

                if (!form.validate())
                    return false;
                      
                const obj = form.getData();
                this.context.createEntity(obj)
                .then(() => {
                    window.location.reload();
                })
                .catch((error) => {
                    this.processError(error);
                });
            }
        });
    }

    private editClickHandler(ev: MouseEvent, cell: HTMLElement) {
        const rowEl = cell.parentElement;
        const index = Number.parseInt(rowEl.getAttribute('data-row-idx'));

        this.context.getData().getRow(index)
            .then(row => {
                if (row) {
                    const activeEntity = this.context.getActiveEntity();
                    const form = EasyForm.build(this.context, {isEditForm: true, values: row});
                    form.useValidators(this.defaultValidators);

                    this.dlg.open({
                        title: `Edit ${activeEntity.caption}`,
                        body: form.getHtml(),
                        onSubmit: () => {
                            const keyAttrs = activeEntity.attributes.filter(attr => attr.isPrimaryKey);
                            const keys = keyAttrs.map(attr => row.getValue(attr.id));

                            if (!form.validate())
                                return false;

                            const obj = form.getData();
                        
                            this.context.updateEntity(keys.join(':'), obj)
                            .then(() => {
                                window.location.reload();
                            })       
                            .catch((error) => {
                               this.processError(error);
                            });
                        }
                    })
                }
            })
    }

    private deleteClickHandler(ev: MouseEvent, cell: HTMLElement) {
        const rowEl = cell.parentElement;
        const index = Number.parseInt(rowEl.getAttribute('data-row-idx'));
        this.context.getData().getRow(index)
            .then(row => {
                if (row) {
                    const activeEntity = this.context.getActiveEntity();
                    const keyAttrs = activeEntity.attributes.filter(attr => attr.isPrimaryKey);
                    const keys = keyAttrs.map(attr => row.getValue(attr.id));
                    const entityId = keyAttrs.map((attr, index) => `${attr.id}:${keys[index]}`).join(';');
                    this.dlg.openConfirm(
                        `Delete ${activeEntity.caption}`, 
                        `Are you shure about removing this entity: [${entityId}]?`
                    )
                    .then((result) => {
                        if (result) {

                            //pass entityId in future
                            this.context.deleteEntity(keys.join(':'))
                                .then(() => {
                                    window.location.reload();
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
            title: 'Ooops, smth went wrong',
            body: error.message,
            closable: true,
            cancelable: false
        });
    }

}