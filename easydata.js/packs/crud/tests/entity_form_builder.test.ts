import { 
    DataRow, DataType, EasyDataTable,
    EntityAttrKind, MetaData, MetaEntity, MetaEntityAttr, 
    ValueEditor, EditorTag
} from '@easydata/core';

import { DataContext } from '../src/main/data_context';
import { EntityEditFormBuilder, FormBuildParams } from '../src/form/entity_form_builder';
import { EntityEditForm } from '../src/form/entity_edit_form';

describe('EntityEditFormBuilder', () => {
    let mockMetaData: MetaData;
    let mockEntity: MetaEntity;
    let mockDataContext: DataContext;
    let builder: EntityEditFormBuilder;
    let dataRow: DataRow;
    
    // Helper function for creating attribute
    const createAttr = (id: string, caption: string, dataType: DataType, options: any = {}): MetaEntityAttr => {
        const attr = {
            id,
            caption,
            dataType,
            description: options.description || '',
            isEditable: options.isEditable !== undefined ? options.isEditable : true,
            isPrimaryKey: options.isPrimaryKey || false,
            isNullable: options.isNullable !== undefined ? options.isNullable : true,
            showOnCreate: options.showOnCreate !== undefined ? options.showOnCreate : true,
            showOnEdit: options.showOnEdit !== undefined ? options.showOnEdit : true,
            showOnView: options.showOnView !== undefined ? options.showOnView : true,
            defaultEditor: options.defaultEditor || null,
            defaultValue: options.defaultValue || null,
            kind: options.kind || EntityAttrKind.Data,
            lookupEntity: options.lookupEntity || null,
            lookupAttr: options.lookupAttr || null,
            dataAttr: options.dataAttr || null,
            lookupDataAttr: options.lookupDataAttr || null
        } as MetaEntityAttr;
        
        return attr;
    };

    beforeEach(() => {
        // Create attributes для нашей сущности
        const attributes = [
            createAttr('Person.id', 'ID', DataType.Int32, { 
                isPrimaryKey: true,
                isEditable: false 
            }),
            createAttr('Person.name', 'Name', DataType.String, { 
                isNullable: false,
                description: 'Person full name' 
            }),
            createAttr('Person.birthDate', 'Birth Date', DataType.Date),
            createAttr('Person.registered', 'Registered', DataType.DateTime),
            createAttr('Person.rating', 'Rating', DataType.Int32),
            createAttr('Person.isActive', 'Is Active', DataType.Bool),
            createAttr('Person.notes', 'Notes', DataType.String, {
                defaultEditor: Object.assign(new ValueEditor(), { 
                    tag: EditorTag.Edit, 
                    multiline: true 
                })
            }),
            createAttr('Person.photo', 'Photo', DataType.Blob, {
                defaultEditor: Object.assign(new ValueEditor(), { 
                    tag: EditorTag.File, 
                    accept: 'image/*' 
                })
            }),
            createAttr('Person.status', 'Status', DataType.String, {
                defaultEditor: Object.assign(new ValueEditor(), { 
                    tag: EditorTag.List, 
                    values: [
                        { id: 'Active', text: 'Active' },
                        { id: 'Inactive', text: 'Inactive' }
                    ]
                })
            }),
            createAttr('Person.departmentId', 'Department ID', DataType.Int32, {
                kind: EntityAttrKind.Lookup,
                lookupEntity: 'Department',
                lookupAttr: 'Department.id',
                dataAttr: 'Person.departmentId',
                lookupDataAttr: 'Department.id'
            })
        ];
        
        // Create entity with attributes
        mockEntity = {
            id: 'Person',
            name: 'Person',
            caption: 'Person',
            attributes
        } as MetaEntity;

        // Создаем Department сущность для lookup
        const departmentEntity = {
            id: 'Department',
            name: 'Department',
            caption: 'Department',
            attributes: [
                createAttr('Department.id', 'ID', DataType.Int32, { isPrimaryKey: true }),
                createAttr('Department.name', 'Name', DataType.String)
            ],
            getFirstPrimaryAttr: () => departmentEntity.attributes[0]
        } as MetaEntity;
        
        // Создаем метаданные с нашими сущностями
        mockMetaData = {
            getRootEntity: () => ({
                subEntities: [mockEntity, departmentEntity]
            }),
            getAttributeById: (id: string) => {
                // Поиск в атрибутах Person
                const personAttr = mockEntity.attributes.find(attr => attr.id === id);
                if (personAttr) return personAttr;
                
                // Поиск в атрибутах Department
                const deptAttr = departmentEntity.attributes.find(attr => attr.id === id);
                if (deptAttr) return deptAttr;
                
                return null;
            }
        } as MetaData;

        // Создаем объект для представления данных строки
        const rowData = {
            'Person.id': 1,
            'Person.name': 'John Doe',
            'Person.birthDate': new Date(1990, 5, 15),
            'Person.registered': new Date(2020, 1, 1, 10, 30, 0),
            'Person.rating': 5,
            'Person.isActive': true,
            'Person.notes': 'Some notes',
            'Person.departmentId': 2
        };
        
        // Создаем макет для DataRow
        dataRow = {
            getValue: (id: string) => rowData[id]
        } as DataRow;
        
        // Create mock for контекста данных
        mockDataContext = {
            getMetaData: () => mockMetaData,
            getActiveEntity: () => mockEntity,
            createFilter: mock(),
            getDataLoader: () => ({
                loadChunk: mock().mockResolvedValue({
                    table: new EasyDataTable(),
                    total: 0
                })
            }),
            fetchRecord: mock().mockResolvedValue({
                entity: {
                    name: 'IT Department'
                }
            })
        } as unknown as DataContext;
        
        // Create instance builder'а
        builder = new EntityEditFormBuilder(mockDataContext);
    });

    it('should be created with empty parameters and reset to default values', () => {
        expect(builder).toBeDefined();
        
        // Check, что свойство context установлено
        expect((builder as any).context).toBe(mockDataContext);
        
        // Check метод reset
        const formBeforeReset = (builder as any).form;
        builder.reset();
        const formAfterReset = (builder as any).form;
        
        expect(formBeforeReset).not.toBe(formAfterReset);
        expect(formAfterReset).toBeInstanceOf(EntityEditForm);
    });

    it('should create form with correct fields', () => {
        const form = builder.build();
        
        // Check что форма создана
        expect(form).toBeInstanceOf(EntityEditForm);
        
        // Get form HTML
        const formHtml = form.getHtml();
        expect(formHtml).toBeDefined();
        
        // Check presence of error block
        const errorsBlock = formHtml.querySelector('.errors-block');
        expect(errorsBlock).toBeDefined();
        
        // Check presence of form fields
        const inputs = formHtml.querySelectorAll('input');
        expect(inputs.length).toBeGreaterThan(0);
        
        // Check that each attribute created corresponding field
        for (const attr of mockEntity.attributes) {
            // Skip attributes that should not be displayed in create form
            if (!attr.showOnCreate) continue;
            
            // Find field by name
            const field = formHtml.querySelector(`[name="${attr.id}"]`);
            expect(field).toBeDefined();
            
            // Check label for field
            const label = formHtml.querySelector(`label[for="${attr.id}"]`);
            expect(label).toBeDefined();
            expect(label.textContent).toContain(attr.caption);
            
            // Check required fields
            if (!attr.isNullable) {
                expect(label.innerHTML).toContain('<sup style="color: red">*</sup>');
            }
        }
    });

    it('should set values from dataRow when creating form', () => {
        const params: FormBuildParams = {
            values: dataRow
        };
        
        const builder = new EntityEditFormBuilder(mockDataContext, params);
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Check field population with values from dataRow
        const nameInput = formHtml.querySelector('[name="Person.name"]') as HTMLInputElement;
        expect(nameInput.value).toBe('John Doe');
        
        const isActiveInput = formHtml.querySelector('[name="Person.isActive"]') as HTMLInputElement;
        expect(isActiveInput.checked).toBe(true);
    });

    it('should create edit form with correct parameters', () => {
        const params: FormBuildParams = {
            values: dataRow,
            isEditForm: true
        };
        
        const builder = new EntityEditFormBuilder(mockDataContext, params);
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Check that primary keys have readonly attribute
        const idInput = formHtml.querySelector('[name="Person.id"]') as HTMLInputElement;
        expect(idInput).toBeDefined();
        expect(idInput.getAttribute('readonly')).toBeDefined();
        
        // Check, что неизменяемые атрибуты имеют readonly
        const attrNonEditable = createAttr('Person.createdAt', 'Created At', DataType.DateTime, { 
            isEditable: false,
            showOnEdit: true
        });
        mockEntity.attributes.push(attrNonEditable);
        
        const newBuilder = new EntityEditFormBuilder(mockDataContext, params);
        const newForm = newBuilder.build();
        const newFormHtml = newForm.getHtml();
        
        const createdAtInput = newFormHtml.querySelector('[name="Person.createdAt"]') as HTMLInputElement;
        expect(createdAtInput).toBeDefined();
        expect(createdAtInput.getAttribute('readonly')).toBeDefined();
    });

    it('should создавать текстовые поля правильного типа', () => {
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Check текстовые поля
        const nameInput = formHtml.querySelector('[name="Person.name"]') as HTMLInputElement;
        expect(nameInput.type).toBe('text');
        
        // Check checkbox field
        const isActiveInput = formHtml.querySelector('[name="Person.isActive"]') as HTMLInputElement;
        expect(isActiveInput.type).toBe('checkbox');
        
        // Check file field
        const photoInput = formHtml.querySelector('[name="Person.photo"]') as HTMLInputElement;
        expect(photoInput.type).toBe('file');
        expect(photoInput.getAttribute('accept')).toBe('image/*');
    });

    it('should create text area for multiline editors', () => {
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Check textarea for multiline fields
        const notesTextarea = formHtml.querySelector('[name="Person.notes"]') as HTMLTextAreaElement;
        expect(notesTextarea).toBeDefined();
        expect(notesTextarea.tagName.toLowerCase()).toBe('textarea');
    });

    it('should create select for lists', () => {
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Check select for lists
        const statusSelect = formHtml.querySelector('[name="Person.status"]') as HTMLSelectElement;
        expect(statusSelect).toBeDefined();
        expect(statusSelect.tagName.toLowerCase()).toBe('select');
        
        // Check options
        const options = statusSelect.querySelectorAll('option');
        expect(options.length).toBe(2);
        expect(options[0].value).toBe('Active');
        expect(options[1].value).toBe('Inactive');
    });

    it('should создавать специальные поля для дат и времени', () => {
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Check поля для дат
        const birthDateField = formHtml.querySelector('[name="Person.birthDate"]').closest('.kfrm-fields, .kfrm-fields-ie');
        expect(birthDateField).toBeDefined();
        
        // Check наличие кнопки с календарем
        const calendarButton = birthDateField.querySelector('button');
        expect(calendarButton).toBeDefined();
        
        // Check наличие иконки календаря
        const calendarIcon = calendarButton.querySelector('i.ed-calendar-icon');
        expect(calendarIcon).toBeDefined();
    });

    it('should create fields for lookup attributes', () => {
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Check presence of lookup field
        const departmentField = formHtml.querySelector('[name="Person.departmentId"]').closest('.kfrm-fields, .kfrm-fields-ie');
        expect(departmentField).toBeDefined();
        
        // Check presence of button for opening lookup dialog
        const lookupButton = departmentField.querySelector('button');
        expect(lookupButton).toBeDefined();
        expect(lookupButton.textContent).toBe('...');
    });
    
    it('should add tooltip information for fields with description', () => {
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Check наличие подсказки для поля с описанием
        const nameLabel = formHtml.querySelector(`label[for="Person.name"]`);
        expect(nameLabel).toBeDefined();
        
        const helpIcon = nameLabel.querySelector('.question-mark');
        expect(helpIcon).toBeDefined();
        expect(helpIcon.getAttribute('title')).toBe('Person full name');
    });
    
    it('should set submit handler and call it when Enter is pressed', () => {
        // Create mock function for onSubmit
        const submitCallback = mock();
        
        // Set callback via onSubmit
        builder.onSubmit(submitCallback);
        
        // Build form
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Get input field
        const nameInput = formHtml.querySelector('[name="Person.name"]') as HTMLInputElement;
        
        // Emulate Enter key press
        const enterKeyEvent = new KeyboardEvent('keypress', { keyCode: 13 });
        nameInput.dispatchEvent(enterKeyEvent);
        
        // Check that callback was called
        expect(submitCallback).toHaveBeenCalled();
    });
});
