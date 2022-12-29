import { Layout1 } from './layout1'
import { Layout2 } from './layout2'
import { EasyDashboardView } from '@easydata/dashboard';

window.addEventListener('load', () => {
    //create and init EasyDashboardView here
    new EasyDashboardView({
        layout: Layout1
    });

});