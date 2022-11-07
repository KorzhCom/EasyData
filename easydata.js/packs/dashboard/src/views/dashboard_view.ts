import { DataRow, i18n, utils as dataUtils, EasyDataTable } from '@easydata/core';
import { 
    DefaultDialogService, 
    DialogService, domel, EasyGrid, 
    GridCellRenderer, GridColumn, RowClickEvent 
} from '@easydata/ui';
import { DashboardViewOptions } from './dashboard_view_options'
import { getContainer } from  '../utils/container'
import { EasyDataToolbar } from './toolbar_view'
import { componentsObserver } from '../utils/observer'
import { data1 } from '../assets/data/data1'
import { Layout1 } from '../assets/data/layout1'
import {defaultToolbarLayout} from "../assets/data/toolbar";
import {Registry} from "../utils/registry";
import {EasyDatagrid} from "../widgets/datagrid";
import {EasyChart} from "../widgets/chart";

const TBID = 'EasyDataToolbarContainer'
const REGISTRY = new Registry(globalThis.registry = {})

REGISTRY.register('DataGrid', EasyDatagrid)
REGISTRY.register('Chart', EasyChart)

export class EasyDashboardView {

    private dlg: DialogService;

    private container : HTMLElement;

    private options: DashboardViewOptions = {
        container: '#EasyDashboardContainer'
    };


    constructor (options?: DashboardViewOptions) 
    {
        this.options = dataUtils.assignDeep(this.options, options || {});
        this.container = getContainer(this.options.container);

        this.dlg = new DefaultDialogService();
       
        this.render();

        componentsObserver(this.container)
    }

    private render() {
        const dashboard = domel('div')
            .addClass("dashboard")
            .toDOM();

        this.container.appendChild(dashboard);


        const dashboardGrid = domel("div")
            .addClass("dashboard-grid")
            .toDOM()

        dashboard.appendChild(dashboardGrid)

        const dashboardGridRow = domel("div")
            .addClass("dashboard-grid__row")
            .toDOM()

        dashboardGrid.appendChild(dashboardGridRow)

        for(let widget of Layout1.widgets) {
            console.log(widget)

            const wrapper = domel("div")
                .addClass(`dashboard-grid__cell ${widget.size}`)
                .toDOM()

            dashboardGridRow.appendChild(wrapper)

            new (REGISTRY.getClass(widget.class))(wrapper, widget.options)
        }

   }
}