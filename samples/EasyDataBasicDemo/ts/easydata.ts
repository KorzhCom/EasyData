import { 
    DataRow, DataType, utils as dataUtils, 
    EasyDataTable, DataChunk, DataChunkDescriptor, 
    MetaData, MetaEntity, MetaEntityAttr, EntityAttrKind,
    MetaValueEditor, MetaEditorTag, HttpClient
} from '@easydata/core';
import {
    EasyGrid, DefaultDialogService, browserUtils,
    domel, DomElementBuilder, GridColumn, GridCellRenderer, DialogService
} from '@easydata/ui';

import { DefaultDateTimePicker } from '@easyquery/ui';


interface ValidationResult {
    successed: boolean;
    messages?: string[];
}

abstract class Validator {

    public name: string;

    public abstract validate(attr: MetaEntityAttr, value: any): ValidationResult
    
}

class RequiredValidator extends Validator {

    constructor() {
        super();
        this.name = 'Required'
    }

    public validate(attr: MetaEntityAttr, value: any): ValidationResult {
       
        if (!attr.isNullable && (
            !dataUtils.IsDefinedAndNotNull(value)
            || value === ''))

            return {
                successed: false,
                messages: ['Value is required.']
            }

        return { successed: true };
    }
}

class TypeValidator extends Validator {

    constructor() {
        super();
        this.name = 'Type'
    }

    public validate(attr: MetaEntityAttr, value: any): ValidationResult {
       
        if (!dataUtils.IsDefinedAndNotNull(value) || value == '')
            return { successed: true };

        if (dataUtils.isNumericType(attr.dataType)) {
            if (!dataUtils.isNumeric(value))
                return { 
                    successed: false, 
                    messages: ['Value should be a number']
                };


            if (dataUtils.isIntType(attr.dataType) 
                && !Number.isInteger(Number.parseFloat(value))) {
                    return {
                        successed: false,
                        messages: ['Value should be an integer number']
                    }
                }
        }

        return { successed: true };
    }
}

type FormBuildParams = { 
    // temporary, possibly we will add context for EasyData
    loadChunk: (params: DataChunkDescriptor, entityId?: string) => Promise<DataChunk>, 
    
    values?: DataRow, 
    isEditForm?: boolean;
};

class EasyForm {

    private errorsDiv: HTMLElement;

    private constructor(private model: MetaData, private entity: MetaEntity, private html: HTMLElement){
        this.errorsDiv = html.querySelector('.errors-block');
    }

    private validators: Validator[] = [];

    public getHtml() {
        return this.html;
    }

