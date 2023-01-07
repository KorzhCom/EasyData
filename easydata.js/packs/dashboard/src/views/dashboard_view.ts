import { DataRow, i18n, utils as dataUtils } from '@easydata/core';

import { 
    DefaultDialogService, 
    DialogService, domel, EasyGrid, 
    GridCellRenderer, GridColumn, RowClickEvent 
} from '@easydata/ui';


import { DashboardViewOptions } from './dashboard_view_options'

export class EasyDashboardView {

    private dlg: DialogService;

    private container : HTMLElement;

    private options: DashboardViewOptions = {
        container: '#EasyDashboardContainer'
    };


    constructor (options?: DashboardViewOptions) 
    {
        this.options = dataUtils.assignDeep(this.options, options || {});
        this.setContainer(this.options.container);

        this.dlg = new DefaultDialogService();
       
        this.render();
    }

    ///TODO: Move this to UI utils
    private setContainer(container: HTMLElement | string) {
        if (!container) {
            throw 'Container is undefined';
        }

        if (typeof container === 'string') {
            if (container.length){
                if (container[0] === '.') {
                    const result = document.getElementsByClassName(container.substring(1));
                    if (result.length) 
                        this.container = result[0] as HTMLElement;
                }
                else {
                    if (container[0] === '#') {
                        container = container.substring(1);
                    }
                    this.container = document.getElementById(container);
                }
                if (!this.container) {
                    throw Error('Unrecognized `container` parameter: ' + container + '\n'  
                        + 'It must be an element ID, a class name (starting with .) or an HTMLElement object itself.');
                }
            }
        }
        else {
            this.container = container;
        }
    }

    private render() {
        const dashboardStub = domel('div')
            .setStyle('color', 'red')
            .setStyle('font-size', '36px')
            .addText('Hello world! Dashboard will be here!')
            .toDOM();

        this.container.appendChild(dashboardStub);
   }
}