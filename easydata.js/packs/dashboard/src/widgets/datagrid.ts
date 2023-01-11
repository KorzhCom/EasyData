import {EasyDataWidget, TDataSet, WidgetOptions} from "../utils/widget"
import {EasyDataTable, utils} from "@easydata/core";
import {EasyGrid} from "@easydata/ui";

export class EasyDatagrid extends EasyDataWidget {
    private dataset: TDataSet

    constructor(elem: HTMLElement, widget: WidgetOptions) {
        super(elem, "EasyDataGrid", widget.options)
        this.dataset = widget.dataset

        const dataTable = new EasyDataTable({
            inMemory: true,
            columns: this.dataset.resultSet.cols,
            rows: this.dataset.resultSet.rows
        });

        // TODO Add grid options?
        new EasyGrid(utils.assignDeep({
            slot: elem,
            dataTable,
            paging: {
                allowPageSizeChange: true,
            },
        }, this.options || {}))
    }
}

