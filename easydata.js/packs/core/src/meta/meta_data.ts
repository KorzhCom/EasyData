import { i18n } from '../i18n/i18n';
import { utils } from '../utils/utils';

import { EditorTag } from '../types/editor_tag';
import { DataType } from '../types/data_type';

import { MetaDataDTO } from './dto/meta_data_dto';
import { MetaEntity, MetaEntityAttr } from './meta_entity';
import { MetaValueEditor } from './value_editor';

/**
 * Represents a data model
 */
export class MetaData {
    
    /** The ID of the data mode. */
    public id: string;

    /** The name of the data model. */
    public name: string;

    /** The version of the data model. */
    public version: string;

    /** The root entity. */
    public rootEntity: MetaEntity;

    /** The list of value editors. */
    public editors: MetaValueEditor[];

    protected mainEntity: MetaEntity | null = null;

    /** The default constructor. */
    constructor() {
        this.id = '__none';
        this.name = 'Empty model';
        this.rootEntity = this.createEntity();
    }

    /**
     * Gets the main entity of model
     * @return The main entity.
     */
    public getMainEntity(): MetaEntity {
        return this.mainEntity;
    }

    public createEntity(parent?: MetaEntity): MetaEntity {
        return new MetaEntity(parent);
    }

    public createEntityAttr(parent?: MetaEntity): MetaEntityAttr {
        return new MetaEntityAttr(parent);
    }

    public createValueEditor(): MetaValueEditor {
        return new MetaValueEditor();
    }

    /**
     * Loads data model from JSON.
     * @param stringJson The JSON string.
     */
    public loadFromJSON(stringJson: string) {
        let model = JSON.parse(stringJson);
        this.loadFromData(model);
    }

    /**
     * Loads data model from its JSON representation object.
     * @param data The JSON representation object.
     */
    public loadFromData(data: MetaDataDTO) {
        this.id = data.id;
        this.name = data.name;
        this.version = data.vers;
        
        //Editors
        this.editors = new Array<MetaValueEditor>();
        if (data.editors) {
            for(let i = 0; i < data.editors.length; i++) {
                let newEditor = this.createValueEditor();
                newEditor.loadFromData(data.editors[i]);
                this.editors.push(newEditor);
            }
        }

        //rootEntity
        this.rootEntity.loadFromData(this, data.entroot);
    }

    /**
     * Sets data to data model.
     * @param model Its JSON representation object or JSON string.
     */
    public setData(model: MetaDataDTO | string) {

        if (typeof model === 'string') {
            this.loadFromJSON(model);
        }
        else {
            this.loadFromData(model);
        }

    }

    /**
     * Checks wether the data model is empty.
     * @returns `true` if the data model is empty, otherwise `false`. 
     */
    public isEmpty(): boolean {
        return this.rootEntity.subEntities.length === 0 && this.rootEntity.attributes.length === 0;
    }

    /**
     * Gets ID of the data model.
     * @returns The ID.
     */
    public getId(): string {
        return this.id;
    }

    /**
     * Gets name of the data model.
     * @returns The name.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Gets root entity of the data model.
     * @returns The root entity.
     */
    public getRootEntity(): MetaEntity {
        return this.rootEntity;
    }

    /**
     * Finds editor by its ID.
     * @param editorId The editor ID.
     * @returns The value editor or `null`.
     */
    public getEditorById(editorId: string): MetaValueEditor | null {
        for(let editor of this.editors) {
            if (editor.id === editorId) {
                return editor;
            }

        }

        return null;
    }

    /**
     * Gets entity attribute by its ID.
     * This function runs through all attributes inside specified model (it's root entity and all its sub-entities).
     * @param attrId The attribute ID.
     * @returns The attribute or `null`.
     */
    public getAttributeById(attrId: string): MetaEntityAttr | null {
        let attr = this.getEntityAttrById(this.getRootEntity(), attrId);
        if (!attr) {
            return null;
        }
        return attr;
    }

    /**
     * Checks wether attribute contains such property.
     * @param attrId The attribute ID.
     * @param propName The property name.
     * @returns `true` if the attribute contains the property, otherwise `false`.
     */
    public checkAttrProperty(attrId: string, propName: string) : boolean {
        let attribute = this.getAttributeById(attrId);
        if (attribute) {
            if (typeof attribute[propName] === 'undefined') {
                throw 'No such property: ' + propName;
            }
            if (attribute[propName]) {
                return true;
            }
            else if (attribute.lookupAttr) {
                attrId = attribute.lookupAttr;
                attribute = this.getAttributeById(attrId);
                return attribute && attribute[propName];
            }
            else {
                return false;
            }
        }
        else
            return false;

    }

