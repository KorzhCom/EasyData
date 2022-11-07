import {EasyDataWidget, EasyDataWidgetOptions} from "../utils/widget";

export class EasyChart extends EasyDataWidget {
    constructor(elem: HTMLElement, options: EasyDataWidgetOptions) {
        super(elem, "EasyDataChart", options);
    }
}