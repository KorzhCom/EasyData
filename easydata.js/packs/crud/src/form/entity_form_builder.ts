import { 
    DataRow, DataType, EasyDataTable, 
    EditorTag, EntityAttrKind, i18n, 
    MetaEntityAttr, utils as dataUtils,
    ValueEditor
} from '@easydata/core';

import { 
    browserUtils, DateTimePickerOptions, 
    DefaultDateTimePicker, DefaultDialogService, 
    domel, DomElementBuilder, EasyGrid 
} from '@easydata/ui';

import * as crudUtils from '../utils/utils';

import { DataContext } from '../main/data_context';
import { EntityEditForm } from './entity_edit_form';
import { TextFilterWidget } from '../widgets/text_filter_widget';

const isIE = browserUtils.IsIE();

export type FormBuildParams = {
    values?: DataRow,
    isEditForm?: boolean;
};

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
                                .loadChunk({ offset: 0, limit: 1000, needTotal: true, sourceId: lookupEntity.id } as any)
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
                                        const attr = lookupEntity.getFirstPrimaryAttr();
                                        const key = attr.id.substring(attr.id.lastIndexOf('.') + 1);
                                        this.context.fetchRecord({[key]: selectedValue}, lookupEntity.id)
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
                                            // return focus on button
                                            b.toDOM().focus();
                                        }
                                    });
                                });
                        })
                    );
            });
    }

    private setupDateTimeField(parent: HTMLElement, attr: MetaEntityAttr, value: any, readOnly: boolean, hidden: boolean) {
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

                        b.name(attr.id)
                        b.type(hidden ? 'hidden' : this.resolveInputType(attr.dataType));

                        if (readOnly) {
                            b.attr('readonly', '');
                        }
                        else {
                            b.mask(mask)
                            b.on('keypress', (ev) => this.applySumbit(ev as KeyboardEvent))
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

    private setupListField(parent: HTMLElement, attr: MetaEntityAttr, value: any, values: any, readOnly: boolean) {
        domel(parent)
            .addChild('div', b => b
                .addClass('kfrm-select full-width')
                .addChild('select', b => {
                    if (readOnly)
                        b.attr('readonly', '');
                    b.attr('name', attr.id)
                    b.on('keypress', (ev) => this.applySumbit(ev as KeyboardEvent))
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

    private setupFileField(parent: HTMLElement, attr: MetaEntityAttr, readOnly: boolean, accept: string) {
        domel(parent)
            .addChild('input', b => {
                if (readOnly)
                    b.attr('readonly', '');

                b.name(attr.id)
                    .type(this.resolveInputType(attr.dataType));

                b.attr('accept', accept);
            });
    }

    private setupTextField(parent: HTMLElement, attr: MetaEntityAttr, value: any, readOnly: boolean, hidden : boolean) {
        domel(parent)
            .addChild('input', b => {
                if (readOnly) {
                    b.attr('readonly', '');
                }
                b.type(hidden ? 'hidden' : this.resolveInputType(attr.dataType));

                b.name(attr.id)
                    .type(this.resolveInputType(attr.dataType));

                if (attr.dataType == DataType.Bool) {
                    if (value)
                        b.attr('checked', '');
                } 
                else {
                    b.on('keypress', (ev) => this.applySumbit(ev as KeyboardEvent))
                     .value(dataUtils.IsDefinedAndNotNull(value)
                        ? value.toString()
                        : '');
                }
            });
    }

    private setupTextArea(parent: HTMLElement, attr: MetaEntityAttr, value: any, readOnly: boolean) {
        // feature: modify size in value editor ??
        domel(parent)
            .addChild('textarea', b => {
                if (readOnly)
                    b.attr('readonly', '');
                    
                b.attr('name', attr.id)
                b.setStyle('height', `120px`)
                b.value(dataUtils.IsDefinedAndNotNull(value)
                    ? value.toString()
                    : '');
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
            .addChild('label', b => {
                b.attr('for', attr.id);
                b.addHtml(`${attr.caption} ${required ? '<sup style="color: red">*</sup>' : ''}: `);

                if (attr.description) {
                    b.addChild('div', b => b
                        .attr('title', attr.description)
                        .addClass('question-mark')
                        .setStyle('vertical-align', 'middle')
                        .setStyle('display', 'inline-block')
                    );
                }
            });
        
        const hidden = attr.isPrimaryKey;
            
        if (attr.kind === EntityAttrKind.Lookup) {
            this.setupLookupField(parent, attr, readOnly, value);
            return;
        }

        switch (editor.tag) {
            case EditorTag.DateTime:
                this.setupDateTimeField(parent, attr, value, readOnly, hidden);
                break;

            case EditorTag.List:
                this.setupListField(parent, attr, value, editor.values, readOnly);
                break;

            case EditorTag.File:
                this.setupFileField(parent, attr, readOnly, editor.accept);
                break;

            case EditorTag.Edit:
            default:
                if (editor.multiline) {
                    this.setupTextArea(parent, attr, value, readOnly);
                }
                else {
                    this.setupTextField(parent, attr, value, readOnly, hidden);
                }
                break;
        }
    }

    private resolveInputType(dataType: DataType): string {
        if (dataType === DataType.Bool)
            return 'checkbox';

        if (dataType === DataType.Blob)
            return 'file';

        return 'text';
    }

    private resolveEditor(attr: MetaEntityAttr): ValueEditor {
        let editor = attr.defaultEditor || new ValueEditor();
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

    private applySumbit(ev: KeyboardEvent): boolean {
        if (ev.keyCode === 13) {
            this.sumbitCallback && this.sumbitCallback();
            return false;
        }

        return false;
    }

    private sumbitCallback: () => void;

    public onSubmit(sumbitCallback: () => void) {
        this.sumbitCallback = sumbitCallback;
        return this;
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
            
            if (!this.params.isEditForm && !attr.showOnCreate)
                continue;

            if (!attr.isPrimaryKey && this.params.isEditForm && !attr.showOnEdit) {
                continue;
            }

            this.addFormField(fb.toDOM(), attr)
        }

        return this.form;
    }
}