    /**
     * Gets entity attribute by its ID.
     * This function runs through all attributes inside specified entity and all its sub-entities.
     * @param entity 
     * @param attrId 
     * @returns The attribute or `null`.
     */
    public getEntityAttrById(entity: MetaEntity, attrId: string): MetaEntityAttr | null {
        let idx: number;
        if (entity.attributes) {
            let attrCount = entity.attributes.length;
            for (idx = 0; idx < attrCount; idx++) {
                if (entity.attributes[idx].id == attrId) {
                    return entity.attributes[idx];
                }
            }
        }

        let res: MetaEntityAttr;
        if (entity.subEntities) {
            let subEntityCount = entity.subEntities.length;
            for (idx = 0; idx < subEntityCount; idx++) {
                res = this.getEntityAttrById(entity.subEntities[idx], attrId);
                if (res) return res;
            }
        }
        return null
    }

    private listByEntityWithFilter(entity: MetaEntity, 
        filterFunc: (ent: MetaEntity, attr: MetaEntityAttr) => boolean): MetaEntity[] {
            
        let result = new Array<MetaEntity>();

        let caption;

        let ent = null;
        if (entity.subEntities) {
            let subEntityCount = entity.subEntities.length;
            for (let entIdx = 0; entIdx < subEntityCount; entIdx++) {
                ent = entity.subEntities[entIdx];

                if (!filterFunc || filterFunc(ent, null)) {

                    caption = i18n.getText('Entities', ent.name);
                    if (!caption) {
                        caption = ent.caption;
                    }
                    let newEnt = utils.assign(this.createEntity(), { id: ent.name, text: caption, items: [], isEntity: true });
                    newEnt.items = this.listByEntityWithFilter(ent, filterFunc);
                    if (newEnt.items.length > 0)
                        result.push(newEnt);
                }
            }
        }

        let attr = null;
        if (entity.attributes) {
            let attrCount = entity.attributes.length;
            for (let attrIdx = 0; attrIdx < attrCount; attrIdx++) {
                attr = entity.attributes[attrIdx];
                if (!filterFunc || filterFunc(entity, attr)) {
                    caption = i18n.getText('Attributes', attr.id);
                    if (!caption)
                        caption = attr.caption;

                    let newEnt = utils.assign(this.createEntity(), { id: attr.id, text: caption, dataType: attr.dataType });
                    result.push(newEnt);
                }
            }
        }

        return result;
    }

    private listByEntity(entity: MetaEntity, opts, 
        filterFunc: (ent: MetaEntity, attr: MetaEntityAttr) => boolean) {
        opts = opts || {};
        let resultEntities = [];
        let resultAttributes = [];

        let caption: string;

        let ent: MetaEntity = null;
        if (entity.subEntities) {
            let subEntityCount = entity.subEntities.length;
            for (let entIdx = 0; entIdx < subEntityCount; entIdx++) {
                ent = entity.subEntities[entIdx];

                if (!filterFunc || filterFunc(ent, null)) {
                    caption = i18n.getText('Entities', ent.name) || ent.caption;
                        let newEnt = utils.assign(this.createEntity(), { 
                            id: ent.name, 
                            text: caption, 
                            items: [], 
                            isEntity: true, 
                            description: ent.description 
                        });
                        let newOpts = utils.assign({}, opts);
                        newOpts.includeRootData = false;
                        newEnt.items = this.listByEntity(ent, newOpts, filterFunc);
                        if (newEnt.items.length > 0) {
                            resultEntities.push(newEnt);
                        }
                }
            }
        }

        let attr:MetaEntityAttr = null;
        if (entity.attributes) {
            let attrCount = entity.attributes.length;
            for (let attrIdx = 0; attrIdx < attrCount; attrIdx++) {
                attr = entity.attributes[attrIdx];
                if (!filterFunc || filterFunc(entity, attr)) {
                    caption = i18n.getText('Attributes', attr.id) || attr.caption;
                        resultAttributes.push(utils.assign(this.createEntityAttr(entity), 
                        { 
                            id: attr.id, text: caption, 
                            dataType: attr.dataType, lookupAttr: attr.lookupAttr, 
                            description: attr.description 
                        }));
                }
            }
        }

        let sortCheck = (a, b): number => {
            if (a.text.toLowerCase() == b.text.toLowerCase()) { return 0; }
            if (a.text.toLowerCase() > b.text.toLowerCase()) {
                return 1;
            }
            return -1;
        }

        if (opts.sortEntities) {
            resultEntities.sort(sortCheck);
            resultAttributes.sort(sortCheck);
        }

        let result;
        if (!opts.attrPlacement || opts.attrPlacement == 0) {
            result = resultEntities.concat(resultAttributes);
        }
        else {
            result = resultAttributes.concat(resultEntities);
        }

        if (opts.attrPlacement == 2) {
            result.sort(sortCheck);
        }

        if (opts.includeRootData) {
            caption = i18n.getText('Entities', entity.name);
            if (!caption)
                caption = entity.caption;

            return { id: entity.name, text: caption, items: result };
        }
        else {
            return result;
        }
    }

    /**
     * Clears data model.
     */
    public clear() {
        this.rootEntity = this.createEntity();
        this.editors = [];
        this.version = '';
    }

    /**
     * Add default value editors.
     */
    public addDefaultValueEditors() {
        let ve: MetaValueEditor;

        ve = this.addOrUpdateValueEditor('_DTE', EditorTag.Edit, DataType.String);
        ve.defValue = '';

        this.addOrUpdateValueEditor('_DPDE', EditorTag.DateTime, DataType.DateTime);
        this.addOrUpdateValueEditor('_DPTE', EditorTag.DateTime, DataType.DateTime);
    }

