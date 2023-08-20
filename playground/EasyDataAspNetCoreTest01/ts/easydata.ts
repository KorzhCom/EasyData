import { EasyDataViewDispatcher } from '@easydata/crud';
import { showTimeSpanPicker } from '@easydata/ui' 

window.addEventListener('load', () => {
    console.log(showTimeSpanPicker)
});

globalThis.showPicker = () => {
    alert('showTimeSpanPicker');
}