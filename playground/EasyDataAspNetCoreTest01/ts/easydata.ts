import { EasyDataViewDispatcher } from '@easydata/crud';

window.addEventListener('load', () => {
    new EasyDataViewDispatcher({
        endpoint: "/api/easy-crud"
        // rootEntity: 'Customer'
    }).run()
});