     /**
     * Add or update a value editor.
     * @param id The id.
     * @param tag The tag.
     * @param resType The result type.
     * @returns The value editor.
     */
    public addOrUpdateValueEditor(id: string, tag: EditorTag, resType: DataType): MetaValueEditor {
        let ve = utils.findItemById(this.editors, id);
        if (!ve) {
            ve = this.createValueEditor();
            ve.id = id;
            this.editors.push(ve);
        }

        ve.tag = tag;
        ve.resType = resType;

        return ve;
    }

    /**
     * Gets entities tree.
     * @param opts The options.
     * @param filterFunc The filter function. 
     * Takes two parameters, Entity and EntityAttr (second parameter will be null for entities), and returns boolean (true if the corresponding entity or attribute).
     * @returns The tree of the entities and their attributes according to options and the filter function
     */
    public getEntitiesTree(opts, filterFunc?: (ent: MetaEntity, attr: MetaEntityAttr) => boolean) {
        return this.listByEntity(this.getRootEntity(), opts, filterFunc);
    }

    /**
     * Gets entities tree due to filter.
     * @param filterFunc The filter function. 
     * Takes two parameters, Entity and EntityAttr (second parameter will be null for entities), and returns boolean (true if the corresponding entity or attribute).
     * @returns The tree of the entities and their attributes according to the filter function
     */
    public getEntitiesTreeWithFilter(filterFunc: (ent: MetaEntity, attr: MetaEntityAttr) => boolean) {
        return this.listByEntityWithFilter(this.getRootEntity(), filterFunc);
    }

    /**
     * Finds full entity path by attribute
     * @param attrId The attribute id.
     * @param sep The separator.
     * @returns The path.
     */
    public getFullEntityPathByAttr(attrId: string, sep: string) : string {
        sep = sep || ' ';
        return this.getEntityPathByAttr(this.getRootEntity(), attrId, sep, true);
    }

     /**
     * Finds entity path by attribute
     * @param entity The entity.
     * @param attrId The attribute id.
     * @param sep The separator.
     * @param root The root option.
     * @returns The path.
     */
    public getEntityPathByAttr(entity: MetaEntity, attrId: string, sep: string, root: boolean): string {
        if(!entity) return '';
        sep = sep || ' ';

        let entityCaption = '';
        if(entity.caption && !root) {
            let entityText = i18n.getText('Entities', entity.caption);
            entityCaption = entityText ? entityText : entity.caption;
        }

        if(entity.attributes) {
            let attrCount = entity.attributes.length;
            for (let i = 0; i < attrCount; i++) {
                if (entity.attributes[i].id == attrId) {
                    return entityCaption;
                }
            }
        }

        if(entity.subEntities) {
            let subEntityCount = entity.subEntities.length;
            for (let i = 0; i < subEntityCount; i++) {
                let ent = entity.subEntities[i];
                let res = this.getEntityPathByAttr(ent, attrId, sep, false);
                if (res !== '') {
                    if (entityCaption !== '')
                        res = entityCaption + sep + res;
                    return res;
                }
            }
        }

        return '';
    }

    /**
     * Gets the attribute text.
     * @param attr The attribute.
     * @param format The format.
     * @returns Formatted text.
     */
    public getAttributeText(attr: MetaEntityAttr, format: string): string {

        let attrText = i18n.getText('Attributes', attr.id);
        if (!attrText) {
            attrText = attr.caption;
        }

        if (!format) {
            return attrText;
        } 

        let result = '';
        let entityPath = this.getFullEntityPathByAttr(attr.id, ' ');

        if(entityPath) {
            result = format.replace(new RegExp('{attr}', 'g'), attrText);
            result = result.replace(new RegExp('{entity}', 'g'), entityPath);
        }
        else {
            result = attrText;
        } 
        
        return result.trim();
    }

    /**
     * Scans model's entity tree and calls the callback functions for each attribute and entity.
     * @param processAttribute The callback function which is called for each attribute in model's entity tree.
     * The processed attribute is passed in the first function parameter.
     * @param processEntity The callback function which is called for each entity in tree.
     * The processed entity is passed in the first function parameter.
     */
    public runThroughEntities(
        processAttribute?: (attr: MetaEntityAttr, opts: any) => void , 
        processEntity?: (entity: MetaEntity, opts: any) => void) {
        this.getRootEntity().scan(processAttribute, processEntity);
    }

    /**
     * Finds first attribute by filter.
     * @param filterFunc The filter function. Takes EntityAttr object in parameter and returns boolean
     */
    public getFirstAttributeByFilter(filterFunc: (attr: MetaEntityAttr) => boolean): MetaEntityAttr {
        let res = null;
        this.runThroughEntities(function (attr, opts) {
            if (filterFunc(attr)) {
                opts.stop = true;
                res = attr;
            }
        }, null);
        return res;
    }
}