import { EntityAttrKind } from '../../types/entity_attr_kind';
import { DataType } from '../../types/data_type';

/**
 * Entity JSON representation object.
 */
export interface MetaEntityDTO {
    /** The id. */
    id: string;
    /** The name. */
    name: string;
    /**
     * The name in plural form
     */
    namePlur?: string;
    /** The description. */
    desc?: string;
    /** List of sub-entities. */
    ents?: MetaEntityDTO[];
    /** List of attributes.*/
    attrs?: MetaEntityAttrDTO[];
}

/**
 * Entity attribute JSON representation object.
 */
export interface MetaEntityAttrDTO {
    /** The id. */
    id: string;
    /** The description. */
    desc?: string;
    /** The caption. */
    cptn: string;
    /** The data type. */
    dtype: DataType;
    /** Is primary key */
    ipk: boolean;
    /** Is primary key */
    ifk: boolean;
    /** The size of data. */
    size: number;

    /** Look Up attribute */
    lattr: string;
    /** User data */
    udata?: string;
    /** Value editor id */
    edtr?: string;

    kind: EntityAttrKind;
    lent?: string;
    dattr?: string;
    ldattr?: string;

    /** Is nullabel */
    nul?: boolean;

    /** Show in lookup */
    sil?: boolean;

    /** Is editable */
    ied?: boolean;

    /** Show On View */
    sov?: boolean;

    /** Show On Create */
    soc?: boolean;

    /** Show On Edit */
    soe?: boolean;

    /** Is visible */
    ivis?: boolean;

    /** Display format */
    dfmt?: string;
}