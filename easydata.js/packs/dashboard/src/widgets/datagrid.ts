import {EasyDataWidget, EasyDataWidgetOptions} from "../utils/widget"
import {EasyDataTable, utils} from "@easydata/core";
import {EasyGrid} from "@easydata/ui";

export class EasyDatagrid extends EasyDataWidget {
    constructor(elem: HTMLElement, options: EasyDataWidgetOptions) {
        super(elem, "EasyDataGrid", options);
        console.log(elem)
        const dataset = options.dataset
        const dataTable = new EasyDataTable({
            inMemory: true,
            columns: dataset.resultSet.cols,
            rows: dataset.resultSet.rows
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

