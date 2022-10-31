import { DataRow, i18n, utils as dataUtils } from '@easydata/core';
import { 
    DefaultDialogService, 
    DialogService, domel, EasyGrid, 
    GridCellRenderer, GridColumn, RowClickEvent 
} from '@easydata/ui';
import { DashboardViewOptions } from './dashboard_view_options'
import {getContainer} from  "../utils/container"
import {EasyDataToolbar} from "./toolbar_view"
import {componentsObserver} from "../utils/observer"

const TBID = "EasyDataToolbarContainer"

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
            .toDOM();

        this.container.appendChild(dashboard);

        const toolbarContainer = domel('div')
            .addClass('toolbar')
            .id(TBID)
            .toDOM()

        dashboard.appendChild(toolbarContainer)

        new EasyDataToolbar({
            panels: [
                {
                    name: "Work",
                    buttons: [
                        {
                            caption: "Data Grid",
                            cls: "text-button"
                        },
                        {
                            caption: "Pie Chart",
                            cls: "text-button"
                        },
                        {
                            caption: "Bar Chart",
                            cls: "text-button"
                        }
                    ]
                }
            ]
        })
   }
}