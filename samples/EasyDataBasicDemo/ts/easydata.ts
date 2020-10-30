import { 
    DataRow, DataType, utils as dataUtils, 
    EasyDataTable, DataChunk, DataChunkDescriptor, 
    MetaData, MetaEntity, MetaEntityAttr, EntityAttrKind,
    MetaValueEditor, MetaEditorTag, HttpClient, DataColumn
} from '@easydata/core';
import {
    EasyGrid, DefaultDialogService, browserUtils,
    domel, DomElementBuilder, GridColumn, GridCellRenderer, DialogService, CellRendererType
} from '@easydata/ui';

import { DefaultDateTimePicker } from '@easyquery/ui';

const isIE = browserUtils.IsIE();

interface ValidationResult {
    successed: boolean;
    messages?: string[];
}

abstract class Validator {

    public name: string;

    public abstract validate(attr: MetaEntityAttr, value: any): ValidationResult
    
}

type LoadChunkFunc = (params: DataChunkDescriptor, entityId?: string) => Promise<DataChunk>;

class TextFilter {

    private filteredTable: EasyDataTable;
    private initTable: EasyDataTable;

    private filterValue = '';

    //turns off client-side search
    //for test purposes
    private justServerSide = false;

    constructor (private grid: EasyGrid, private loadChunk: LoadChunkFunc) {
        const renderer = this.highlightCellRenderer.bind(this);
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

    private highlightCellRenderer(defaultRenderer:GridCellRenderer, value: any, column: GridColumn, cell: HTMLElement) {   
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
            return this.loadChunk({ 
                offset: 0, 
                limit: this.initTable.chunkSize, 
                needTotal: true, 
                filter: this.filterValue
            } as any)
            .then(data => {

                const filteredTable = new EasyDataTable({
                    chunkSize: this.initTable.chunkSize,
                    loader: {
                        loadChunk: this.loadChunk
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
                loader: {
                    loadChunk: this.loadChunk
                }
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
    loadChunk: LoadChunkFunc, 
    
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
    
            if (isIE) {
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
                                        let filterInput: HTMLInputElement = null;

                                        const slot = domel('div')
                                            .addClass(`kfrm-form`)
         
                                            .addChild('div', b => b
                                                .addClass(`kfrm-field`)
                                                .addChild('label', b => labelEl = b
                                                    .toDOM()
                                                )
                                            )  
                                            .addChild('div', b => b
                                                .addClass(horizClass)
                                                .addChild('input', b => filterInput = b
                                                    .attr("placeholder", "Search..")
                                                    .type('search')
                                                    .on('search', (ev) => {
                                                        if (filterInput.value) {
                                                            filter.apply(filterInput.value)
                                                        }
                                                        else {
                                                            filter.drop();
                                                        }
                                                    })
                                                    .toDOM()
                                                )
                                                .addChild('button', b => b
                                                    .addClass('kfrm-button')
                                                    .addText('Search')
                                                    .on('click', () => {
                                                        if (filterInput.value) {
                                                            filter.apply(filterInput.value)
                                                        }
                                                        else {
                                                            filter.drop();
                                                        }
                                                    })
                                                )
                                            )   
                                            .addChild('div', b => b
                                                .addClass('kfrm-control')
                                                .addChild('div', b => gridSlot = b.toDOM())
                                            )
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

                                        const filter = new TextFilter(lookupGrid, params.loadChunk);
                                        
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


interface EasyDataViewOptions {
    showBackToEntities?: boolean
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

    private options = {
        showBackToEntities: true
    }

    constructor(options?: EasyDataViewOptions) {
        this.dlg = new DefaultDialogService();
        this.http = new HttpClient();

        this.options = dataUtils.assignDeep(this.options, options || {});

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
                    this.slot.innerHTML = `<h1>${this.activeEntity.caption}</h1>`;
                    if (this.options.showBackToEntities) {
                        this.slot.innerHTML += `<a href="${this.basePath}"> ← Back to entities</a>`;
                    }
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
            domel(this.slot)
            .addChild('div', b => b
                .addClass('ed-root')
                .addChild('div', b => b
                    .addClass('ed-entity-menu')
                    .addChild('ul', b => {
                        b.addClass('list-group')
                        entities.forEach(ent => {
                            b.addChild('li', b => {
                            b.addClass('list-group-item')
                            .on('click', () => {
                                window.location.href = `${this.basePath}/${ent.id}`;
                            })
                            .addHtml(ent.caption);

                            if (ent.description) {
                                b.addHtml(`<span title="${ent.description}" style="float: right; font-family: cursive">i</span>`);
                            }
                            });
                        });
                    })
                )
                .addChild('div', b => b
                    .addClass('ed-menu-description')
                    .addText('Click on an entity to view/edit its content')
                )
            );
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

                const horizClass = isIE 
                    ? 'kfrm-fields-ie is-horizontal' 
                    : 'kfrm-fields is-horizontal';

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

                const filter = new TextFilter(this.grid, this.loadChunk.bind(this));
                let filterInput: HTMLInputElement;
                const filterBar = domel('div')
                    .addClass(`kfrm-form`)
                    .setStyle('margin', '10px 0px')
                    .addChild('div', b => b
                        .addClass(horizClass)
                        .addChild('input', b => filterInput = b
                            .attr("placeholder", "Search..")
                            .type('search')
                            .on('search', (ev) => {
                                if (filterInput.value) {
                                    filter.apply(filterInput.value)
                                }
                                else {
                                    filter.drop();
                                }
                            })
                            .toDOM()
                        )
                        .addChild('button', b => b
                            .addClass('kfrm-button')
                            .addText('Search')
                            .on('click', () => {
                                if (filterInput.value) {
                                    filter.apply(filterInput.value)
                                }
                                else {
                                    filter.drop();
                                }
                            })
                        )
                    ).toDOM();
                
                this.slot.insertBefore(filterBar, gridSlot);
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