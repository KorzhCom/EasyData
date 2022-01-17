using System;

namespace EasyData.EntityFrameworkCore
{
    /// <summary>
    /// Builder for entity attribute metadata.
    /// </summary>
    public class MetaEntityAttrCustomizer : IMetaEntityAttrCustomizer
    {

        public MetaEntityAttr Attribute { get; private set; }

        /// <summary>
        /// Initialize entity attribute builder.
        /// </summary>
        public MetaEntityAttrCustomizer(MetaEntityAttr attr)
        {
            Attribute = attr;
        }


        /// <summary>
        /// Set attribute display name.
        /// </summary>
        /// <param name="displayName">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrCustomizer SetDisplayName(string displayName)
        {
            Attribute.Caption = displayName;
            return this;
        }

        /// <summary>
        /// Set attribute display format.
        /// </summary>
        /// <param name="displayFormat">Display format to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrCustomizer SetDisplayFormat(string displayFormat)
        {
            Attribute.DisplayFormat = displayFormat;
            return this;
        }

        /// <summary>
        /// Set attribute description.
        /// </summary>
        /// <param name="description">Description to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrCustomizer SetDescription(string description)
        {
            Attribute.Description = description;
            return this;
        }

        /// <summary>
        /// Set whether the attribute is editable or not.
        /// </summary>
        /// <param name="editable">Editable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrCustomizer SetEditable(bool editable)
        {
            Attribute.IsEditable = editable;
            return this;
        }

        /// <summary>
        /// Set the index of the attribute.
        /// </summary>
        /// <param name="index">Index to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrCustomizer SetIndex(int index)
        {
            Attribute.Index = index;
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown in LookUp editor.
        /// </summary>
        /// <param name="showInLookup">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrCustomizer SetShowInLookup(bool showInLookup)
        {
            Attribute.ShowInLookup = showInLookup;
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown on view.
        /// </summary>
        /// <param name="showOnView">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrCustomizer SetShowOnView(bool showOnView)
        {
            Attribute.ShowOnView = showOnView;
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown on edit.
        /// </summary>
        /// <param name="showOnEdit">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrCustomizer SetShowOnEdit(bool showOnEdit)
        {
            Attribute.ShowOnEdit = showOnEdit;
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown on create.
        /// </summary>
        /// <param name="showOnCreate">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrCustomizer SetShowOnCreate(bool showOnCreate)
        {
            Attribute.ShowOnCreate = showOnCreate;
            return this;
        }

        /// <summary>
        /// Set the default sorting.
        /// </summary>
        /// <param name="sorting">Sorting to set.</param>
        /// <returns></returns>
        public IMetaEntityAttrCustomizer SetSorting(int sorting)
        {
            Attribute.Sorting = sorting;
            return this;
        }

        /// <summary>
        /// Set the data type
        /// </summary>
        /// <param name="dataType"></param>
        /// <returns></returns>
        public IMetaEntityAttrCustomizer SetDataType(DataType dataType)
        {
            Attribute.DataType = dataType;
            return this;
        }
    }
}
