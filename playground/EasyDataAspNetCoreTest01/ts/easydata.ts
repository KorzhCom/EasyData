import { EasyDataViewDispatcher } from '@easydata/crud';

window.addEventListener('load', () => {
    new EasyDataViewDispatcher({
        basePath: 'crud',
        endpoint: '/api/easy-crud',
        //dataTable: {
        //    elasticChunks: true
        //}
        // rootEntity: 'Customer'
    }).run()
});