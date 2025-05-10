import { expect } from "@olton/latte";

import { MetaEntity, MetaEntityAttr } from '../src/meta/meta_entity';
import { MetaData } from '../src/meta/meta_data';
import { MetaEntityDTO, MetaEntityAttrDTO } from '../src/meta/dto/meta_entity_dto';
import { DataType } from '../src/types/data_type';
import { EntityAttrKind } from '../src/types/entity_attr_kind';

describe('MetaEntity', () => {
    let mockMetaData: MetaData;
    
    beforeEach(() => {
        mockMetaData = {
            createEntity: (parent?: MetaEntity) => new MetaEntity(parent),
            createEntityAttr: (entity: MetaEntity) => new MetaEntityAttr(entity),
            getEditorById: (id: string) => null
        } as unknown as MetaData;
    });
    
    it('должен инициализироваться с правильными значениями по умолчанию', () => {
        const entity = new MetaEntity();
        
        expect(entity.name).toBe('');
        expect(entity.caption).toBe('');
        expect(entity.description).toBe('');
        expect(entity.isEditable).toBe(true);
        expect(entity.attributes).toBeArray();
        expect(entity.attributes).toBeEmpty();
        expect(entity.subEntities).toBeArray();
        expect(entity.subEntities).toBeEmpty();
        expect(entity.parent).toBeUndefined();
    });
    
    it('должен принимать родительскую сущность в конструкторе', () => {
        const parent = new MetaEntity();
        const child = new MetaEntity(parent);
        
        expect(child.parent).toBe(parent);
    });
    
    it('должен загружать данные из DTO', () => {
        const entity = new MetaEntity();
        const dto: MetaEntityDTO = {
            id: 'test-entity',
            name: 'TestEntity',
            namePlur: 'TestEntities',
            desc: 'Test entity description',
            ied: false,
            ents: [],
            attrs: []
        };
        
        entity.loadFromData(mockMetaData, dto);
        
        expect(entity.id).toBe('test-entity');
        expect(entity.name).toBe('TestEntity');
        expect(entity.caption).toBe('TestEntity');
        expect(entity.captionPlural).toBe('TestEntities');
        expect(entity.description).toBe('Test entity description');
        expect(entity.isEditable).toBe(false);
    });
    
    it('должен загружать дочерние сущности из DTO', () => {
        const entity = new MetaEntity();
        const dto: MetaEntityDTO = {
            id: 'parent',
            name: 'Parent',
            namePlur: 'Parents',
            ents: [
                {
                    id: 'child1',
                    name: 'Child1',
                    namePlur: 'Child1s',
                    ents: [],
                    attrs: []
                },
                {
                    id: 'child2',
                    name: 'Child2',
                    namePlur: 'Child2s',
                    ents: [],
                    attrs: []
                }
            ],
            attrs: []
        };
        
        entity.loadFromData(mockMetaData, dto);
        
        expect(entity.subEntities.length).toBe(2);
        expect(entity.subEntities[0].id).toBe('child1');
        expect(entity.subEntities[1].id).toBe('child2');
        expect(entity.subEntities[0].parent).toBe(entity);
        expect(entity.subEntities[1].parent).toBe(entity);
    });
    
    it('должен загружать атрибуты из DTO', () => {
        const entity = new MetaEntity();
        const dto: MetaEntityDTO = {
            id: 'test-entity',
            name: 'TestEntity',
            namePlur: 'TestEntities',
            ents: [],
            attrs: [
                {
                    id: 'id',
                    cptn: 'ID',
                    dtype: DataType.Int32,
                    ipk: true,
                    ifk: false
                },
                {
                    id: 'name',
                    cptn: 'Name',
                    dtype: DataType.String,
                    ipk: false,
                    ifk: false
                }
            ]
        };
        
        entity.loadFromData(mockMetaData, dto);
        
        expect(entity.attributes.length).toBe(2);
        expect(entity.attributes[0].id).toBe('id');
        expect(entity.attributes[0].caption).toBe('ID');
        expect(entity.attributes[0].dataType).toBe(DataType.Int32);
        expect(entity.attributes[0].isPrimaryKey).toBe(true);
        
        expect(entity.attributes[1].id).toBe('name');
        expect(entity.attributes[1].caption).toBe('Name');
        expect(entity.attributes[1].dataType).toBe(DataType.String);
        expect(entity.attributes[1].isPrimaryKey).toBe(false);
    });
    
    it('должен сканировать сущность с атрибутами и подсущностями', () => {
        // Настройка сложной иерархии сущностей
        const rootEntity = new MetaEntity();
        rootEntity.id = 'root';
        
        const attr1 = new MetaEntityAttr(rootEntity);
        attr1.id = 'attr1';
        rootEntity.attributes.push(attr1);
        
        const childEntity = new MetaEntity(rootEntity);
        childEntity.id = 'child';
        rootEntity.subEntities.push(childEntity);
        
        const attr2 = new MetaEntityAttr(childEntity);
        attr2.id = 'attr2';
        childEntity.attributes.push(attr2);
        
        // Счетчики для проверки вызовов
        let entityCount = 0;
        let attrCount = 0;
        
        // Сканирование
        rootEntity.scan(
            (attr) => {
                attrCount++;
                // Прерываем сканирование после первого атрибута для теста
                if (attr.id === 'attr1') {
                    return;
                }
            },
            (entity) => {
                entityCount++;
            }
        );
        
        // Должен посетить только корневую сущность и первый атрибут
        expect(entityCount).toBe(1);
        expect(attrCount).toBe(1);
        
        // Повторное сканирование полностью
        entityCount = 0;
        attrCount = 0;
        
        rootEntity.scan(
            (attr) => {
                attrCount++;
            },
            (entity) => {
                entityCount++;
            }
        );
        
        // Должен посетить все сущности и атрибуты
        expect(entityCount).toBe(2); // root и child
        expect(attrCount).toBe(2); // attr1 и attr2
    });
    
    it('должен находить первичные атрибуты', () => {
        const entity = new MetaEntity();
        
        // Создаем атрибуты
        const attr1 = new MetaEntityAttr(entity);
        attr1.id = 'id';
        attr1.isPrimaryKey = true;
        entity.attributes.push(attr1);
        
        const attr2 = new MetaEntityAttr(entity);
        attr2.id = 'name';
        attr2.isPrimaryKey = false;
        entity.attributes.push(attr2);
        
        const attr3 = new MetaEntityAttr(entity);
        attr3.id = 'code';
        attr3.isPrimaryKey = true;
        entity.attributes.push(attr3);
        
        // Проверка getPrimaryAttrs
        const primaryAttrs = entity.getPrimaryAttrs();
        expect(primaryAttrs.length).toBe(2);
        expect(primaryAttrs[0].id).toBe('id');
        expect(primaryAttrs[1].id).toBe('code');
        
        // Проверка getFirstPrimaryAttr
        const firstPrimaryAttr = entity.getFirstPrimaryAttr();
        expect(firstPrimaryAttr).not.toBeNull();
        expect(firstPrimaryAttr!.id).toBe('id');
    });
    
    it('должен возвращать null из getFirstPrimaryAttr если первичных ключей нет', () => {
        const entity = new MetaEntity();
        
        const attr = new MetaEntityAttr(entity);
        attr.id = 'name';
        attr.isPrimaryKey = false;
        entity.attributes.push(attr);
        
        const firstPrimaryAttr = entity.getFirstPrimaryAttr();
        expect(firstPrimaryAttr).toBeNull();
        
        const primaryAttrs = entity.getPrimaryAttrs();
        expect(primaryAttrs.length).toBe(0);
    });
});

