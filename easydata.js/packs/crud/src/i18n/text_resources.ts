import { i18n } from '@easydata/core';


function addEasyDataCRUDTexts() {
    i18n.updateDefaultTexts({
        RequiredError: 'Value is required.',
        NumberError: 'Value should be a number',
        IntNumberError: 'Value should be an integer number',
        DateTimeError: 'Invalid date or time value',
        LookupSelectedItem: 'Selected item: ',
        LookupDlgCaption: 'Select {entity}',
        None: 'None',
        NavigationBtnTitle: 'Navigation values',
        CalendarBtnTitle: 'Open calendar',
        TimerBtnTitle: 'Open timer',
        AddBtnTitle: 'Add',
        AddRecordBtnTitle: 'Add record',
        EditBtn: 'Edit',
        DeleteBtn: 'Delete',
        SelectLink: '[ select ]',
        AddDlgCaption: 'Create {entity}',
        EditDlgCaption: 'Edit {entity}',
        DeleteDlgCaption: 'Delete {entity}',
        DeleteDlgMessage: 'Are you sure you want to remove this record: {{recordId}}?',
        EntityMenuDesc: 'Click on an entity to view/edit its content',
        BackToEntities: 'Back to entities',
        SearchBtn: 'Search',
        SearchInputPlaceholder: 'Search...',
        RootViewTitle: 'Entities',
        ModelIsEmpty: 'No entity was found.'
    });
}

addEasyDataCRUDTexts();