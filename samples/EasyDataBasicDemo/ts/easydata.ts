import { EasyDataViewDispatcher } from './views/easy_data_view_dispatcher';

window.addEventListener('load', () => {
    const slot = document.getElementById('EasyData');
    new EasyDataViewDispatcher(slot).run()
});