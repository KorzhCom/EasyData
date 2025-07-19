import { expect } from "@olton/latte";

import { MetaData, DisplayFormatDescriptor } from '../src/meta/meta_data';
import { MetaDataDTO } from '../src/meta/dto/meta_data_dto';
import { MetaEntity, MetaEntityAttr } from '../src/meta/meta_entity';
import { ValueEditor } from '../src/meta/value_editor';
import { DataType } from '../src/types/data_type';
import { EditorTag } from '../src/types/editor_tag';
import { i18n } from '../src/i18n/i18n';

describe('MetaData', () => {
    let metaData: MetaData;
    
    beforeEach(() => {
        metaData = new MetaData();
    });

    it('should создаваться с правильными значениями по умолчанию', () => {
        expect(metaData.id).toBe('__none');
        expect(metaData.name).toBe('Empty model');
        expect(metaData.isEmpty()).toBe(true);
        expect(metaData.version).toBeUndefined();
        expect(metaData.rootEntity).toBeDefined();
    });

    it('should создавать и возвращать объекты сущностей и атрибутов', () => {
        const entity = metaData.createEntity();
        expect(entity).toBeInstanceOf(MetaEntity);
        
        const attr = metaData.createEntityAttr();
        expect(attr).toBeInstanceOf(MetaEntityAttr);
        
        const editor = metaData.createValueEditor();
        expect(editor).toBeInstanceOf(ValueEditor);
    });

    it('should загружать данные из JSON-строки', () => {
        const jsonData = JSON.stringify({
            id: 'test-model',
            name: 'Test Model',
            vers: '1.0.0',
            entroot: {
                name: 'Root',
                attrs: [],
                ents: []
            }
        });
        
        metaData.loadFromJSON(jsonData);
        
        expect(metaData.id).toBe('test-model');
        expect(metaData.name).toBe('Test Model');
        expect(metaData.version).toBe('1.0.0');
    });

    it('should загружать данные из объекта', () => {
        const data: MetaDataDTO = {
            id: 'test-model',
            name: 'Test Model',
            vers: '1.0.0',
            entroot: {
                name: 'Root',
                attrs: [],
                ents: []
            }
        };
        
        metaData.loadFromData(data);
        
        expect(metaData.id).toBe('test-model');
        expect(metaData.name).toBe('Test Model');
        expect(metaData.version).toBe('1.0.0');
    });

    it('should загружать редакторы из данных', () => {
        const data: MetaDataDTO = {
            id: 'test-model',
            name: 'Test Model',
            vers: '1.0.0',
            entroot: {
                name: 'Root',
                attrs: [],
                ents: []
            },
            editors: [
                {
                    id: 'editor1',
                    tag: EditorTag.Edit,
                    rtype: DataType.String
                }
            ]
        };
        
        metaData.loadFromData(data);
        
        expect(metaData.editors).toBeDefined();
        expect(metaData.editors.length).toBe(1);
        expect(metaData.editors[0].id).toBe('editor1');
        expect(metaData.editors[0].tag).toBe(EditorTag.Edit);
        expect(metaData.editors[0].resType).toBe(DataType.String);
    });

    it('should загружать форматы отображения из данных', () => {
        const data: MetaDataDTO = {
            id: 'test-model',
            name: 'Test Model',
            vers: '1.0.0',
            entroot: {
                name: 'Root',
                attrs: [],
                ents: []
            },
            displayFormats: {
                'DateTime': [
                    { name: 'Short', format: 'dd/MM/yyyy', isdef: true },
                    { name: 'Long', format: 'dd MMMM yyyy HH:mm' }
                ]
            }
        };
        
        metaData.loadFromData(data);
        
        const formats = metaData.getDisplayFormats();
        expect(formats).toBeDefined();
        expect(formats.has(DataType.DateTime)).toBe(true);
        
        const dateTimeFormats = metaData.getDisplayFormatsForType(DataType.DateTime);
        expect(dateTimeFormats.length).toBe(2);
        expect(dateTimeFormats[0].name).toBe('Short');
        expect(dateTimeFormats[0].format).toBe('dd/MM/yyyy');
        expect(dateTimeFormats[0].isdef).toBe(true);
    });

    it('should return формат отображения по умолчанию для типа', () => {
        const data: MetaDataDTO = {
            id: 'test-model',
            name: 'Test Model',
            vers: '1.0.0',
            entroot: {
                name: 'Root',
                attrs: [],
                ents: []
            },
            displayFormats: {
                'DateTime': [
                    { name: 'Short', format: 'dd/MM/yyyy' },
                    { name: 'Long', format: 'dd MMMM yyyy HH:mm', isdef: true }
                ]
            }
        };
        
        metaData.loadFromData(data);
        
        const defaultFormat = metaData.getDefaultFormat(DataType.DateTime);
        expect(defaultFormat).not.toBeNull();
        expect(defaultFormat.name).toBe('Long');
        expect(defaultFormat.format).toBe('dd MMMM yyyy HH:mm');
    });

    it('should return пустой массив для несуществующего типа формата', () => {
        const formats = metaData.getDisplayFormatsForType(DataType.Bool);
        expect(formats).toBeArray();
        expect(formats).toBeEmpty();
    });

    it('should return null для формата по умолчанию несуществующего типа', () => {
        const defaultFormat = metaData.getDefaultFormat(DataType.Bool);
        expect(defaultFormat).toBeNull();
    });

    it('should обнаруживать пустую модель данных', () => {
        expect(metaData.isEmpty()).toBe(true);
        
        // Добавляем атрибут к корневой сущности
        const attr = metaData.createEntityAttr(metaData.rootEntity);
        attr.id = 'TestAttribute';
        metaData.rootEntity.attributes.push(attr);
        
        expect(metaData.isEmpty()).toBe(false);
    });

    it('should находить редактор по его ID', () => {
        const editor1 = metaData.createValueEditor();
        editor1.id = 'editor1';
        
        const editor2 = metaData.createValueEditor();
        editor2.id = 'editor2';
        
        metaData.editors = [editor1, editor2];
        
        const foundEditor = metaData.getEditorById('editor2');
        expect(foundEditor).toBe(editor2);
        
        const notFoundEditor = metaData.getEditorById('editor3');
        expect(notFoundEditor).toBeNull();
    });

    it('should находить атрибут по его ID', () => {
        // Create attributes
        const attr1 = metaData.createEntityAttr(metaData.rootEntity);
        attr1.id = 'attr1';
        metaData.rootEntity.attributes.push(attr1);
        
        // Создаем дочернюю сущность
        const subEntity = metaData.createEntity(metaData.rootEntity);
        subEntity.name = 'SubEntity';
        metaData.rootEntity.subEntities.push(subEntity);
        
        // Добавляем атрибут к дочерней сущности
        const attr2 = metaData.createEntityAttr(subEntity);
        attr2.id = 'attr2';
        subEntity.attributes.push(attr2);
        
        // Check поиск по ID
        const foundAttr1 = metaData.getAttributeById('attr1');
        expect(foundAttr1).toBe(attr1);
        
        const foundAttr2 = metaData.getAttributeById('attr2');
        expect(foundAttr2).toBe(attr2);
        
        const notFoundAttr = metaData.getAttributeById('attr3');
        expect(notFoundAttr).toBeNull();
    });

    it('should проверять свойства атрибута', () => {
        // Создаем атрибут
        const attr = metaData.createEntityAttr(metaData.rootEntity);
        attr.id = 'attr1';
        attr.caption = 'Attribute 1';
        attr.description = 'Test description';
        metaData.rootEntity.attributes.push(attr);
        
        // Check существующее свойство
        const hasDescription = metaData.checkAttrProperty('attr1', 'description');
        expect(hasDescription).toBe(true);
        
        // Check несуществующее свойство
        expect(() => {
            metaData.checkAttrProperty('attr1', 'nonExistentProperty');
        }).toThrow('No such property: nonExistentProperty');
        
        // Check атрибут с lookup
        const lookupAttr = metaData.createEntityAttr(metaData.rootEntity);
        lookupAttr.id = 'lookupAttr';
        lookupAttr.description = 'Lookup description';
        metaData.rootEntity.attributes.push(lookupAttr);
        
        const attrWithLookup = metaData.createEntityAttr(metaData.rootEntity);
        attrWithLookup.id = 'attrWithLookup';
        attrWithLookup.lookupAttr = 'lookupAttr';
        attrWithLookup.description = ''; // Пустое описание
        metaData.rootEntity.attributes.push(attrWithLookup);
        
        // Check свойство через lookup
        const hasDescriptionViaLookup = metaData.checkAttrProperty('attrWithLookup', 'description');
        expect(hasDescriptionViaLookup).toBe(true);
    });

    it('should очищать модель данных', () => {
        // Заполняем модель
        metaData.id = 'test-model';
        metaData.name = 'Test Model';
        metaData.version = '1.0.0';
        
        const editor = metaData.createValueEditor();
        editor.id = 'editor1';
        metaData.editors = [editor];
        
        // Очищаем модель
        metaData.clear();
        
        // Check результат
        expect(metaData.rootEntity).toBeDefined();
        expect(metaData.editors).toBeArray();
        expect(metaData.editors).toBeEmpty();
        expect(metaData.version).toBe('');
    });

    it('should добавлять редакторы значений по умолчанию', () => {
        metaData.addDefaultValueEditors();
        
        expect(metaData.editors.length).toBe(3);
        
        // Check первый редактор
        const stringEditor = metaData.getEditorById('_DTE');
        expect(stringEditor).not.toBeNull();
        expect(stringEditor.tag).toBe(EditorTag.Edit);
        expect(stringEditor.resType).toBe(DataType.String);
        expect(stringEditor.defValue).toBe('');
        
        // Check остальные редакторы
        expect(metaData.getEditorById('_DPDE')).not.toBeNull();
        expect(metaData.getEditorById('_DPTE')).not.toBeNull();
    });

    it('should добавлять или обновлять редактор значений', () => {
        // Добавляем новый редактор
        const newEditor = metaData.addOrUpdateValueEditor('testEditor', EditorTag.Edit, DataType.String);
        
        expect(metaData.editors.length).toBe(1);
        expect(newEditor.id).toBe('testEditor');
        expect(newEditor.tag).toBe(EditorTag.Edit);
        expect(newEditor.resType).toBe(DataType.String);
        
        // Обновляем существующий редактор
        const updatedEditor = metaData.addOrUpdateValueEditor('testEditor', EditorTag.DateTime, DataType.DateTime);
        
        expect(metaData.editors.length).toBe(1); // Количество редакторов не изменилось
        expect(updatedEditor).toBe(newEditor); // Тот же экземпляр объекта
        expect(updatedEditor.tag).toBe(EditorTag.DateTime);
        expect(updatedEditor.resType).toBe(DataType.DateTime);
    });

    it('should получать дерево сущностей с фильтрацией', () => {
        // Подготовка данных для теста
        // Создаем иерархию сущностей
        const subEntity1 = metaData.createEntity(metaData.rootEntity);
        subEntity1.name = 'Entity1';
        subEntity1.caption = 'TestEntity';
        metaData.rootEntity.subEntities.push(subEntity1);
        
        const attr1 = metaData.createEntityAttr(subEntity1);
        attr1.id = 'TestAttribute';
        attr1.caption = 'Test Attribute';
        subEntity1.attributes.push(attr1);
        
        const subEntity2 = metaData.createEntity(metaData.rootEntity);
        subEntity2.name = 'Entity2';
        subEntity2.caption = 'Entity 2';
        metaData.rootEntity.subEntities.push(subEntity2);
        
        const attr2 = metaData.createEntityAttr(subEntity2);
        attr2.id = 'Attr2';
        attr2.caption = 'Attribute 2';
        attr2.dataType = DataType.Int32;
        subEntity2.attributes.push(attr2);
        
        // Get дерево сущностей с фильтром по типу данных
        const filterFunc = (entity: MetaEntity, attr: MetaEntityAttr) => {
            return !attr || attr.dataType === DataType.Int32;
        };
        
        const tree = metaData.getEntitiesTreeWithFilter(filterFunc);
        
        // Check результат
        expect(tree.length).toBe(1); // Должна быть только одна сущность
        expect(tree[0].id).toBe('Entity2');
    });

    it('should получать дерево сущностей с опциями', () => {
        // Подготовка данных для теста
        const subEntity1 = metaData.createEntity(metaData.rootEntity);
        subEntity1.name = 'Entity1';
        subEntity1.caption = 'Entity 1';
        metaData.rootEntity.subEntities.push(subEntity1);
        
        const attr1 = metaData.createEntityAttr(subEntity1);
        attr1.id = 'Attr1';
        attr1.caption = 'Attribute 1';
        subEntity1.attributes.push(attr1);
        
        // Get дерево сущностей с опциями
        const opts = {
            includeRootData: true,
            sortEntities: true,
            attrPlacement: 1 // Атрибуты перед сущностями
        };
        
        const tree = metaData.getEntitiesTree(opts);
        
        // Check результат
        expect(tree.id).toBe('Root');
        expect(tree.items.length).toBe(1); // Одна дочерняя сущность
    });

    it('should получать путь сущности по атрибуту', () => {
        // Подготовка данных для теста
        // Создаем иерархию сущностей и атрибутов
        const subEntity1 = metaData.createEntity(metaData.rootEntity);
        subEntity1.name = 'Entity1';
        subEntity1.caption = 'Entity 1';
        metaData.rootEntity.subEntities.push(subEntity1);
        
        const subEntity2 = metaData.createEntity(subEntity1);
        subEntity2.name = 'Entity2';
        subEntity2.caption = 'Entity 2';
        subEntity1.subEntities.push(subEntity2);
        
        const attr = metaData.createEntityAttr(subEntity2);
        attr.id = 'DeepAttribute';
        attr.caption = 'Deep Attribute';
        subEntity2.attributes.push(attr);
        
        // Get путь
        const path = metaData.getFullEntityPathByAttr('DeepAttribute', ' > ');
        
        // Check результат
        expect(path).toBe('Entity 1 > Entity 2');
    });

    it('should получать текст атрибута', () => {
        // Подготовка данных для теста
        const subEntity = metaData.createEntity(metaData.rootEntity);
        subEntity.name = 'TestEntity';
        subEntity.caption = 'Test Entity';
        metaData.rootEntity.subEntities.push(subEntity);
        
        const attr = metaData.createEntityAttr(subEntity);
        attr.id = 'TestAttribute';
        attr.caption = 'Original Caption';
        subEntity.attributes.push(attr);
        
        // Get текст атрибута без формата
        const simpleText = metaData.getAttributeText(attr, '');
        expect(simpleText).toBe('Тестовый Атрибут'); // Берем из i18n
        
        // Get текст атрибута с форматом
        const formattedText = metaData.getAttributeText(attr, '{entity}: {attr}');
        expect(formattedText).toBe('Тестовая Сущность: Тестовый Атрибут');
    });

    it('should сканировать сущности и их атрибуты', () => {
        // Подготовка данных для теста
        const subEntity1 = metaData.createEntity(metaData.rootEntity);
        subEntity1.name = 'Entity1';
        metaData.rootEntity.subEntities.push(subEntity1);
        
        const attr1 = metaData.createEntityAttr(subEntity1);
        attr1.id = 'Attr1';
        subEntity1.attributes.push(attr1);
        
        const attr2 = metaData.createEntityAttr(subEntity1);
        attr2.id = 'Attr2';
        subEntity1.attributes.push(attr2);
        
        const subEntity2 = metaData.createEntity(metaData.rootEntity);
        subEntity2.name = 'Entity2';
        metaData.rootEntity.subEntities.push(subEntity2);
        
        // Подсчитываем количество атрибутов и сущностей
        let attrCount = 0;
        let entityCount = 0;
        
        metaData.runThroughEntities(
            () => { attrCount++; },
            () => { entityCount++; }
        );
        
        // Check результат: 2 атрибута и 3 сущности (корневая + 2 дочерние)
        expect(attrCount).toBe(2);
        expect(entityCount).toBe(3);
    });

    it('should находить первый атрибут по фильтру', () => {
        // Подготовка данных для теста
        const entity1 = metaData.createEntity(metaData.rootEntity);
        entity1.name = 'Entity1';
        metaData.rootEntity.subEntities.push(entity1);
        
        const attr1 = metaData.createEntityAttr(entity1);
        attr1.id = 'Attr1';
        attr1.dataType = DataType.String;
        entity1.attributes.push(attr1);
        
        const attr2 = metaData.createEntityAttr(entity1);
        attr2.id = 'Attr2';
        attr2.dataType = DataType.Int32;
        entity1.attributes.push(attr2);
        
        // Поиск атрибута типа Int32
        const intAttr = metaData.getFirstAttributeByFilter(
            (attr) => attr.dataType === DataType.Int32
        );
        
        // Check результат
        expect(intAttr).not.toBeNull();
        expect(intAttr.id).toBe('Attr2');
    });

    it('should устанавливать данные используя setData', () => {
        // Через JSON-строку
        const jsonData = JSON.stringify({
            id: 'test-json',
            name: 'Test JSON',
            vers: '1.0'
        });
        
        metaData.setData(jsonData);
        expect(metaData.id).toBe('test-json');
        expect(metaData.name).toBe('Test JSON');
        
        // Через объект
        const objData = {
            id: 'test-obj',
            name: 'Test Object',
            vers: '2.0',
            entroot: {
                name: 'Root',
                attrs: [],
                ents: []
            }
        };
        
        metaData.setData(objData);
        expect(metaData.id).toBe('test-obj');
        expect(metaData.name).toBe('Test Object');
        expect(metaData.version).toBe('2.0');
    });
});
