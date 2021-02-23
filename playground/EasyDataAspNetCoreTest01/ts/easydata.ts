import { EasyDataViewDispatcher } from '@easydata/crud';

window.addEventListener('load', () => {
    new EasyDataViewDispatcher({
        // rootEntity: 'Customer'
    }).run()
});