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
    
    // Вспомогательная функция для создания атрибута
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
        // Создаем атрибуты для нашей сущности
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
        
        // Создаем сущность с атрибутами
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
        
        // Создаем мок для контекста данных
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
        
        // Создаем экземпляр builder'а
        builder = new EntityEditFormBuilder(mockDataContext);
    });

    it('должен создаваться с пустыми параметрами и сбрасываться на значения по умолчанию', () => {
        expect(builder).toBeDefined();
        
        // Проверяем, что свойство context установлено
        expect((builder as any).context).toBe(mockDataContext);
        
        // Проверяем метод reset
        const formBeforeReset = (builder as any).form;
        builder.reset();
        const formAfterReset = (builder as any).form;
        
        expect(formBeforeReset).not.toBe(formAfterReset);
        expect(formAfterReset).toBeInstanceOf(EntityEditForm);
    });

    it('должен создавать форму с правильными полями', () => {
        const form = builder.build();
        
        // Проверяем что форма создана
        expect(form).toBeInstanceOf(EntityEditForm);
        
        // Получаем HTML формы
        const formHtml = form.getHtml();
        expect(formHtml).toBeDefined();
        
        // Проверяем наличие блока для ошибок
        const errorsBlock = formHtml.querySelector('.errors-block');
        expect(errorsBlock).toBeDefined();
        
        // Проверяем наличие полей формы
        const inputs = formHtml.querySelectorAll('input');
        expect(inputs.length).toBeGreaterThan(0);
        
        // Проверяем что каждый атрибут создал соответствующее поле
        for (const attr of mockEntity.attributes) {
            // Пропустить атрибуты, которые не должны отображаться в форме создания
            if (!attr.showOnCreate) continue;
            
            // Найти поле по имени
            const field = formHtml.querySelector(`[name="${attr.id}"]`);
            expect(field).toBeDefined();
            
            // Проверить label для поля
            const label = formHtml.querySelector(`label[for="${attr.id}"]`);
            expect(label).toBeDefined();
            expect(label.textContent).toContain(attr.caption);
            
            // Проверить обязательные поля
            if (!attr.isNullable) {
                expect(label.innerHTML).toContain('<sup style="color: red">*</sup>');
            }
        }
    });

    it('должен устанавливать значения из dataRow при создании формы', () => {
        const params: FormBuildParams = {
            values: dataRow
        };
        
        const builder = new EntityEditFormBuilder(mockDataContext, params);
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Проверяем заполнение полей значениями из dataRow
        const nameInput = formHtml.querySelector('[name="Person.name"]') as HTMLInputElement;
        expect(nameInput.value).toBe('John Doe');
        
        const isActiveInput = formHtml.querySelector('[name="Person.isActive"]') as HTMLInputElement;
        expect(isActiveInput.checked).toBe(true);
    });

    it('должен создавать форму редактирования с правильными параметрами', () => {
        const params: FormBuildParams = {
            values: dataRow,
            isEditForm: true
        };
        
        const builder = new EntityEditFormBuilder(mockDataContext, params);
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Проверяем, что первичные ключи имеют атрибут readonly
        const idInput = formHtml.querySelector('[name="Person.id"]') as HTMLInputElement;
        expect(idInput).toBeDefined();
        expect(idInput.getAttribute('readonly')).toBeDefined();
        
        // Проверяем, что неизменяемые атрибуты имеют readonly
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

    it('должен создавать текстовые поля правильного типа', () => {
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Проверяем текстовые поля
        const nameInput = formHtml.querySelector('[name="Person.name"]') as HTMLInputElement;
        expect(nameInput.type).toBe('text');
        
        // Проверяем поля checkbox
        const isActiveInput = formHtml.querySelector('[name="Person.isActive"]') as HTMLInputElement;
        expect(isActiveInput.type).toBe('checkbox');
        
        // Проверяем поля file
        const photoInput = formHtml.querySelector('[name="Person.photo"]') as HTMLInputElement;
        expect(photoInput.type).toBe('file');
        expect(photoInput.getAttribute('accept')).toBe('image/*');
    });

    it('должен создавать текстовую область для многострочных редакторов', () => {
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Проверяем textarea для многострочных полей
        const notesTextarea = formHtml.querySelector('[name="Person.notes"]') as HTMLTextAreaElement;
        expect(notesTextarea).toBeDefined();
        expect(notesTextarea.tagName.toLowerCase()).toBe('textarea');
    });

    it('должен создавать select для списков', () => {
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Проверяем select для списков
        const statusSelect = formHtml.querySelector('[name="Person.status"]') as HTMLSelectElement;
        expect(statusSelect).toBeDefined();
        expect(statusSelect.tagName.toLowerCase()).toBe('select');
        
        // Проверяем опции
        const options = statusSelect.querySelectorAll('option');
        expect(options.length).toBe(2);
        expect(options[0].value).toBe('Active');
        expect(options[1].value).toBe('Inactive');
    });

    it('должен создавать специальные поля для дат и времени', () => {
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Проверяем поля для дат
        const birthDateField = formHtml.querySelector('[name="Person.birthDate"]').closest('.kfrm-fields, .kfrm-fields-ie');
        expect(birthDateField).toBeDefined();
        
        // Проверяем наличие кнопки с календарем
        const calendarButton = birthDateField.querySelector('button');
        expect(calendarButton).toBeDefined();
        
        // Проверяем наличие иконки календаря
        const calendarIcon = calendarButton.querySelector('i.ed-calendar-icon');
        expect(calendarIcon).toBeDefined();
    });

    it('должен создавать поля для lookup атрибутов', () => {
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Проверяем наличие поля для lookup
        const departmentField = formHtml.querySelector('[name="Person.departmentId"]').closest('.kfrm-fields, .kfrm-fields-ie');
        expect(departmentField).toBeDefined();
        
        // Проверяем наличие кнопки для открытия lookup диалога
        const lookupButton = departmentField.querySelector('button');
        expect(lookupButton).toBeDefined();
        expect(lookupButton.textContent).toBe('...');
    });
    
    it('должен добавлять информацию о подсказках для полей с описанием', () => {
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Проверяем наличие подсказки для поля с описанием
        const nameLabel = formHtml.querySelector(`label[for="Person.name"]`);
        expect(nameLabel).toBeDefined();
        
        const helpIcon = nameLabel.querySelector('.question-mark');
        expect(helpIcon).toBeDefined();
        expect(helpIcon.getAttribute('title')).toBe('Person full name');
    });
    
    it('должен устанавливать обработчик submit и вызывать его при нажатии Enter', () => {
        // Создаем мок-функцию для onSubmit
        const submitCallback = mock();
        
        // Устанавливаем callback через onSubmit
        builder.onSubmit(submitCallback);
        
        // Строим форму
        const form = builder.build();
        const formHtml = form.getHtml();
        
        // Получаем поле ввода
        const nameInput = formHtml.querySelector('[name="Person.name"]') as HTMLInputElement;
        
        // Эмулируем нажатие клавиши Enter
        const enterKeyEvent = new KeyboardEvent('keypress', { keyCode: 13 });
        nameInput.dispatchEvent(enterKeyEvent);
        
        // Проверяем, что callback был вызван
        expect(submitCallback).toHaveBeenCalled();
    });
});
