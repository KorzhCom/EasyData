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

    it('should be created with correct default values', () => {
        expect(metaData.id).toBe('__none');
        expect(metaData.name).toBe('Empty model');
        expect(metaData.isEmpty()).toBe(true);
        expect(metaData.version).toBeUndefined();
        expect(metaData.rootEntity).toBeDefined();
    });

    it('should create and return entity and attribute objects', () => {
        const entity = metaData.createEntity();
        expect(entity).toBeInstanceOf(MetaEntity);
        
        const attr = metaData.createEntityAttr();
        expect(attr).toBeInstanceOf(MetaEntityAttr);
        
        const editor = metaData.createValueEditor();
        expect(editor).toBeInstanceOf(ValueEditor);
    });

    it('should load data from JSON string', () => {
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

    it('should load data from object', () => {
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

    it('should load editors from data', () => {
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

    it('should load display formats from data', () => {
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

    it('should return default display format for type', () => {
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

    it('should return empty array for non-existent format type', () => {
        const formats = metaData.getDisplayFormatsForType(DataType.Bool);
        expect(formats).toBeArray();
        expect(formats).toBeEmpty();
    });

    it('should return null for non-existent default format type', () => {
        const defaultFormat = metaData.getDefaultFormat(DataType.Bool);
        expect(defaultFormat).toBeNull();
    });

    it('should detect empty data model', () => {
        expect(metaData.isEmpty()).toBe(true);
        
        // Add attribute to root entity
        const attr = metaData.createEntityAttr(metaData.rootEntity);
        attr.id = 'TestAttribute';
        metaData.rootEntity.attributes.push(attr);
        
        expect(metaData.isEmpty()).toBe(false);
    });

    it('should find editor by its ID', () => {
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

    it('should find attribute by its ID', () => {
        // Create attributes
        const attr1 = metaData.createEntityAttr(metaData.rootEntity);
        attr1.id = 'attr1';
        metaData.rootEntity.attributes.push(attr1);

        // Create child entity
        const subEntity = metaData.createEntity(metaData.rootEntity);
        subEntity.name = 'SubEntity';
        metaData.rootEntity.subEntities.push(subEntity);

        // Add attribute to child entity
        const attr2 = metaData.createEntityAttr(subEntity);
        attr2.id = 'attr2';
        subEntity.attributes.push(attr2);

        // Check search by ID
        const foundAttr1 = metaData.getAttributeById('attr1');
        expect(foundAttr1).toBe(attr1);
        
        const foundAttr2 = metaData.getAttributeById('attr2');
        expect(foundAttr2).toBe(attr2);
        
        const notFoundAttr = metaData.getAttributeById('attr3');
        expect(notFoundAttr).toBeNull();
    });

    it('should check attribute properties', () => {
        // Create attribute
        const attr = metaData.createEntityAttr(metaData.rootEntity);
        attr.id = 'attr1';
        attr.caption = 'Attribute 1';
        attr.description = 'Test description';
        metaData.rootEntity.attributes.push(attr);
        
        // Check existing property
        const hasDescription = metaData.checkAttrProperty('attr1', 'description');
        expect(hasDescription).toBe(true);
        
        // Check non-existent property
        expect(() => {
            metaData.checkAttrProperty('attr1', 'nonExistentProperty');
        }).toThrow('No such property: nonExistentProperty');
        
        // Check attribute with lookup
        const lookupAttr = metaData.createEntityAttr(metaData.rootEntity);
        lookupAttr.id = 'lookupAttr';
        lookupAttr.description = 'Lookup description';
        metaData.rootEntity.attributes.push(lookupAttr);
        
        const attrWithLookup = metaData.createEntityAttr(metaData.rootEntity);
        attrWithLookup.id = 'attrWithLookup';
        attrWithLookup.lookupAttr = 'lookupAttr';
        attrWithLookup.description = ''; // Empty description
        metaData.rootEntity.attributes.push(attrWithLookup);

        // Check property via lookup
        const hasDescriptionViaLookup = metaData.checkAttrProperty('attrWithLookup', 'description');
        expect(hasDescriptionViaLookup).toBe(true);
    });

    it('should clear data model', () => {
        // Fill model
        metaData.id = 'test-model';
        metaData.name = 'Test Model';
        metaData.version = '1.0.0';
        
        const editor = metaData.createValueEditor();
        editor.id = 'editor1';
        metaData.editors = [editor];

        // Clear model
        metaData.clear();

        // Check result
        expect(metaData.rootEntity).toBeDefined();
        expect(metaData.editors).toBeArray();
        expect(metaData.editors).toBeEmpty();
        expect(metaData.version).toBe('');
    });

    it('should add default value editors', () => {
        metaData.addDefaultValueEditors();
        
        expect(metaData.editors.length).toBe(3);

        // Check first editor
        const stringEditor = metaData.getEditorById('_DTE');
        expect(stringEditor).not.toBeNull();
        expect(stringEditor.tag).toBe(EditorTag.Edit);
        expect(stringEditor.resType).toBe(DataType.String);
        expect(stringEditor.defValue).toBe('');

        // Check other editors
        expect(metaData.getEditorById('_DPDE')).not.toBeNull();
        expect(metaData.getEditorById('_DPTE')).not.toBeNull();
    });

    it('should add or update value editor', () => {
        // Add new editor
        const newEditor = metaData.addOrUpdateValueEditor('testEditor', EditorTag.Edit, DataType.String);
        
        expect(metaData.editors.length).toBe(1);
        expect(newEditor.id).toBe('testEditor');
        expect(newEditor.tag).toBe(EditorTag.Edit);
        expect(newEditor.resType).toBe(DataType.String);

        // Refresh existing editor
        const updatedEditor = metaData.addOrUpdateValueEditor('testEditor', EditorTag.DateTime, DataType.DateTime);

        expect(metaData.editors.length).toBe(1); // Number of editors did not change
        expect(updatedEditor).toBe(newEditor); // Same object instance
        expect(updatedEditor.tag).toBe(EditorTag.DateTime);
        expect(updatedEditor.resType).toBe(DataType.DateTime);
    });

    it('should get entities tree with filtering', () => {
        // Prepare test data
        // Create entity hierarchy  
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
        
        // Get entities tree with filtering
        const filterFunc = (entity: MetaEntity, attr: MetaEntityAttr) => {
            return !attr || attr.dataType === DataType.Int32;
        };
        
        const tree = metaData.getEntitiesTreeWithFilter(filterFunc);

        // Check result
        expect(tree.length).toBe(1); // Should be only one entity
        expect(tree[0].id).toBe('Entity2');
    });

    it('should get entities tree with options', () => {
        // Prepare test data
        const subEntity1 = metaData.createEntity(metaData.rootEntity);
        subEntity1.name = 'Entity1';
        subEntity1.caption = 'Entity 1';
        metaData.rootEntity.subEntities.push(subEntity1);
        
        const attr1 = metaData.createEntityAttr(subEntity1);
        attr1.id = 'Attr1';
        attr1.caption = 'Attribute 1';
        subEntity1.attributes.push(attr1);

        // Get the entities tree with options
        const opts = {
            includeRootData: true,
            sortEntities: true,
            attrPlacement: 1 // Attributes before entities
        };
        
        const tree = metaData.getEntitiesTree(opts);
        
        // Check result
        expect(tree.id).toBe('Root');
        expect(tree.items.length).toBe(1); // Should be only one child entity
    });

    it('should get entity path by attribute', () => {
        // Prepare test data
        // Create entity hierarchy and attributes
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
        
        // Get path
        const path = metaData.getFullEntityPathByAttr('DeepAttribute', ' > ');

        // Check result
        expect(path).toBe('Entity 1 > Entity 2');
    });

    it('should get attribute text', () => {
        // Prepare test data
        const subEntity = metaData.createEntity(metaData.rootEntity);
        subEntity.name = 'TestEntity';
        subEntity.caption = 'Test Entity';
        metaData.rootEntity.subEntities.push(subEntity);
        
        const attr = metaData.createEntityAttr(subEntity);
        attr.id = 'TestAttribute';
        attr.caption = 'Original Caption';
        subEntity.attributes.push(attr);

        // Get attribute text without format
        const simpleText = metaData.getAttributeText(attr, '');
        expect(simpleText).toBe('Test Attribute'); // Take from i18n

        // Get attribute text with format
        const formattedText = metaData.getAttributeText(attr, '{entity}: {attr}');
        expect(formattedText).toBe('Test Entity: Test Attribute');
    });

    it('should scan entities and their attributes', () => {
        // Prepare test data
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

        // Count attributes and entities
        let attrCount = 0;
        let entityCount = 0;
        
        metaData.runThroughEntities(
            () => { attrCount++; },
            () => { entityCount++; }
        );

        // Check result: 2 attributes and 3 entities (root + 2 children)
        expect(attrCount).toBe(2);
        expect(entityCount).toBe(3);
    });

    it('should find the first attribute by filter', () => {
        // Prepare test data
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

        // Find attribute of type Int32
        const intAttr = metaData.getFirstAttributeByFilter(
            (attr) => attr.dataType === DataType.Int32
        );

        // Check result
        expect(intAttr).not.toBeNull();
        expect(intAttr.id).toBe('Attr2');
    });

    it('should set data using setData', () => {
        // Through JSON string
        const jsonData = JSON.stringify({
            id: 'test-json',
            name: 'Test JSON',
            vers: '1.0'
        });
        
        metaData.setData(jsonData);
        expect(metaData.id).toBe('test-json');
        expect(metaData.name).toBe('Test JSON');

        // Creating object
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
