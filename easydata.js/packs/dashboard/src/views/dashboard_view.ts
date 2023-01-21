import { utils as dataUtils } from '@easydata/core';
import { DefaultDialogService, DialogService, domel} from '@easydata/ui';
import { DashboardViewOptions } from './dashboard_view_options'
import { getContainer } from  '../utils/container'
import { componentsObserver } from '../utils/observer'
import REGISTRY from "./class_registry"
export class EasyDashboardView {

    private dlg: DialogService;

    private container : HTMLElement;
    private layout : any;

    private options: DashboardViewOptions = {
        container: '#EasyDashboardContainer',
        layout: null
    };
    
    constructor (options?: DashboardViewOptions)
    {
        this.options = dataUtils.assignDeep(this.options, options || {});
        this.container = getContainer(this.options.container);
        this.layout = this.options.layout
        this.dlg = new DefaultDialogService();

        this.render();

        componentsObserver(this.container);
    }

    private createWrapper(cls, target){
        const wrapper = domel('div')
            .addClass(cls)
            .toDOM();

        if (target) target.appendChild(wrapper);

        return wrapper;
    }

    private render() {
        const dashboard = this.createWrapper("dashboard", this.container)
        const dashboardGrid = this.createWrapper("dashboard-grid", dashboard)
        const dashboardGridRow = this.createWrapper("dashboard-grid__row row", dashboardGrid)

        for(let widget of this.layout.widgets) {
            const cell = this.createWrapper(`dashboard-grid__cell ${widget.style}`, dashboardGridRow)
            const widgetTitle = this.createWrapper(`dashboard-grid__widget__title ${widget.titleClass || ''}`, cell)
            const widgetWrapper = this.createWrapper(`dashboard-grid__widget ${widget.widgetClass || ''}`, cell)
            const widgetFooter = this.createWrapper(`dashboard-grid__widget__footer ${widget.footerClass || ''}`, cell)

            if (widget.title) {
                widgetTitle.innerHTML = widget.title
            }

            if (widget.footer) {
                widgetFooter.innerHTML = widget.footer
            }

            if (widget.class) {
                new (REGISTRY.getClass(widget.class))(widgetWrapper, widget)
            }
        }
    }
}