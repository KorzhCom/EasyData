import {panic} from "../utils/panic";
import {EasyDataWidget, WidgetOptions} from "../utils/widget";
import {domel} from "@easydata/ui";
import ADAPTER_REGISTRY from "./adapter_registry"
export class EasyChart extends EasyDataWidget {
    constructor(elem: HTMLElement, widget: WidgetOptions) {
        super(elem, "EasyChart", widget.options);

        if (!Array.isArray(widget.dataset)) {
            widget.dataset = [widget.dataset]
        }
        
        const datasets = []
        let axisX = [], axisY = [], axisZ = []
        
        for(let i = 0; i < widget.dataset.length; i++) {
            if (!widget.dataset[i].resultSet) continue

            const ds = widget.dataset[i].resultSet.rows

            axisX = []; axisY = []; axisZ = [];

            for(let r of ds) {
                axisX.push(r[widget.axis.x])
                axisY.push(r[widget.axis.y])
                axisZ.push(r[widget.axis.z])
            }

            datasets.push({axisX, axisY, axisZ})
        }

        const _class = ADAPTER_REGISTRY.getClass(widget.lib.toLowerCase())

        if (!_class.checkLib()) {
            panic(`Required library not found!`)
        }
        
        const _ctx = _class.createContext()
        _class.createChart(_ctx.ctx, datasets, widget)
        elem.appendChild(_ctx.elem)
    }
}