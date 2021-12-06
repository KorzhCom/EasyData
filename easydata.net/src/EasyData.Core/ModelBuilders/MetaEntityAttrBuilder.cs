using System;

namespace EasyData
{
    /// <summary>
    /// Builder for entity attribute metadata.
    /// </summary>
    public class MetaEntityAttrBuilder
    {

        public MetaEntityAttr Attribute { get; private set; }

        /// <summary>
        /// Initialize entity attribute builder.
        /// </summary>
        public MetaEntityAttrBuilder(MetaEntityAttr attr)
        {
            Attribute = attr;
        }

        /// <summary>
        /// Set availability for the attribute.
        /// </summary>
        /// <param name="enabled">Enable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public MetaEntityAttrBuilder SetEnabled(bool enabled)
        {
            //TODO: Check if we really need this
            if (!enabled) { 
                Attribute.Entity?.Attributes.Remove(Attribute);
            }
            return this;
        }

        /// <summary>
        /// Set attribute display name.
        /// </summary>
        /// <param name="displayName">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public MetaEntityAttrBuilder SetDisplayName(string displayName)
        {
            Attribute.Caption = displayName;
            return this;
        }

        /// <summary>
        /// Set attribute display format.
        /// </summary>
        /// <param name="displayFormat">Display format to set.</param>
        /// <returns>Current instance of the class.</returns>
        public MetaEntityAttrBuilder SetDisplayFormat(string displayFormat)
        {
            Attribute.DisplayFormat = displayFormat;
            return this;
        }

        /// <summary>
        /// Set attribute description.
        /// </summary>
        /// <param name="description">Description to set.</param>
        /// <returns>Current instance of the class.</returns>
        public MetaEntityAttrBuilder SetDescription(string description)
        {
            Attribute.Description = description;
            return this;
        }

        /// <summary>
        /// Set whether the attribute is editable or not.
        /// </summary>
        /// <param name="editable">Editable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public MetaEntityAttrBuilder SetEditable(bool editable)
        {
            Attribute.IsEditable = editable;
            return this;
        }

        /// <summary>
        /// Set the index of the attribute.
        /// </summary>
        /// <param name="index">Index to set.</param>
        /// <returns>Current instance of the class.</returns>
        public MetaEntityAttrBuilder SetIndex(int index)
        {
            Attribute.Index = index;
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown in LookUp editor.
        /// </summary>
        /// <param name="showInLookup">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public MetaEntityAttrBuilder SetShowInLookup(bool showInLookup)
        {
            Attribute.ShowInLookup = showInLookup;
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown on view.
        /// </summary>
        /// <param name="showOnView">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public MetaEntityAttrBuilder SetShowOnView(bool showOnView)
        {
            Attribute.ShowOnView = showOnView;
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown on edit.
        /// </summary>
        /// <param name="showOnEdit">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public MetaEntityAttrBuilder SetShowOnEdit(bool showOnEdit)
        {
            Attribute.ShowOnEdit = showOnEdit;
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown on create.
        /// </summary>
        /// <param name="showOnCreate">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public MetaEntityAttrBuilder SetShowOnCreate(bool showOnCreate)
        {
            Attribute.ShowOnCreate = showOnCreate;
            return this;
        }

        /// <summary>
        /// Set the default sorting.
        /// </summary>
        /// <param name="sorting">Sorting to set.</param>
        /// <returns></returns>
        public MetaEntityAttrBuilder SetSorting(int sorting)
        {
            Attribute.Sorting = sorting;
            return this;
        }
    }
}
