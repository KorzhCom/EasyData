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

import * as crudUtils from '../utils/utils';
import { DateTimeValidator } from '../validators/datetime_validator';

export type FormBuildParams = { 
    values?: DataRow, 
    isEditForm?: boolean;
};

const isIE = browserUtils.IsIE();

export class EntityEditFormBuilder {

    private form: EntityEditForm;

    constructor(private context: DataContext, private params?: FormBuildParams) {
        this.params = params || {};
        this.reset();
    }

    public reset() {
        this.form = new EntityEditForm(this.context);
    }

    private setupLookupField(parent: HTMLElement, attr: MetaEntityAttr, readOnly: boolean, value: any) {
        const lookupEntity = this.context.getMetaData().getRootEntity()
            .subEntities.filter(ent => ent.id == attr.lookupEntity)[0];
        const dataAttr = this.context.getMetaData().getAttributeById(attr.dataAttr);

        readOnly = readOnly && dataAttr.isEditable;

        value = this.params.values
            ? this.params.values.getValue(dataAttr.id)
            : undefined;

        const horizClass = isIE
            ? 'kfrm-fields-ie is-horizontal'
            : 'kfrm-fields is-horizontal';

        let inputEl: HTMLInputElement;
        domel(parent)
            .addChild('div', b => {
                b
                .addClass(horizClass)
                .addChild('input', b => {
                    inputEl = b.toDOM();
                    b.attr('readonly', '');

                    b.name(dataAttr.id)
                    b.type(this.resolveInputType(dataAttr.dataType));

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
                                    loadChunk: (chunkParams) => this.context.getDataLoader()
                                        .loadChunk({ ...chunkParams, id: lookupEntity.id } as any)
                                }
                            });

                            this.context.getDataLoader()
                                .loadChunk({ offset: 0, limit: 1000, needTotal: true, entityId: lookupEntity.id } as any)
                                .then(data => {

                                    for (const col of data.table.columns.getItems()) {
                                        const attrs = lookupEntity.attributes.filter(attr =>
                                            attr.id == col.id && (attr.isPrimaryKey || attr.showInLookup));

                                        if (attrs.length) {
                                            lookupTable.columns.add(col);
                                        }
                                    }

                                    lookupTable.setTotal(data.total);

                                    for (const row of data.table.getCachedRows()) {
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

                                    const getValue = (row: DataRow | any, colId: string) => {

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
                                        this.context.getEntity(selectedValue, lookupEntity.id)
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
                                            const dataFilter = this.context.createFilter(lookupEntity.id, lookupGrid.getData(), true);
                                            new TextFilterWidget(widgetSlot, lookupGrid, dataFilter,
                                                { instantMode: true, focus: true });
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
    }

    private setupDateTimeField(parent: HTMLElement, attr: MetaEntityAttr, readOnly: boolean, value: any) {

        const horizClass = isIE
            ? 'kfrm-fields-ie is-horizontal'
            : 'kfrm-fields is-horizontal';

        const editFormat = crudUtils.getEditDateTimeFormat(attr.dataType);

        let inputEl: HTMLInputElement;
        let btnEl: HTMLButtonElement;

        const mask = editFormat
            .replace('yyyy', '9999')
            .replace('MM', '99')
            .replace('dd', '99')
            .replace('HH', '99')
            .replace('mm', '99')
            .replace('ss', '99')

        domel(parent)
            .addChild('div', b => {
                b
                .addClass(horizClass)
                .addChild('input', b => {
                    inputEl = b.toDOM();

                    if (readOnly) {
                        b.attr('readonly', '');
                    }
                    else {
                        b.mask(mask)
                            
                        .on('input', ev => {
                            b.removeClass('is-invalid');
                            try {
                                const newDate = dataUtils.strToDateTime(inputEl.value, editFormat);
                            }
                            catch (e) {
                                b.addClass('is-invalid');
                            }
                            finally {
                                
                            }
                        })
                        .on('blur', ev => {
                            if (inputEl.value === mask.replace(/[9]/g, '_')) {
                                inputEl.value = '';
                            }
                        });
                    }

                    b.name(attr.id)
                    b.type(this.resolveInputType(attr.dataType));

                    b.value((dataUtils.IsDefinedAndNotNull(value)
                        ? dataUtils.dateTimeToStr(value, editFormat)
                        : ''))
                });

                if (!readOnly)
                    b.addChild('button', b => btnEl = b
                        .addClass('kfrm-button')
                        .attr('title', i18n.getText(attr.dataType !== DataType.Time  
                            ? 'CalendarBtnTitle'
                            : 'TimerBtnTitle'))
                        .addChild('i', b => b.addClass(attr.dataType !== DataType.Time 
                            ? 'ed-calendar-icon'
                            : 'ed-timer-icon'))
                        .on('click', (ev) => {

                            let value: Date;
                            try {
                                value = inputEl.value.length
                                    ? attr.dataType !== DataType.Time
                                        ? dataUtils.strToDateTime(inputEl.value, editFormat)
                                        : dataUtils.strToTime(inputEl.value)
                                    : new Date(new Date().setSeconds(0));
                            }
                            catch {
                                value = new Date(new Date().setSeconds(0));
                            }
                            
                            const pickerOptions: DateTimePickerOptions = {
                                zIndex: 9999999999,
                                showCalendar: attr.dataType !== DataType.Time,
                                showTimePicker: attr.dataType !== DataType.Date,
                                onApply: (dateTime: Date) => {
                                    dateTime.setSeconds(0);
                                    dateTime.setMilliseconds(0);

                                    inputEl.value = dataUtils.dateTimeToStr(dateTime, editFormat);
                                   
                                }
                            };

                            const dtp = new DefaultDateTimePicker(pickerOptions);
                            dtp.setDateTime(value);
                            dtp.show(ev.target as HTMLElement);

                        }).toDOM()
                    );
            });
    }

    private setupListField(parent: HTMLElement, attr: MetaEntityAttr, readOnly: boolean, values: any, value: any) {
        domel(parent)
            .addChild('div', b => b
                .addClass('kfrm-select full-width')
                .addChild('select', b => {
                    if (readOnly)
                        b.attr('readonly', '');
                    b.attr('name', attr.id)

                    if (values) {
                        for (let i = 0; i < values.length; i++) {
                            const val = values[i];
                            b.addOption({
                                value: val.id,
                                title: val.text,
                                selected: i === 0
                            });
                        }
                    }
                })
            );
    }

    private setupTextField(parent: HTMLElement, attr: MetaEntityAttr, readOnly: boolean, value: any) {
        domel(parent)
            .addChild('input', b => {
                if (readOnly)
                    b.attr('readonly', '');

                b.name(attr.id)
                 .type(this.resolveInputType(attr.dataType));

                if (attr.dataType == DataType.Bool) {
                    if (value)
                        b.attr('checked', '');
                } else {
                    b.value(dataUtils.IsDefinedAndNotNull(value)
                        ? value.toString()
                        : '');
                }
            });
    }

    private addFormField(parent: HTMLElement, attr: MetaEntityAttr) {
        let value = this.params.values && attr.kind !== EntityAttrKind.Lookup
            ? this.params.values.getValue(attr.id)
            : undefined;

        const editor = this.resolveEditor(attr);
        

        let readOnly = this.params.isEditForm && (attr.isPrimaryKey || !attr.isEditable);
        const required = !attr.isNullable;

        if (isIE) {
            parent = domel('div', parent)
                .addClass('kfrm-field-ie')
                .toDOM();
        }

        domel(parent)
            .addChild('label', b => b
                .attr('for', attr.id)
                .addHtml(`${attr.caption} ${required ? '<sup style="color: red">*</sup>' : ''}: `)
            );

        if (attr.kind === EntityAttrKind.Lookup) {
            this.setupLookupField(parent, attr, readOnly, value);
            return;
        }

        switch (editor.tag) {
            case EditorTag.DateTime:
                this.setupDateTimeField(parent, attr, readOnly, value);
                break;

            case EditorTag.List:
                this.setupListField(parent, attr, readOnly, editor.values, value);
                break;

            case EditorTag.Edit:
            default:
                this.setupTextField(parent, attr, readOnly, value);
                break;
        }
    }

    private resolveInputType(dataType: DataType): string {
        if (dataType == DataType.Bool) {
            return 'checkbox';
        }

        return 'text';
    }

    private resolveEditor(attr: MetaEntityAttr): ValueEditor {
        let editor =  attr.defaultEditor || new ValueEditor();
        if (editor.tag == EditorTag.Unknown) {
            if (dataUtils.getDateDataTypes().indexOf(attr.dataType) >= 0) {
                editor.tag = EditorTag.DateTime;
            }
            else {
                editor.tag = EditorTag.Edit;
            }
        }

        return editor;
    }

    public build(): EntityEditForm {
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

        this.form['setHtmlInt'](formHtml);

        for (const attr of this.context.getActiveEntity().attributes) {
            if (attr.isForeignKey)
                continue;

            if (this.params.isEditForm) {
                if (!attr.showOnEdit)
                    continue;
            }
            else {
                if (!attr.showOnCreate)
                    continue;
            }

            this.addFormField(fb.toDOM(), attr)
        }

        return this.form;
    }
}

export class EntityEditForm {

    private errorsDiv: HTMLElement;

    private html: HTMLElement;

    constructor(private context: DataContext){
        
    }

    private validators: Validator[] = [ new DateTimeValidator() ];

    public getHtml() {
        return this.html;
    }

    private setHtmlInt(html: HTMLElement) {
        this.html = html;
        this.errorsDiv = this.html.querySelector('.errors-block');
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

        if (dataUtils.getDateDataTypes().indexOf(type) >= 0) {
            if (type !== DataType.Time && value && value.length) {
                const editFormat =  crudUtils.getEditDateTimeFormat(type);
                const internalFormat = crudUtils.getInternalDateTimeFormat(type);

                const date = dataUtils.strToDateTime(value, editFormat);
                return dataUtils.dateTimeToStr(date, internalFormat)
            }     

            return value && value.length ? value : null;
        }

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
  
}