describe('MetaEntityAttr', () => {
    let mockMetaData: MetaData;
    let mockEntity: MetaEntity;
    
    beforeEach(() => {
        mockEntity = new MetaEntity();
        mockEntity.id = 'test-entity';
        
        mockMetaData = {
            getEditorById: (id: string) => null
        } as unknown as MetaData;
    });
    
    it('должен инициализироваться с правильными значениями по умолчанию', () => {
        const attr = new MetaEntityAttr(mockEntity);
        
        expect(attr.id).toBe('');
        expect(attr.caption).toBe('{Unrecognized attribute}');
        expect(attr.dataType).toBe(DataType.String);
        expect(attr.size).toBe(0);
        expect(attr.isPrimaryKey).toBe(false);
        expect(attr.isForeignKey).toBe(false);
        expect(attr.isNullable).toBe(true);
        expect(attr.isEditable).toBe(true);
        expect(attr.showOnView).toBe(true);
        expect(attr.showOnCreate).toBe(true);
        expect(attr.showOnEdit).toBe(true);
        expect(attr.showInLookup).toBe(false);
        expect(attr.kind).toBe(EntityAttrKind.Data);
        expect(attr.entity).toBe(mockEntity);
    });
    
    it('должен загружать данные из DTO', () => {
        const attr = new MetaEntityAttr(mockEntity);
        const dto: MetaEntityAttrDTO = {
            id: 'test-attr',
            cptn: 'Test Attribute',
            desc: 'Test attribute description',
            dtype: DataType.Int32,
            ipk: true,
            ifk: true,
            size: 10,
            nul: false,
            ied: false,
            sov: false,
            soc: false,
            soe: false,
            sil: true,
            kind: EntityAttrKind.Data,
            dfmt: '#,###.00',
            udata: '{"custom":"data"}'
        };
        
        attr.loadFromData(mockMetaData, dto);
        
        expect(attr.id).toBe('test-attr');
        expect(attr.caption).toBe('Test Attribute');
        expect(attr.description).toBe('Test attribute description');
        expect(attr.dataType).toBe(DataType.Int32);
        expect(attr.isPrimaryKey).toBe(true);
        expect(attr.isForeignKey).toBe(true);
        expect(attr.size).toBe(10);
        expect(attr.isNullable).toBe(false);
        expect(attr.isEditable).toBe(false);
        expect(attr.showOnView).toBe(false);
        expect(attr.showOnCreate).toBe(false);
        expect(attr.showOnEdit).toBe(false);
        expect(attr.showInLookup).toBe(true);
        expect(attr.displayFormat).toBe('#,###.00');
        expect(attr.userData).toBe('{"custom":"data"}');
    });
    
    it('должен правильно обрабатывать даты в defaultValue', () => {
        const attr = new MetaEntityAttr(mockEntity);
        
        // Проверяем Date в defaultValue
        const dateDto: MetaEntityAttrDTO = {
            id: 'date-attr',
            cptn: 'Date Field',
            dtype: DataType.Date,
            ipk: false,
            ifk: false,
            defVal: '2022-01-15T00:00:00'
        };
        
        attr.loadFromData(mockMetaData, dateDto);
        
        expect(attr.defaultValue).toBeInstanceOf(Date);
        expect(attr.defaultValue.getFullYear()).toBe(2022);
        expect(attr.defaultValue.getMonth()).toBe(0); // январь = 0
        expect(attr.defaultValue.getDate()).toBe(15);
    });
    
    it('должен корректно обрабатывать lookup атрибуты', () => {
        const attr = new MetaEntityAttr(mockEntity);
        const dto: MetaEntityAttrDTO = {
            id: 'fk-attr',
            cptn: 'Foreign Key',
            dtype: DataType.Int32,
            ipk: false,
            ifk: true,
            lattr: 'ref-attr',
            lent: 'ref-entity',
            dattr: 'data-attr',
            ldattr: 'lookup-data-attr'
        };
        
        attr.loadFromData(mockMetaData, dto);
        
        expect(attr.lookupAttr).toBe('ref-attr');
        expect(attr.lookupEntity).toBe('ref-entity');
        expect(attr.dataAttr).toBe('data-attr');
        expect(attr.lookupDataAttr).toBe('lookup-data-attr');
    });
    
    it('должен устанавливать редактор по умолчанию', () => {
        const editor = { id: 'test-editor' };
        
        mockMetaData = {
            getEditorById: (id: string) => id === 'test-editor' ? editor : null,
            createValueEditor: () => ({ id: 'default-editor' })
        } as unknown as MetaData;
        
        const attr = new MetaEntityAttr(mockEntity);
        const dto: MetaEntityAttrDTO = {
            id: 'attr-with-editor',
            cptn: 'Attr With Editor',
            dtype: DataType.String,
            ipk: false,
            ifk: false,
            edtr: 'test-editor'
        };
        
        attr.loadFromData(mockMetaData, dto);
        
        expect(attr.defaultEditor).toBe(editor);
    });
    
    it('должен использовать старый формат ivis как синоним для sov', () => {
        const attr = new MetaEntityAttr(mockEntity);
        
        // Используем старый формат ivis
        const dtoOld: MetaEntityAttrDTO = {
            id: 'old-attr',
            cptn: 'Old Attr',
            dtype: DataType.String,
            ipk: false,
            ifk: false,
            ivis: false
        };
        
        attr.loadFromData(mockMetaData, dtoOld);
        expect(attr.showOnView).toBe(false);
        
        // Используем новый формат sov
        const dtoNew: MetaEntityAttrDTO = {
            id: 'new-attr',
            cptn: 'New Attr',
            dtype: DataType.String,
            ipk: false,
            ifk: false,
            sov: true
        };
        
        attr.loadFromData(mockMetaData, dtoNew);
        expect(attr.showOnView).toBe(true);
    });
});
