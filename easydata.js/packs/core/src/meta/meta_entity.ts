import { DataType } from '../types/data_type';
import { EntityAttrKind } from '../types/entity_attr_kind';
import { MetaEntityDTO, MetaEntityAttrDTO } from './dto/meta_entity_dto';
import { MetaData } from './meta_data';
import { ValueEditor } from './value_editor';

import { utils } from '../utils/utils'

/**
 * Represents one entity.
 */
export class MetaEntity {

    /**
     * The parent.
     */
    public parent: MetaEntity;

    /** The id. */
    public id: string;

    /** The name of entity. */
    public name: string;

    /** The caption of entity attr. */
    public caption: string;

    /** The caption of entity attr in plural form. */
    public captionPlural: string;
    
    /** The description of entity. */
    public description: string;

    /**
     * List of Attributes that belong to this entity.
     */
    public attributes: MetaEntityAttr[];

    /**
     * List of sub entities that belong to this entity.
     */
    public subEntities: MetaEntity[];

    /** The default constructor. */
    constructor(parent?: MetaEntity) {
        this.name = "";
        this.caption = "";
        this.description = "";
        this.parent = parent;
        this.attributes = new Array<MetaEntityAttr>();
        this.subEntities = new Array<MetaEntity>();
    }


     /**
     * Loads entity from its JSON representation object.
     * @param model The Data Model.
     * @param dto The JSON representation object.
     */
    public loadFromData(model: MetaData, dto: MetaEntityDTO) {

        if (dto) {
            this.id = dto.id;
            this.name = dto.name;
            this.captionPlural = dto.namePlur;
            this.caption = dto.name;
            this.description = dto.desc;
            
            this.subEntities = new Array<MetaEntity>();
            if (dto.ents) {
                for (let i = 0; i < dto.ents.length; i++) {
                    let newEntity = model.createEntity(this);
                    newEntity.loadFromData(model, dto.ents[i]);
                    this.subEntities.push(newEntity);
                }
            }

            this.attributes = new Array<MetaEntityAttr>();
            if (dto.attrs) {
                for (let i = 0; i < dto.attrs.length; i++) {
                    let newAttr = model.createEntityAttr(this);
                    newAttr.loadFromData(model, dto.attrs[i]);
                    this.attributes.push(newAttr);
                }
            }
        }        
    }

    public scan(processAttribute?: (attr: MetaEntityAttr, opts: any) => void , processEntity?: (entity: MetaEntity, opts: any) => void): void {
        let opts = { stop: false };
        let internalProcessEntity = (entity: MetaEntity) => {
            if (processEntity)
                processEntity(entity, opts);

            if (entity.attributes) {
                let attrCount = entity.attributes.length;
                for (let i = 0; (i < attrCount) && !opts.stop; i++) {
                    let attr = entity.attributes[i];
                    if (processAttribute) {
                        processAttribute(attr, opts);
                    }
                    if (opts.stop) return;
                }
            }

            if (entity.subEntities) {
                let subEntityCount = entity.subEntities.length;
                for (let i = 0; (i < subEntityCount) && !opts.stop; i++) {
                    internalProcessEntity(entity.subEntities[i]);
                }
            }
        };

        internalProcessEntity(this);
    }
}

export class MetaEntityAttr {
    /** The id. */
    public id: string;

    /** The lookupAttr. */
    public lookupAttr: string;

    public dataAttr: string;

    public lookupEntity: string;

    public lookupDataAttr: string;

    /** The caption. */
    public caption: string;

    /** The caption in plural form. */
    public captionPlural: string;

    /** The description. */
    public description: string;

    /* The data type */
    public dataType: DataType;

    /* The size of data represented by attribute. */
    public size: number;

    /**
     * The value indicating wether the attribute is a primary key.
     */
    public isPrimaryKey: boolean;

    /**
     * The value indicating wether the attribute is a primary key.
     */
    public isForeignKey: boolean;

    /**
     * The value indicating wether the attribute is editable.
     */
    public isEditable: boolean;

    /**
     * The value indicating wether the attribute is shown on view page.
     */
    public showOnView: boolean;

    /**
     * The value indicating wether the attribute is shown add page.
     */
    public showOnAdd: boolean;

    /**
    * The value indicating wether the attribute is shown edit page.
    */
    public showOnEdit: boolean;

    /**
     * The value indicating wether the attribute can be null key.
     */
    public isNullable: boolean;

    /**
     * The value indicating wether the attribute is shown in Lookup Editor.
     */
    public showInLookup: boolean;

    /**
     * The attribute expression.
     */
    public expr: string;

    /** The kind. */
    public kind: EntityAttrKind;

    /**
     * The default editor.
     */
    public defaultEditor: ValueEditor;

    /**
     * The parent
     */
    public entity: MetaEntity;

    /**
     * User data
     */
    public userData?: string;

    /** The default constructor. */
    constructor(entity: MetaEntity) {
        this.id = "";
        this.caption = "{Unrecognized attribute}";
        this.dataType = DataType.String;
        this.size = 0
        this.isPrimaryKey = false;
        this.isForeignKey = false;
        this.isNullable = true;
        this.showOnView = true;
        this.isEditable = true;
        this.showOnAdd = true;
        this.showOnEdit = true;
        this.showInLookup = false;
        this.lookupAttr = "";
        this.expr = "";
        this.entity = entity;
        this.kind = EntityAttrKind.Data;
    }

    /**
     * Loads entity attribute from JSON representation object.
     * @param model The Data Model.
     * @param dto The JSON representation object.
     */
    public loadFromData(model: MetaData, dto: MetaEntityAttrDTO) {

        if (dto) {
            this.id = dto.id;
            this.description = dto.desc;
            this.caption = dto.cptn;
            this.dataType = dto.dtype;
            this.isPrimaryKey = dto.ipk;
            this.isForeignKey = dto.ifk;
            this.size = dto.size;

            this.lookupAttr = dto.lattr;
            this.lookupEntity = dto.lent;
            this.dataAttr = dto.dattr;
            this.lookupDataAttr = dto.ldattr;

            this.isNullable = utils.getIfDefined(dto.nul, this.isNullable);
            this.isEditable = utils.getIfDefined(dto.ied, this.isEditable);
            this.showOnView = utils.getIfDefined(dto.ivis || dto.sov, this.showOnView);
            this.showOnAdd = utils.getIfDefined(dto.soa, this.showOnAdd);
            this.showOnEdit = utils.getIfDefined(dto.soe, this.showOnEdit);
            this.showInLookup = utils.getIfDefined(dto.sil, this.showInLookup);

            this.kind = dto.kind;

            if (dto.udata)
                this.userData = dto.udata;

            if (dto.edtr) {
                this.defaultEditor = model.getEditorById(dto.edtr) || model.createValueEditor();
            }
          
        }
    }
}