    public validate(): boolean {

        this.clearErrors();

        const inputs = Array.from(this.html.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select'));
        let isValid = true;
        for(const input of inputs) {
            const attr = this.model.getAttributeById(input.name);

            if (input.type === 'checkbox')
                continue;

            const result = this.validateValue(attr, input.value);
            if (!result.successed) {
                if (isValid) {
                    domel(this.errorsDiv)
                        .addChild('ul');
                }

                isValid = false;

                for(const message of result.messages) {
                    this.errorsDiv.firstElementChild.innerHTML += `<li>${attr.caption}: ${message}</li>`;
                }
            }
            
            this.markInputValid(input, result.successed);
        }

        return isValid;
    }

    public getData() {
        const inputs = Array.from(this.html.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select'));
        let obj = {};
        for(const input of inputs) {
            const property = input.name.substring(input.name.lastIndexOf('.') + 1);
            const attr = this.model.getAttributeById(input.name);

            obj[property] =  input.type !== 'checkbox'
                ? this.mapValue(attr.dataType, input.value)
                : (input as HTMLInputElement).checked          
        }

        return obj;
    }

    public useValidator(...validator: Validator[]) {
        this.useValidators(validator);
    }

    public useValidators(validators: Validator[]) {
        this.validators = this.validators.concat(validators);
    }

    private mapValue(type: DataType, value: string) {

        if (dataUtils.getDateDataTypes().indexOf(type) >= 0) 
            return new Date(value);

        if (dataUtils.isIntType(type))
            return Number.parseInt(value);

        if (dataUtils.isNumericType(type))
            return Number.parseFloat(value);

        return value;
    }

    private clearErrors() {
        this.errorsDiv.innerHTML = '';

        this.html.querySelectorAll('input, select').forEach(el => {
            el.classList.remove('is-valid');
            el.classList.remove('is-invalid');
        });
    }

    private markInputValid(input: HTMLElement, valid: boolean) {
        input.classList.add(valid ? 'is-valid' : 'is-invalid');
    }

    private validateValue(attr: MetaEntityAttr, value: any): ValidationResult {
        const result = { successed: true, messages: []}
        for(const validator of this.validators) {
            const res = validator.validate(attr, value);
            if (!res.successed) {
                result.successed = false;
                result.messages = result.messages.concat(res.messages);
            }
        }

        return result;
    }

    public static build(model: MetaData, entity: MetaEntity, 
        params: FormBuildParams): EasyForm {

            const isIE = browserUtils.IsIE();

            let fb: DomElementBuilder<HTMLDivElement>;
            const formHtml =
             domel('div')
                .addClass('kfrm-form')
                .addChild('div', b => b
                    .addClass(`errors-block`)
                    .toDOM()
                )
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
        
                return 'text';
            }
    
            const getEditor = (attr: MetaEntityAttr): MetaValueEditor => {
                return attr.defaultEditor || new MetaValueEditor();
            }
    
            const addFormField = (parent: HTMLElement, attr: MetaEntityAttr) => {
                let value = params.values && attr.kind !== EntityAttrKind.Lookup
                    ? params.values.getValue(attr.id)
                    : undefined;
    
                const editor = getEditor(attr);
                if (editor.tag == MetaEditorTag.Unknown) {
                    if (dataUtils.getDateDataTypes().indexOf(attr.dataType) >= 0) {
                        editor.tag = MetaEditorTag.DateTime;
                    }
                    else {
                        editor.tag = MetaEditorTag.Edit;  
                    }
                }

                let readOnly = params.isEditForm && (attr.isPrimaryKey || !attr.isEditable);
                const required = !attr.isNullable;
                domel(parent)
                    .addChild('label', b => b
                        .attr('for', attr.id)
                        .addHtml(`${attr.caption} ${required ? '<sup style="color: red">*</sup>': ''}: `)
                );
    
                if (attr.kind === EntityAttrKind.Lookup) {
    
                    const lookupEntity = model.getRootEntity()
                    .subEntities.filter(ent => ent.id == attr.lookupEntity)[0]; 
                    const dataAttr = model.getAttributeById(attr.dataAttr);
    
                    readOnly = readOnly && dataAttr.isEditable;

                    value = params.values 
                        ? params.values.getValue(dataAttr.id)
                        : undefined;
    
                    const horizClass = isIE 
                        ? 'kfrm-fields-ie is-horizontal' 
                        : 'kfrm-fields is-horizontal';

                    let inputEl: HTMLInputElement;
                    domel(parent)
                    .addChild('div', b => { b
                        .addClass(horizClass)
                        .addChild('input', b => { 
                            inputEl = b.toDOM(); 
                            
                            b.attr('readonly', '');

                            b.name(dataAttr.id)
                            b.type(getInputType(dataAttr.dataType));
            
                            b.value(dataUtils.IsDefinedAndNotNull(value)
                                    ? value.toString() : '');     
                        });

                        if (!readOnly)
                            b.addChild('button', b => b
                                .addClass('kfrm-button')
                                .attr('title', 'Navigation values')
                                .addText('...')
                                .on('click', (ev) => {
                            
                                    const lookupTable = new EasyDataTable({
                                        loader: {
                                            loadChunk: (chunkParams) => params.loadChunk(chunkParams, lookupEntity.id)
                                        } 
                                    });
            
                                    params.loadChunk({ offset: 0, limit: 1000, needTotal: true }, lookupEntity.id)
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
                
                                        let selectedValue = inputEl.value;
        
                                        const updateLabel = () => 
                                            labelEl.innerHTML = `Selected value: '${selectedValue}'`;
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
                                                inputEl.value = selectedValue;
                                                return true;
                                            },
                                            onDestroy: () => {
                                                lookupGrid.destroy();
                                            }
                                        });
                                    });
                                })
                            );
                        });
                    return;
                }
    
                switch (editor.tag) {
                    case MetaEditorTag.DateTime:
                        domel(parent)
                         .addChild('input', b => { 
    
                            if (readOnly)
                                b.attr('readonly', '');

                            b.name(attr.id)
                            b.value(dataUtils.IsDefinedAndNotNull(value) 
                                ? new Date(value).toUTCString() 
                                : '');
    
                            if (!readOnly)
                                b.on('focus', (ev) => {
                                    const inputEl = ev.target as HTMLInputElement;
                                    const oldValue = inputEl.value ? new Date(inputEl.value) : new Date();
                                    const pickerOptions = {
                                        showCalendar: attr.dataType !== DataType.Time,
                                        showTimePicker: attr.dataType !== DataType.Date,
                                        onApply: (dateTime: Date) => {
                                            inputEl.value = dateTime.toUTCString();
                                        },
                                        onCancel: () => {
                                            inputEl.value = oldValue.toUTCString();
                                        },
                                        onDateTimeChanged: (dateTime: Date) => {
                                            inputEl.value = dateTime.toUTCString();
                                        }
                                    };

                                    const dtp = new DefaultDateTimePicker(pickerOptions);
                                    dtp.setDateTime(oldValue);
                                    dtp.show(inputEl);
                                });
                         });
                        break;
    
                    case MetaEditorTag.List:
                        domel(parent)
                            .addChild('select', b => {
                                if (readOnly)
                                    b.attr('readonly', '');
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
    
                    case MetaEditorTag.Edit:
                        default:
                            domel(parent)
                                .addChild('input', b => {
                                    if (readOnly)
                                        b.attr('readonly', '');

                                    b
                                        .name(attr.id)
                                        .type(getInputType(attr.dataType));
        
                                    if (value) {
                                        if (attr.dataType == DataType.Bool)
                                            b.attr('checked', '');
                                        else
                                            b.value(dataUtils.IsDefinedAndNotNull(value) 
                                                ? value.toString() 
                                                : '');
                                    }
                                });
                            break;
                }
                
            }
    
        for(const attr of entity.attributes) {
            if (attr.isForeignKey)
                continue;

            addFormField(fb.toDOM(), attr)
        }

        return new EasyForm(model, entity, formHtml)
    }
}

