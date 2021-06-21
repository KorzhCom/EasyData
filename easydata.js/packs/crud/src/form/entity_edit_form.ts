import { 
    DataType, i18n, utils as dataUtils, 
    MetaEntityAttr, DataRow, EditorTag, 
    ValueEditor, EntityAttrKind, EasyDataTable 
} from '@easydata/core';

import { 
    browserUtils, DefaultDialogService, 
    domel, DomElementBuilder, EasyGrid,
    DefaultDateTimePicker,
    DateTimePickerOptions
} from '@easydata/ui';

import { DataContext } from '../main/data_context';

import { ValidationResult, Validator } from '../validators/validator';
import { TextFilterWidget } from '../widgets/text_filter_widget';

export type FormBuildParams = { 
    values?: DataRow, 
    isEditForm?: boolean;
};

const isIE = browserUtils.IsIE();

export class EntityEditForm {

    private errorsDiv: HTMLElement;

    private constructor(private context: DataContext, private html: HTMLElement){
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
            const attr = this.context.getMetaData().getAttributeById(input.name);

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
        const inputs = Array.from(this.html
            .querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select'));
        let obj = {};
        for(const input of inputs) {
            const property = input.name.substring(input.name.lastIndexOf('.') + 1);
            const attr = this.context.getMetaData().getAttributeById(input.name);

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
            return value && value.length ? value: null;

        if (dataUtils.isIntType(type))
            return parseInt(value);

        if (dataUtils.isNumericType(type))
            return parseFloat(value);

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

    public static build(context: DataContext, params?: FormBuildParams): EntityEditForm {
            params = params || {};
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
    
    
            const getInputType = (dataType: DataType): string => {
                if (dataType == DataType.Bool) {
                    return 'checkbox';
                }
        
                return 'text';
            }
    
            const getEditor = (attr: MetaEntityAttr): ValueEditor => {
                return attr.defaultEditor || new ValueEditor();
            }
    
            const addFormField = (parent: HTMLElement, attr: MetaEntityAttr) => {
                let value = params.values && attr.kind !== EntityAttrKind.Lookup
                    ? params.values.getValue(attr.id)
                    : undefined;
    
                const editor = getEditor(attr);
                if (editor.tag == EditorTag.Unknown) {
                    if (dataUtils.getDateDataTypes().indexOf(attr.dataType) >= 0) {
                        editor.tag = EditorTag.DateTime;
                    }
                    else {
                        editor.tag = EditorTag.Edit;  
                    }
                }

                let readOnly = params.isEditForm && (attr.isPrimaryKey || !attr.isEditable);
                const required = !attr.isNullable;

                if (isIE) {
                    parent = domel('div', parent)
                        .addClass('kfrm-field-ie')
                        .toDOM();
                }

                domel(parent)
                    .addChild('label', b => b
                        .attr('for', attr.id)
                        .addHtml(`${attr.caption} ${required ? '<sup style="color: red">*</sup>': ''}: `)
                );
    
                if (attr.kind === EntityAttrKind.Lookup) {
                    const lookupEntity = context.getMetaData().getRootEntity()
                        .subEntities.filter(ent => ent.id == attr.lookupEntity)[0]; 
                    const dataAttr = context.getMetaData().getAttributeById(attr.dataAttr);
    
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
                                .attr('title', i18n.getText('NavigationBtnTitle'))
                                .addText('...')
                                .on('click', (ev) => {
                            
                                    const lookupTable = new EasyDataTable({
                                        loader: {
                                            loadChunk: (chunkParams) => context.getDataLoader()
                                                .loadChunk({ ... chunkParams, id: lookupEntity.id } as any)
                                        } 
                                    });
            
                                    context.getDataLoader()
                                    .loadChunk({ offset: 0, limit: 1000, needTotal: true, entityId: lookupEntity.id } as any)
                                    .then(data => {
        
                                        for(const col of data.table.columns.getItems()) {
                                            const attrs = lookupEntity.attributes.filter(attr => 
                                                attr.id == col.id && (attr.isPrimaryKey || attr.showInLookup));
                            
                                            if (attrs.length) {
                                                lookupTable.columns.add(col);
                                            }
                                        }
                        
                                        lookupTable.setTotal(data.total);
                        
                                        for(const row of data.table.getCachedRows()) {
                                            lookupTable.addRow(row);
                                        }
        
                                        const ds = new DefaultDialogService();
                                        let gridSlot: HTMLElement = null;
        
                                        let selectedSlot: HTMLElement = null;

                                        let widgetSlot: HTMLElement;
                                        const slot = domel('div')
                                            .addClass(`kfrm-form`)
                                            .addChild('div', b => b
                                                .addClass(`kfrm-field`)
                                                .addChild('label', b => b
                                                    .addText(i18n.getText('LookupSelectedItem'))
                                                    .toDOM()
                                                )
                                                .addChild('div', b => selectedSlot = b
                                                    .addText('None')
                                                .toDOM()
                                            )
                                            )  
                                            .addChild('div', b => widgetSlot = b.toDOM())   
                                            .addChild('div', b => b
                                                .addClass('kfrm-control')
                                                .addChild('div', b => gridSlot = b.toDOM())
                                            )
                                            .toDOM();
                
                                        let selectedValue = inputEl.value;

                                        const getValue = (row: DataRow| any, colId: string) => {

                                            if (row instanceof DataRow) {
                                                return row.getValue(colId);
                                            }

                                            const property = colId.substring(colId.lastIndexOf('.') + 1);
                                            return row[property]
                                        }

                                        const updateSelectedValue = (row: DataRow | any) => {
                                            selectedSlot.innerHTML = lookupTable.columns
                                                .getItems()
                                                .map(col => {
                                                    return `<b>${col.label}:</b> ${getValue(row, col.id)}`
                                                })
                                                .join(', ');
                                        } 

                                        if (selectedValue) {
                                            context.getEntity(selectedValue, lookupEntity.id)
                                            .then(data => {
                                                if (data.entity) {
                                                    updateSelectedValue(data.entity);
                                                }
                                            })
                                            .catch(error => {
                                                console.error(error);
                                            });
                                        }
        
                                        const lookupGrid = new EasyGrid({
                                            slot: gridSlot,
                                            dataTable: lookupTable,
                                            fixHeightOnFirstRender: true,
                                            paging: {
                                                pageSize: 10
                                            },
                                            onActiveRowChanged: (ev) => {
                                                lookupGrid.getData().getRow(ev.rowIndex)
                                                .then((row) => {
                                                    selectedValue = row.getValue(attr.lookupDataAttr);
                                                    updateSelectedValue(row);
                                                });
                                            }
                                        });

                                        ds.open({
                                            title: i18n.getText('LookupDlgCaption')
                                                .replace('{entity}', lookupEntity.caption),
                                            body: slot,
                                            arrangeParents: true,
                                            beforeOpen: () => {
                                                const dataFilter = context.createFilter(lookupEntity.id, lookupGrid.getData(), true);
                                                new TextFilterWidget(widgetSlot, lookupGrid, dataFilter, 
                                                    { instantMode: true, focus: true});
                                            },
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
                    case EditorTag.DateTime:
                        domel(parent)
                         .addChild('div', b => 
                            b.addClass(`kfrm-dt-editor`)
                                 .addChild('a', b => {
                                     b.addHtml((dataUtils.IsDefinedAndNotNull(value)
                                         ? i18n.dateTimeToStr(value, attr.dataType)
                                         : i18n.getText('SelectLink')));

                                     b.attr('href', 'javascript:void(0)');

                                     if (readOnly) {
                                         b.addChild('disabled');
                                     }

                                    b.on('click', (ev) => {
                                        ev.preventDefault();
                                        
                                        const format = this.getInternalDateTimeFormat(attr.dataType);
                                        const aEl = ev.target as HTMLAnchorElement;
                                        const inputEl = aEl.parentElement.querySelector('input') as HTMLInputElement;
                                        const value = inputEl.value.length 
                                            ? attr.dataType !== DataType.Time 
                                                ? dataUtils.strToDateTime(inputEl.value, format)
                                                : dataUtils.strToTime(inputEl.value)
                                            : new Date(new Date().setSeconds(0));

                                        const pickerOptions: DateTimePickerOptions = {
                                            zIndex: 9999999999,
                                            showCalendar: attr.dataType !== DataType.Time,
                                            showTimePicker: attr.dataType !== DataType.Date,
                                            onApply: (dateTime: Date) => {
                                                dateTime.setSeconds(0);
                                                dateTime.setMilliseconds(0);

                                                inputEl.value = dataUtils.dateTimeToStr(dateTime, format);
                                                aEl.innerHTML = i18n.dateTimeToStr(dateTime, attr.dataType);
                                            }
                                        };

                                        const dtp = new DefaultDateTimePicker(pickerOptions);
                                        dtp.setDateTime(value);
                                        dtp.show(aEl);
                                    })
                                 })
                                 .addChild('input', b => {

                                     b.attr('hidden', '');

                                     b.name(attr.id);

                                     const format = this.getInternalDateTimeFormat(attr.dataType);
                                     b.value((dataUtils.IsDefinedAndNotNull(value)
                                         ? dataUtils.dateTimeToStr(value, format)
                                         : ''))
                                 })
                         );
                    break;
                      
                    case EditorTag.List:
                        domel(parent)
                            .addChild('div', b => b
                                .addClass('kfrm-select')
                                .addChild('select', b => {
                                    if (readOnly)
                                        b.attr('readonly', '');
                                    b.attr('name', attr.id)

                                    if (editor.values) {
                                        for (let i = 0; i < editor.values.length; i++) {
                                            const val = editor.values[i];
                                            b.addOption({
                                                value: val.id,
                                                title: val.text,
                                                selected: i === 0
                                            });
                                        }
                                    }
                                })
                            );
                        break;
    
                    case EditorTag.Edit:
                    default:
                        domel(parent)
                            .addChild('input', b => {
                                if (readOnly)
                                    b.attr('readonly', '');

                                b
                                .name(attr.id)
                                .type(getInputType(attr.dataType));
    
                                if (attr.dataType == DataType.Bool) {
                                    if (value)
                                        b.attr('checked', '');
                                } else {
                                    b.value(dataUtils.IsDefinedAndNotNull(value) 
                                    ? value.toString() 
                                    : '');
                                }
                            });
                        break;
                }
                
            }
    
        for(const attr of context.getActiveEntity().attributes) {
            if (attr.isForeignKey)
                continue;

            if (params.isEditForm) {
                if (!attr.showOnEdit)
                    continue;
            }
            else {
                if (!attr.showOnCreate)
                    continue;
            }
            
            addFormField(fb.toDOM(), attr)
        }

        return new EntityEditForm(context, formHtml)
    }

    private static _internalDateFormat = 'yyyy-MM-dd';
    private static _internalTimeFormat = 'HH:mm';

    private static getInternalDateTimeFormat(dtype: DataType): string {
        if (dtype == DataType.Date)
            return this._internalDateFormat;

        if (dtype == DataType.Time)
            return this._internalTimeFormat;

        return `${this._internalDateFormat}T${this._internalTimeFormat}`;
    }

  
}
