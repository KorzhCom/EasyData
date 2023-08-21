import { EasyDataViewDispatcher } from '@easydata/crud';
import { showTimeSpanPicker } from '@easydata/ui' 

window.addEventListener('load', () => {
    console.log(showTimeSpanPicker)
});

globalThis.showPicker = () => {
    showTimeSpanPicker({
        title: "Select Period",
        submitButtonText: "Ok",
        cancelButtonText: "Cancel",
        onSubmit: ()=>{}
    });
}