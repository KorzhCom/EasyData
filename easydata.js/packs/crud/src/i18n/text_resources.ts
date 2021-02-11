import { i18n } from '@easydata/core';


function addEasyDataCRUDTexts() {
    i18n.updateDefaultTexts({
        RequiredError: 'Value is required.',
        NumberError: 'Value should be a number',
        IntNumberError: 'Value should be an integer number',
        LookupSelectedItem: 'Selected item: ',
        LookupDlgCaption: 'Select {entity}',
        None: 'None',
        NavigationBtnTitle: 'Navigation values',
        AddBtnTitle: 'Add',
        EditBtn: 'Edit',
        DeleteBtn: 'Delete',
        AddDlgCaption: 'Create {entity}',
        EditDlgCaption: 'Edit {entity}',
        DeleteDlgCaption: 'Delete {entity}',
        DeleteDlgMessage: 'Are you shure about removing this entity: [{entityId}]?',
        EntityMenuDesc: 'Click on an entity to view/edit its content',
        BackToEntities: 'Back to entities',
        SearchBtn: 'Search',
        SearchInputPlaceholder: 'Search...',
        RootViewTitle: 'Entities',
        ModelIsEmpty: 'No entity was found.'
    });
}

addEasyDataCRUDTexts();