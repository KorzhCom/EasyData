import { i18n } from '@easydata/core';


function addEasyDataUITexts() {
    i18n.updateDefaultTexts({
        GridPageInfo: '{FirstPageRecordNum} - {LastPageRecordNum} of {Total} records',
        GridItemsPerPage: 'items per page',
        ButtonOK: "OK",
        ButtonCancel: "Cancel",
        ButtonApply: 'Apply',
        ButtonNow: 'Now',
        LblTotal: 'Total'
    });
}

addEasyDataUITexts();