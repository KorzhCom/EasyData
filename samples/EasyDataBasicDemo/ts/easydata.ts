import { DataRow, DataType, utils as dataUtils, 
    EasyDataTable, DataLoader, DataChunk, DataChunkDescriptor
} from '@easydata/core';
import {
    EasyGrid, DefaultDialogService, browserUtils,
    domel, DomElementBuilder, GridColumn, GridCellRenderer, DialogService
} from '@easydata/ui';

import { DataModel, Entity, EntityAttr, ValueEditor, EditorTag, HttpClient, EntityAttrKind } from '@easyquery/core';
import { DefaultDateTimePicker } from '@easyquery/ui';

class EasyDataView {

    private activeEntity?: Entity;
    private grid?: EasyGrid;
    private resultTable?: EasyDataTable;

    private model: DataModel;

    private basePath: string;

    private dlg: DialogService;

    private http: HttpClient;

    private endpoint = '/api/easydata';

    constructor() {
        this.dlg = new DefaultDialogService();
        this.http = new HttpClient();
    
        this.basePath = this.getBasePath();

        this.model = new DataModel();
        this.resultTable = new EasyDataTable({
            loader: {
                loadChunk: this.loadChunk.bind(this)
            }
        });

        const modelId = 'EasyData';
        this.http.get(`${this.endpoint}/models/${modelId}`)
            .then(result => {
                if (result.model) {
                    this.model.loadFromData(result.model);
                }

                this.activeEntity = this.getActiveEntity();
                this.renderEntitySelector();
                if (this.activeEntity) {
                    this.renderGrid();
                }
            });
    }

    private loadChunk(params: DataChunkDescriptor, entityId?: string): Promise<DataChunk> {
        const url = 
            `${this.endpoint}/models/${this.model.getId()}/crud/${entityId || this.activeEntity.id}`;

        return this.http.get(url, { queryParams: params as any})
            .then((result) => {

                const dataTable = new EasyDataTable({
                    chunkSize: 1000
                });

                const resultSet = result.resultSet;
                for(const col of resultSet.cols) {
                    dataTable.columns.add(col);
                }

                for(const row of resultSet.rows) {
                    dataTable.addRow(row);
                }
        
                let totalRecords = 0;
                if (result.meta && result.meta.totalRecords) {
                    totalRecords = result.meta.totalRecords;    
                }

                return {
                    table: dataTable,
                    total: totalRecords,
                    hasNext: !params.needTotal 
                        || params.offset + params.limit < totalRecords
                }
        
            });
    }

    private getActiveEntity(): Entity | null {
        const decodedUrl = decodeURIComponent(window.location.href);
        const splitIndex = decodedUrl.lastIndexOf('/');
        const typeName = decodedUrl.substring(splitIndex + 1);

        return typeName && typeName.toLocaleLowerCase() !== 'easydata'
            ? this.model.getRootEntity().subEntities
                .filter(e => e.id == typeName)[0]
            : null;
    }

    private getBasePath(): string {
        const decodedUrl = decodeURIComponent(window.location.href);
        const easyDataIndex = decodedUrl.indexOf('easydata');
        return decodedUrl.substring(0, easyDataIndex + 'easydata'.length);
    }

    private renderEntitySelector() {
        const entities = this.model.getRootEntity().subEntities;
        const entityListSlot = document.getElementById('EntityList');
        if (entityListSlot) {
            const ul = document.createElement('ul');
            ul.className = 'list-group';
            entityListSlot.appendChild(ul);

            for(const entity of entities) {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                if (entity === this.activeEntity) {
                    li.classList.add('active');
                }
                li.addEventListener('click', () => {
                    window.location.href = `${this.basePath}/${entity.id}`;
                });
                li.innerHTML = entity.caption;
                ul.appendChild(li);
            }
        }
    }

