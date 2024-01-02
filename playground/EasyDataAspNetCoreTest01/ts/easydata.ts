import '@easydata/core'
import { showTimeSpanPicker } from '@easydata/ui' 
import { EasyDataViewDispatcher, EasyDataViewDispatcherOptions } from '@easydata/crud';

window.addEventListener('load', () => {
    console.log(showTimeSpanPicker)
});

globalThis.showPicker = () => {
    showTimeSpanPicker({
        title: "Select Period",
        submitButtonText: "Ok",
        cancelButtonText: "Cancel",
        onSubmit: (start: Date, finish: Date)=> alert(`
            You select interval with\n
            Start: ${start}\n
            Finish: ${finish}
        `)
    });
}

globalThis.showPickerWithPreset = () => {
    showTimeSpanPicker({
        start: new Date(2023, 7, 11),
        finish: new Date(2023, 7, 21),
        onSubmit: (start: Date, finish: Date)=> alert(`
            You select interval with\n
            Start: ${start}\n
            Finish: ${finish}
        `)
    });
}


export function runDispatcher(options: EasyDataViewDispatcherOptions): void {
    new EasyDataViewDispatcher(options).run();
}

