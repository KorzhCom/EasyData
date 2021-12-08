namespace EasyData.EntityFrameworkCore
{
    public interface IMetaEntityAttrCustomizer
    {
        IMetaEntityAttrCustomizer SetDescription(string description);
        IMetaEntityAttrCustomizer SetDisplayFormat(string displayFormat);
        IMetaEntityAttrCustomizer SetDisplayName(string displayName);
        IMetaEntityAttrCustomizer SetEditable(bool editable);
        IMetaEntityAttrCustomizer SetEnabled(bool enabled);
        IMetaEntityAttrCustomizer SetIndex(int index);
        IMetaEntityAttrCustomizer SetShowInLookup(bool showInLookup);
        IMetaEntityAttrCustomizer SetShowOnCreate(bool showOnCreate);
        IMetaEntityAttrCustomizer SetShowOnEdit(bool showOnEdit);
        IMetaEntityAttrCustomizer SetShowOnView(bool showOnView);
        IMetaEntityAttrCustomizer SetSorting(int sorting);
    }
}