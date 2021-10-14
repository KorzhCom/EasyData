using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;

namespace EasyData.Services
{
    /// <summary>
    /// Build entity property meta information.
    /// </summary>
    public class EntityPropertyMetaBuilder
    {
        /// <summary>
        /// Define whether the property is enabled.
        /// </summary>
        public bool? IsEnabled { get; private set; }

        /// <summary>
        /// Property caption.
        /// </summary>
        public string DisplayName { get; private set; }

        /// <summary>
        /// The display format for the property.
        /// </summary>
        public string DisplayFormat { get; private set; }

        /// <summary>
        /// Property description.
        /// </summary>
        public string Description { get; private set; }

        /// <summary>
        /// Define whether the property is editable.
        /// </summary>
        public bool? IsEditable { get; private set; }

        /// <summary>
        /// The index of the property.
        /// </summary>
        public int? Index { get; private set; }

        /// <summary>
        /// Define whether property is shown in LookUp editor.
        /// </summary>
        public bool? ShowInLookup { get; private set; }

        /// <summary>
        /// Define whether property is visible in a view mode (in grid).
        /// </summary>
        public bool? ShowOnView { get; private set; }

        /// <summary>
        /// Define whether property is visible during the edit.
        /// </summary>
        public bool? ShowOnEdit { get; private set; }

        /// <summary>
        /// Define whether property is visible during the creation.
        /// </summary>
        public bool? ShowOnCreate { get; private set; }

        /// <summary>
        /// The sorting order.
        /// </summary>
        public int? Sorting { get; private set; }

        /// <summary>
        /// The property information.
        /// </summary>
        public PropertyInfo PropertyInfo { get; private set; }


        public EntityPropertyMetaBuilder(PropertyInfo propertyInfo)
        {
            PropertyInfo = propertyInfo;
        }

        /// <summary>
        /// Set availability for the property.
        /// </summary>
        /// <param name="enabled">Enable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetaBuilder SetEnabled(bool enabled)
        {
            IsEnabled = enabled;
            return this;
        }

        /// <summary>
        /// Set property display name.
        /// </summary>
        /// <param name="displayName">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetaBuilder SetDisplayName(string displayName)
        {
            DisplayName = displayName;
            return this;
        }

        /// <summary>
        /// Set property display format.
        /// </summary>
        /// <param name="displayFormat">Display format to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetaBuilder SetDisplayFormat(string displayFormat)
        {
            DisplayFormat = displayFormat;
            return this;
        }

        /// <summary>
        /// Set property description.
        /// </summary>
        /// <param name="description">Description to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetaBuilder SetDescription(string description)
        {
            Description = description;
            return this;
        }

        /// <summary>
        /// Set whether the property is editable or not.
        /// </summary>
        /// <param name="editable">Editable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetaBuilder SetEditable(bool editable)
        {
            IsEditable = editable;
            return this;
        }

        /// <summary>
        /// Set the index of the property.
        /// </summary>
        /// <param name="index">Index to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetaBuilder SetIndex(int index)
        {
            Index = index;
            return this;
        }

        /// <summary>
        /// Set whether property is shown in LookUp editor.
        /// </summary>
        /// <param name="showInLookup">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetaBuilder SetShowInLookup(bool showInLookup)
        {
            ShowInLookup = showInLookup;
            return this;
        }

        /// <summary>
        /// Set whether property is shown on view.
        /// </summary>
        /// <param name="showOnView">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetaBuilder SetShowOnView(bool showOnView)
        {
            ShowOnView = showOnView;
            return this;
        }

        /// <summary>
        /// Set whether property is shown on edit.
        /// </summary>
        /// <param name="showOnEdit">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetaBuilder SetShowOnEdit(bool showOnEdit)
        {
            ShowOnEdit = showOnEdit;
            return this;
        }

        /// <summary>
        /// Set whether property is shown on create.
        /// </summary>
        /// <param name="showOnCreate">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityPropertyMetaBuilder SetShowOnCreate(bool showOnCreate)
        {
            ShowOnCreate = showOnCreate;
            return this;
        }

        /// <summary>
        /// Set the default sorting.
        /// </summary>
        /// <param name="sorting">Sorting to set.</param>
        /// <returns></returns>
        public EntityPropertyMetaBuilder SetSorting(int sorting)
        {
            Sorting = sorting;
            return this;
        }

    }
}
