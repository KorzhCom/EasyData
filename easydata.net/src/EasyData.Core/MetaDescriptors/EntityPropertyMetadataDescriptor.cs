using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

namespace EasyData.MetaDescriptors
{
    /// <summary>
    /// Contains metadata information about property in an entity.
    /// </summary>
    public class EntityPropertyMetadataDescriptor
    {
        /// <summary>
        /// Whether to include the property in EasyData or not.
        /// </summary>
        public bool IsEnabled { get; set; } = true;

        /// <summary>
        /// Name to use for this property in the UI.
        /// </summary>
        public string DisplayName { get; set; }

        /// <summary>
        /// The display format for the property.
        /// </summary>
        public string DisplayFormat { get; set; }

        /// <summary>
        /// Detailed description of the property.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Define whether the property is editable.
        /// </summary>
        public bool? IsEditable { get; set; }

        /// <summary>
        /// The index of the property.
        /// </summary>
        public int? Index { get; set; }

        /// <summary>
        /// Define whether property is shown in LookUp editor.
        /// </summary>
        public bool? ShowInLookup { get; set; }

        /// <summary>
        /// Define whether property is visible in a view mode (in grid).
        /// </summary>
        public bool? ShowOnView { get; set; }

        /// <summary>
        /// Define whether property is visible during the edit.
        /// </summary>
        public bool? ShowOnEdit { get; set; }

        /// <summary>
        /// Define whether property is visible during the creation.
        /// </summary>
        public bool? ShowOnCreate { get; set; }

        /// <summary>
        /// The sorting order.
        /// </summary>
        public int? Sorting { get; set; }

        /// <summary>
        /// The property information.
        /// </summary>
        public PropertyInfo PropertyInfo { get; set; }

        /// <summary>
        /// Set availability for the property.
        /// </summary>
        /// <param name="enabled">Enable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetadataDescriptor SetEnabled(bool enabled)
        {
            IsEnabled = enabled;
            return this;
        }

        /// <summary>
        /// Set property display name.
        /// </summary>
        /// <param name="displayName">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetadataDescriptor SetDisplayName(string displayName)
        {
            DisplayName = displayName;
            return this;
        }

        /// <summary>
        /// Set property display format.
        /// </summary>
        /// <param name="displayFormat">Display format to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetadataDescriptor SetDisplayFormat(string displayFormat)
        {
            DisplayFormat = displayFormat;
            return this;
        }

        /// <summary>
        /// Set property description.
        /// </summary>
        /// <param name="description">Description to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetadataDescriptor SetDescription(string description)
        {
            Description = description;
            return this;
        }

        /// <summary>
        /// Set whether the property is editable or not.
        /// </summary>
        /// <param name="editable">Editable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetadataDescriptor SetEditable(bool editable)
        {
            IsEditable = editable;
            return this;
        }

        /// <summary>
        /// Set the index of the property.
        /// </summary>
        /// <param name="index">Index to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetadataDescriptor SetIndex(int index)
        {
            Index = index;
            return this;
        }

        /// <summary>
        /// Set whether property is shown in LookUp editor.
        /// </summary>
        /// <param name="showInLookup">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetadataDescriptor SetShowInLookup(bool showInLookup)
        {
            ShowInLookup = showInLookup;
            return this;
        }

        /// <summary>
        /// Set whether property is shown on view.
        /// </summary>
        /// <param name="showOnView">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetadataDescriptor SetShowOnView(bool showOnView)
        {
            ShowOnView = showOnView;
            return this;
        }

        /// <summary>
        /// Set whether property is shown on edit.
        /// </summary>
        /// <param name="showOnEdit">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetadataDescriptor SetShowOnEdit(bool showOnEdit)
        {
            ShowOnEdit = showOnEdit;
            return this;
        }

        /// <summary>
        /// Set whether property is shown on create.
        /// </summary>
        /// <param name="showOnCreate">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetadataDescriptor SetShowOnCreate(bool showOnCreate)
        {
            ShowOnCreate = showOnCreate;
            return this;
        }

        /// <summary>
        /// Set the default sorting.
        /// </summary>
        /// <param name="sorting">Sorting to set.</param>
        /// <returns></returns>
        public EntityPropertyMetadataDescriptor SetSorting(int sorting)
        {
            Sorting = sorting;
            return this;
        }
    }
}
