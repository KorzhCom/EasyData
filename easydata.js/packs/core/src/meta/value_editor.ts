import { EditorTag } from '../types/editor_tag';
import { DataType } from '../types/data_type';
import { ValueEditorDTO } from './dto/value_editor_dto';

/**
 * Represents a value editor.
 */
export class ValueEditor {

    /** The ID. */
    public id: string;

    /** The tag. */
    public tag: EditorTag;

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
     * The accept
     */
    public accept?: string;

    /**
     * The accept
     */
    public multiline?: boolean;

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
        this.tag = EditorTag.Unknown;
        this.resType = DataType.Unknown;
        this.defValue = "";
    }

    /**
     * Loads value editor from its JSON representation object.
     * @param data The JSON representation object.
     */
    public loadFromData(data: ValueEditorDTO) {
        if (data) {
            this.id = data.id;
            this.tag = data.tag;
            this.defValue = data.defval;
            this.resType = data.rtype;
            this.accept = data.accept;
            this.multiline = data.multiline;
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
