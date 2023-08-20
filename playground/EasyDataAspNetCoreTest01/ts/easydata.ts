import { EasyDataViewDispatcher } from '@easydata/crud';
import { showTimeSpanPicker } from '@easydata/ui' 

window.addEventListener('load', () => {
    console.log(showTimeSpanPicker)
    new EasyDataViewDispatcher({
        basePath: 'crud',
        endpoint: '/api/easy-crud',
        showFilterBox: true
        //dataTable: {
        //    elasticChunks: true
        //}
        // rootEntity: 'Customer'
    }).run()
});

