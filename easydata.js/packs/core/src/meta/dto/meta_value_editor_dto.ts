import { MetaEditorTag } from '../../types/meta_editor_tag'
import { DataType } from '../../types/data_type'

/**
 * Value editor JSON representation object.
 */
export interface MetaValueEditorDTO {
    /** The id. */
    id: string;
    /** The tag. */
    tag: MetaEditorTag;
    /** The default value. */
    defval: string;
    /** The result type. */
    rtype: DataType;
    /** The sub type. */
    subType?: DataType;
    /** The name. */
    name?: string;
    /** values. */
    values?: {id: string, text: string}[];
}