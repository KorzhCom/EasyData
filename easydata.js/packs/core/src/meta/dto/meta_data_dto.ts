import { MetaEntityDTO } from "./meta_entity_dto";
import { MetaValueEditorDTO } from "./meta_value_editor_dto";

export interface MetaDataDTO {
    /** The id. */
    id: string;
    /** The name. */
    name: string;
    /** The caption. */
    vers: string;
    /** List of editors. */
    editors?: MetaValueEditorDTO[];
    /** Root entity. */
    entroot: MetaEntityDTO;
}