import { MetaEditorTag } from '../types/meta_editor_tag';
import { DataType } from '../types/data_type';
import { MetaValueEditorDTO } from './dto/meta_value_editor_dto';

/**
 * Represents a value editor.
 */
export class MetaValueEditor {

    /** The ID. */
    public id: string;

    /** The tag. */
    public tag: MetaEditorTag;

    /**
     * The type of the result.
     */
    public resType: DataType;

    /**
     * The default value of the editor.
     */
    public defValue: string;

    /**
     * The name of the value editor.
     */
    public name?: string;

    /**
     * The statement.
     */
    public statement?: string;

      /**
     * The values.
     */
    public values?: {id: string, text: string}[];

    /** Extra parameters */
    public extraParams?: any;

    public processValues?: (values: any[]) => any;

    /** The default constructor. */
    constructor() {
        this.id = "";
        this.tag = MetaEditorTag.Unknown;
        this.resType = DataType.Unknown;
        this.defValue = "";
    }

    /**
     * Loads value editor from its JSON representation object.
     * @param data The JSON representation object.
     */
    public loadFromData(data: MetaValueEditorDTO) {
        if (data) {
            this.id = data.id;
            this.tag = data.tag;
            this.defValue = data.defval;
            this.resType = data.rtype;
            if (data.subType) {
                this.resType = data.subType;
            }
            if (data.name) {
                this.name = data.name;     
            } 
            if (data.values){
                this.values = data.values;
            }
        }
    }

    public getValueText(value: string | string[]): string {

        let result = "";
        
        if (!this.values)
            return result;

        if (Array.isArray(value)) {
            for(let item of this.values) {
                if (value.indexOf(item.id) >= 0) {
                    result += item.text + ',';
                }
            }
        } else {
            for(let item of this.values) {
                if (item.id === value) {
                    result += item.text + ',';
                }
            }
        }

        if (result) {
            result = result.substring(0, result.length - 1);
        }

        return result;
    }
}
