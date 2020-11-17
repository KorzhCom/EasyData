import { i18n } from '@easydata/core';


function addEasyDataUITexts() {
    i18n.updateLocaleTexts({
        GridPageInfo: '{FirstPageRecordNum} - {LastPageRecordNum} of {Total} records',
        ButtonApply: 'Apply',
        ButtonNow: 'Now'
    });
}

addEasyDataUITexts();