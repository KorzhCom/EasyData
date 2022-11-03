import {EasyDataWidget, EasyDataWidgetOptions} from "../utils/widget"

export class Datagrid extends EasyDataWidget {
    constructor(elem: HTMLElement, options: EasyDataWidgetOptions) {
        super(elem, "EasyDataGrid", options);
    }
}