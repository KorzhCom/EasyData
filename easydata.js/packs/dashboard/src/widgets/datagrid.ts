import {EasyDataWidget, TDataSet, TWidget} from "../utils/widget"
import {EasyDataTable, utils} from "@easydata/core";
import {EasyGrid} from "@easydata/ui";

export class EasyDatagrid extends EasyDataWidget {
    private dataset: TDataSet

    constructor(elem: HTMLElement, widget: TWidget) {
        super(elem, "EasyDataGrid", widget.options)
        this.dataset = widget.dataset

        const dataTable = new EasyDataTable({
            inMemory: true,
            columns: this.dataset.resultSet.cols,
            rows: this.dataset.resultSet.rows
        });

        new EasyGrid(utils.assignDeep({
            slot: elem,
            dataTable,
            paging: {
                allowPageSizeChange: true,
            },
        }, this.options || {}))
    }
}

