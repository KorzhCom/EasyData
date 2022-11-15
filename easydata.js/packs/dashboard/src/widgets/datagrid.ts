import {EasyDataWidget, TWidget} from "../utils/widget"
import {EasyDataTable, utils} from "@easydata/core";
import {EasyGrid} from "@easydata/ui";

export class EasyDatagrid extends EasyDataWidget {
    constructor(elem: HTMLElement, widget: TWidget) {
        super(elem, "EasyDataGrid", widget.options);
        const dataTable = new EasyDataTable({
            inMemory: true,
            columns: widget.dataset.resultSet.cols,
            rows: widget.dataset.resultSet.rows
        });

        const gridOptions = {}
        new EasyGrid(utils.assignDeep({
            slot: elem,
            dataTable,
            paging: {
                allowPageSizeChange: true,
            },
        }, gridOptions || {}))
    }
}

