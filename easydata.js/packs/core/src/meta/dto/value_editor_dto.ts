import { EditorTag } from '../../types/editor_tag'
import { DataType } from '../../types/data_type'

/**
 * Value editor JSON representation object.
 */
export interface ValueEditorDTO {
    /** The id. */
    id: string;
    /** The tag. */
    tag: EditorTag;
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
    /** The accept. */
    accept?: string;
    /** The multiline. */
    multiline?: boolean;
}