import {EasyDataComponent, EasyDataComponentOptions} from "../utils/component"

export class Datagrid extends EasyDataComponent {
    constructor(elem: HTMLElement, options: EasyDataComponentOptions) {
        super(elem, "EasyDataGrid", options);
    }
}