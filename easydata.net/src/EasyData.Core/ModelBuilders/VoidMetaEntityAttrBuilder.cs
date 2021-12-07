using System;

namespace EasyData
{
    /// <summary>
    /// Builder for entity attribute metadata.
    /// </summary>
    public class VoidMetaEntityAttrBuilder : IMetaEntityAttrBuilder
    {

        /// <summary>
        /// Initialize entity attribute builder.
        /// </summary>
        public VoidMetaEntityAttrBuilder()
        {
        }

        /// <summary>
        /// Set availability for the attribute.
        /// </summary>
        /// <param name="enabled">Enable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrBuilder SetEnabled(bool enabled)
        {
            return this;
        }

        /// <summary>
        /// Set attribute display name.
        /// </summary>
        /// <param name="displayName">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrBuilder SetDisplayName(string displayName)
        {
            return this;
        }

        /// <summary>
        /// Set attribute display format.
        /// </summary>
        /// <param name="displayFormat">Display format to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrBuilder SetDisplayFormat(string displayFormat)
        {
            return this;
        }

        /// <summary>
        /// Set attribute description.
        /// </summary>
        /// <param name="description">Description to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrBuilder SetDescription(string description)
        {
            return this;
        }

        /// <summary>
        /// Set whether the attribute is editable or not.
        /// </summary>
        /// <param name="editable">Editable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrBuilder SetEditable(bool editable)
        {
            return this;
        }

        /// <summary>
        /// Set the index of the attribute.
        /// </summary>
        /// <param name="index">Index to set.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrBuilder SetIndex(int index)
        {
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown in LookUp editor.
        /// </summary>
        /// <param name="showInLookup">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrBuilder SetShowInLookup(bool showInLookup)
        {
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown on view.
        /// </summary>
        /// <param name="showOnView">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrBuilder SetShowOnView(bool showOnView)
        {
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown on edit.
        /// </summary>
        /// <param name="showOnEdit">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrBuilder SetShowOnEdit(bool showOnEdit)
        {
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown on create.
        /// </summary>
        /// <param name="showOnCreate">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public IMetaEntityAttrBuilder SetShowOnCreate(bool showOnCreate)
        {
            return this;
        }

        /// <summary>
        /// Set the default sorting.
        /// </summary>
        /// <param name="sorting">Sorting to set.</param>
        /// <returns></returns>
        public IMetaEntityAttrBuilder SetSorting(int sorting)
        {
            return this;
        }
    }
}