class EasyDataView {

    private activeEntity?: MetaEntity;
    private grid?: EasyGrid;
    private resultTable?: EasyDataTable;

    private model: MetaData;

    private basePath: string;

    private dlg: DialogService;

    private http: HttpClient;

    private endpoint = '/api/easydata';

    private slot: HTMLElement;

    private defaultValidators: Validator[] = [];

    constructor() {
        this.dlg = new DefaultDialogService();
        this.http = new HttpClient();

        this.defaultValidators.push(new RequiredValidator(), new TypeValidator());

        this.slot = document.getElementById('EasyData');
        if (!this.slot) {
            throw new Error("Entry element with id 'EasyData' is not found");
        }

        this.basePath = this.getBasePath();

        this.model = new MetaData();
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
                if (this.activeEntity) {
                    this.slot.innerHTML = `<h1>${this.activeEntity.caption}</h1><a href="${this.basePath}"> ← Back to entities</a>`;
                    this.renderGrid();
                }
                else {
                    this.slot.innerHTML = `<h1>${this.model.getId()}</h1>`;
                    this.renderEntitySelector();
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

    private getActiveEntity(): MetaEntity | null {
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
        if (this.slot) {
            const ul = document.createElement('ul');
            ul.className = 'list-group';
            this.slot.appendChild(ul);

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
                if (entity.description) {
                    li.innerHTML += `<span title="${entity.description}" style="float: right; font-family: cursive">i</span>`
                }
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

                const gridSlot = document.createElement('div');
                this.slot.appendChild(gridSlot);
                gridSlot.id = 'Grid';
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

        const form = EasyForm.build(this.model, this.activeEntity, 
            { loadChunk: this.loadChunk.bind(this) });

        form.useValidators(this.defaultValidators);

        this.dlg.open({
            title: `Create ${this.activeEntity.caption}`,
            body: form.getHtml(),
            onSubmit: () => {

                if (!form.validate())
                    return false;
                      
                const obj = form.getData();

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
                    const form = EasyForm.build(this.model, this.activeEntity, 
                        { loadChunk: this.loadChunk.bind(this), isEditForm: true, values: row});
                    form.useValidators(this.defaultValidators);

                    this.dlg.open({
                        title: `Edit ${this.activeEntity.caption}`,
                        body: form.getHtml(),
                        onSubmit: () => {

                            const keyAttrs = this.activeEntity.attributes.filter(attr => attr.isPrimaryKey);
                            const keys = keyAttrs.map(attr => row.getValue(attr.id));

                            if (!form.validate())
                                return false;

                            const obj = form.getData();
                        
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
}

window.addEventListener('load', () => {
    window['easydata'] = new EasyDataView();
});