    private renderGrid() {
        this.loadChunk({ offset: 0, limit: 1000, needTotal: true})
            .then(data => {

                for(const col of data.table.columns.getItems()) {
                    this.resultTable.columns.add(col);
                }

                this.resultTable.setTotal(data.total);

                for(const row of data.table.getCachedRows()) {
                    this.resultTable.addRow(row);
                }

                const gridSlot = document.getElementById('Grid');
                this.grid = new EasyGrid({
                    slot: gridSlot,
                    dataTable: this.resultTable,
                    paging: {
                        pageSize: 15,
                    },
                    addColumns: true,
                    onAddColumnClick: this.addClickHandler.bind(this),
                    onGetCellRenderer: this.manageCellRenderer.bind(this)
                });
                
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
        const form = this.generateEditForm({ entity: this.activeEntity, editPK: true });
        this.dlg.open({
            title: `Create ${this.activeEntity.caption}`,
            body: form,
            onSubmit: () => {
                const obj: any = {};
                const inputs = Array.from(form.querySelectorAll('input'));
                for(const input of inputs) {
                    const property = input.name.substring(input.name.lastIndexOf('.') + 1);

                    const value = (input.type == 'date' || input.type == 'time')
                        ? input.valueAsDate
                        : (input.type == 'number')
                            ? input.valueAsNumber
                            : input.type == 'checkbox'
                                ? input.checked
                                : input.value;

                    obj[property] = value;
                }

                const url = `${this.endpoint}/models/${this.model.getId()}` +
                            `/crud/${this.activeEntity.id}`;
                
                this.http.post(url, obj, { dataType: 'json' })
                .then(() => {
                    window.location.reload();
                })
                .catch((error) => {
                    this.dlg.open({
                        title: 'Ooops, smth went wrong',
                        body: error.message,
                        closable: true,
                        cancelable: false
                    });
                });
            }
        });
    }

    private editClickHandler(ev: MouseEvent, cell: HTMLElement) {
        const rowEl = cell.parentElement;
        const index = Number.parseInt(rowEl.getAttribute('data-row-idx'));

        this.resultTable.getRow(index)
            .then(row => {
                if (row) {
                    const form = this.generateEditForm({ entity: this.activeEntity, values: row });
                    this.dlg.open({
                        title: `Edit ${this.activeEntity.caption}`,
                        body: form,
                        onSubmit: () => {

                            const keyAttrs = this.activeEntity.attributes.filter(attr => attr.isPrimaryKey);
                            const keys = keyAttrs.map(attr => row.getValue(attr.id));
            
                            const obj: any = {};
                            const inputs = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select'));
                            for(const input of inputs) {
                                const property = input.name.substring(input.name.lastIndexOf('.') + 1);

                                const value = (input.type == 'date' || input.type == 'time')
                                        ? (input as HTMLInputElement).valueAsDate
                                    : (input.type == 'number')
                                        ? (input as HTMLInputElement).valueAsNumber
                                        : input.type == 'checkbox'
                                            ? (input as HTMLInputElement).checked
                                            : input.value;
            
                                obj[property] = value;
                            }
           
                            const url = `/api/easydata/models/${this.model.getId()}` +
                                        `/crud/${this.activeEntity.id}/${keys.join(':')}`;
                            
                            this.http.put(url, obj, { dataType: 'json' })
                            .then(() => {
                                window.location.reload();
                            })       
                            .catch((error) => {
                                this.dlg.open({
                                    title: 'Ooops, smth went wrong',
                                    body: error.message,
                                    closable: true,
                                    cancelable: false
                                });
                            });
                        }
                    })
                }
            })
    }

    private deleteClickHandler(ev: MouseEvent, cell: HTMLElement) {
        const rowEl = cell.parentElement;
        const index = Number.parseInt(rowEl.getAttribute('data-row-idx'));
        this.resultTable.getRow(index)
            .then(row => {
                if (row) {
                    const keyAttrs = this.activeEntity.attributes.filter(attr => attr.isPrimaryKey);
                    const keys = keyAttrs.map(attr => row.getValue(attr.id));
                    const entityId = keyAttrs.map((attr, index) => `${attr.id}:${keys[index]}`).join(';');
                    this.dlg.openConfirm(
                        `Delete ${this.activeEntity.caption}`, 
                        `Are you shure about removing this entity: [${entityId}]?`
                    )
                    .then((result) => {
                        if (result) {

                            const url = `${this.endpoint}/models/${this.model.getId()}` +
                                        `/crud/${this.activeEntity.id}/${keys.join(':')}`; //pass entityId in future
                            
                            this.http.delete(url).then(() => {
                                window.location.reload();
                            })
                            .catch((error) => {
                                this.dlg.open({
                                    title: 'Ooops, smth went wrong',
                                    body: error.message,
                                    closable: true,
                                    cancelable: false
                                });
                            });
                        }
                    })
                }
            });
    }

    private generateEditForm(params: { entity: Entity, values?: DataRow, editPK?: boolean }): HTMLDivElement {

        const isIE = browserUtils.IsIE();

        let fb: DomElementBuilder<HTMLDivElement>;
        const form =
         domel('div')
            .addClass('kfrm-form')
            .addChild('div', b => {
                b.addClass(`${isIE 
                    ? 'kfrm-fields-ie col-ie-1-4 label-align-right' 
                    : 'kfrm-fields col-a-1 label-align-right'}`);
 
                fb = b;
            })
            .toDOM();

        if (browserUtils.IsIE()) {
            fb = domel('div', fb.toDOM())
                .addClass('kfrm-field-ie');
        }

        const getInputType = (dataType: DataType): string => {
            if (dataType == DataType.Bool) {
                return 'checkbox';
            }
            if (dataUtils.isNumericType(dataType)) {
                return 'number';
            }
            if (dataType == DataType.Date 
                || dataType == DataType.DateTime) {
                return 'date';
            }
            if (dataType == DataType.Time) {
                return 'time';
            }

            return 'text';
        }

        const getEditor = (attr: EntityAttr): ValueEditor => {
            return attr.defaultEditor || new ValueEditor();
        }

        const addFormField = (parent: HTMLElement, attr: EntityAttr) => {
            let value = params.values && attr.kind !== EntityAttrKind.Lookup
                ? params.values.getValue(attr.id)
                : undefined;

            const editor = getEditor(attr);
            if (editor.tag == EditorTag.Unknown) {
                if ([DataType.Date, DataType.DateTime, DataType.Time].indexOf(attr.dataType) >= 0) {
                    editor.tag  = EditorTag.DateTime;
                }
                else {
                    editor.tag  = EditorTag.Edit;  
                }
            }

            domel(parent)
                .addChild('label', b => b
                    .attr('for', attr.id)
                    .addText(`${attr.caption}: `)
            );

            if (attr.kind === EntityAttrKind.Lookup) {

                const lookupEntity = this.model.getRootEntity()
                .subEntities.filter(ent => ent.id == attr.lookupEntity)[0]; 
                const dataAttr = this.model.getAttributeById(attr.dataAttr);

                value = params.values 
                    ? params.values.getValue(dataAttr.id)
                    : undefined;

                domel(parent)
                .addChild('input', b => { 
                   b.name(dataAttr.id)
                   b.type(getInputType(dataAttr.dataType));

                    b.value(value);

                    b.on('focus', (ev) => {
                   
                        const lookupTable = new EasyDataTable({
                            loader: {
                                loadChunk: (params) => this.loadChunk(params, lookupEntity.id)
                            } 
                        });

                        this.loadChunk({ offset: 0, limit: 1000, needTotal: true }, lookupEntity.id)
                            .then(data => {

                                for(const col of data.table.columns.getItems()) {
                                    lookupTable.columns.add(col);
                                }
                
                                lookupTable.setTotal(data.total);
                
                                for(const row of data.table.getCachedRows()) {
                                    lookupTable.addRow(row);
                                }

                                const ds = new DefaultDialogService();
                                let gridSlot: HTMLElement = null;

                                let labelEl: HTMLElement = null;

                                const slot = domel('div')
                                    .addClass(`kfrm-form`)
                                    .addChild('div', b => {
                                        b.addClass(`${browserUtils.IsIE() 
                                            ? 'kfrm-fields-ie' 
                                            : 'kfrm-fields'}`)
                                        b.addChild('div')
                                            .addClass(`kfrm-field`)
                                            .addChild('label', b => labelEl = b
                                                .toDOM()
                                            )
                                            .addChild('div', b => b
                                                .addClass('kfrm-control')
                                                .addChild('div', b => gridSlot = b.toDOM())
                                            )
                                    })
                                    .toDOM();
        
                                const inputEl = (ev.target as HTMLInputElement);
                                let selectedValue = inputEl.value;

                                const updateLabel = () => labelEl.innerHTML = `Selected value: '${selectedValue}'`;
                                updateLabel();

                                const lookupGrid = new EasyGrid({
                                    slot: gridSlot,
                                    dataTable: lookupTable,
                                    paging: {
                                        pageSize: 10
                                    },
                                    onRowDbClick: (ev) => {
                                        const row = ev.row;
                                        selectedValue = row.getValue(attr.lookupDataAttr);
                                        updateLabel();
                                    }
                                });
                                
                                ds.open({
                                    title: `Select ${lookupEntity.caption}`,
                                    body: slot,
                                    onSubmit: () => {
                                        (ev.target as HTMLInputElement).value = selectedValue;
                                        return true;
                                    },
                                    onDestroy: () => {
                                        lookupGrid.destroy();
                                    }
                                });
                            });
                    });
                });
                return;
            }

            switch (editor.tag) {
                case EditorTag.DateTime:
                    domel(parent)
                     .addChild('input', b => { 

                        b.name(attr.id)
                        b.type(getInputType(attr.dataType));

                         b.value(value);

                         b.on('focus', (ev) => {
                             const inputEl = ev.target as HTMLInputElement;
                             const oldValue = inputEl.valueAsDate;
                             const pickerOptions = {
                                 showCalendar: attr.dataType !== DataType.Time,
                                 showTimePicker: attr.dataType !== DataType.Date,
                                 onApply: (dateTime: Date) => {
                                     inputEl.valueAsDate = dateTime;
                                 },
                                 onCancel: () => {
                                     inputEl.valueAsDate = oldValue;
                                 },
                                 onDateTimeChanged: (dateTime: Date) => {
                                     inputEl.valueAsDate = dateTime;
                                 }
                             };
                             const dtp = new DefaultDateTimePicker(pickerOptions);
                             dtp.setDateTime(oldValue);
                             dtp.show(inputEl);
                         });
                     });
                    break;

                case EditorTag.List:
                    domel(parent)
                        .addChild('select', b => {
                            b
                            .attr('name', attr.id)
                            
                            if (editor.values) {
                                for(let i = 0 ; i < editor.values.length; i++) {
                                    b.addOption({
                                        value: value.id,
                                        title: value.text,
                                        selected: i === 0
                                    });
                                }
                            }
                        });

                case EditorTag.Edit:
                    default:
                        domel(parent)
                            .addChild('input', b => {
                                b
                                    .name(attr.id)
                                    .type(getInputType(attr.dataType));
    
                                if (value) {
                                    if (attr.dataType == DataType.Bool)
                                        b.attr('checked', '');
                                    else
                                        b.value(value);
                                }
                            });
                        break;
            }
            
        }

        for(const attr of params.entity.attributes) {
            if (attr.isPrimaryKey && !params.editPK
                || attr.isForeignKey)
                continue;

            addFormField(fb.toDOM(), attr)
        }

        return form;
    }
}

window.addEventListener('load', () => {
    window['easydata'] = new EasyDataView();
});