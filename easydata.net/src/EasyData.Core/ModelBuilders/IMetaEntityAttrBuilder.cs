namespace EasyData
{
    public interface IMetaEntityAttrBuilder
    {
        IMetaEntityAttrBuilder SetDescription(string description);
        IMetaEntityAttrBuilder SetDisplayFormat(string displayFormat);
        IMetaEntityAttrBuilder SetDisplayName(string displayName);
        IMetaEntityAttrBuilder SetEditable(bool editable);
        IMetaEntityAttrBuilder SetEnabled(bool enabled);
        IMetaEntityAttrBuilder SetIndex(int index);
        IMetaEntityAttrBuilder SetShowInLookup(bool showInLookup);
        IMetaEntityAttrBuilder SetShowOnCreate(bool showOnCreate);
        IMetaEntityAttrBuilder SetShowOnEdit(bool showOnEdit);
        IMetaEntityAttrBuilder SetShowOnView(bool showOnView);
        IMetaEntityAttrBuilder SetSorting(int sorting);
    }
}