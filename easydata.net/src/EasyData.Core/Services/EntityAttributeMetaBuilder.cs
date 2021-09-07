using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;

namespace EasyData.Services
{
    public class EntityAttributeMetaBuilder
    {
        /// <summary>
        /// Define to show the field or not.
        /// </summary>
        public bool? IsEnabled { get; private set; }

        /// <summary>
        /// Gets or sets the attribute's caption.
        /// </summary>
        public string DisplayName { get; private set; }

        /// <summary>
        /// The display format for the attribute.
        /// </summary>
        public string DisplayFormat { get; private set; }

        /// <summary>
        /// The description of entity attribute.
        /// </summary>
        public string Description { get; private set; }

        /// <summary>
        /// Define whether the field is editable or not.
        /// </summary>
        public bool? IsEditable { get; private set; }

        /// <summary>
        /// The index of the attribute.
        /// </summary>
        public int? Index { get; private set; }

        /// <summary>
        /// Define whether to show the field in lookup.
        /// </summary>
        public bool? ShowInLookup { get; private set; }

        /// <summary>
        /// Define whether to show the field on view.
        /// </summary>
        public bool? ShowOnView { get; private set; }

        /// <summary>
        /// Define whether to show the field on edit.
        /// </summary>
        public bool? ShowOnEdit { get; private set; }

        /// <summary>
        /// Define whether to show the field on create.
        /// </summary>
        public bool? ShowOnCreate { get; private set; }

        /// <summary>
        /// The default sorting order.
        /// </summary>
        public int? Sorting { get; private set; }

        /// <summary>
        /// Information about the attribute.
        /// </summary>
        public PropertyInfo PropertyInfo { get; private set; }


        public EntityAttributeMetaBuilder(PropertyInfo propertyInfo)
        {
            PropertyInfo = propertyInfo;
        }

        /// <summary>
        /// Set availability for the field.
        /// </summary>
        /// <param name="enabled">Enable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetEnabled(bool enabled)
        {
            IsEnabled = enabled;
            return this;
        }

        /// <summary>
        /// Set attribute display name.
        /// </summary>
        /// <param name="displayName">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetDisplayName(string displayName)
        {
            DisplayName = displayName;
            return this;
        }

        /// <summary>
        /// Set attribute display format.
        /// </summary>
        /// <param name="displayFormat">Dislay format to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetDisplayFormat(string displayFormat)
        {
            DisplayFormat = displayFormat;
            return this;
        }

        /// <summary>
        /// Set attribute description.
        /// </summary>
        /// <param name="description">Description to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetDescription(string description)
        {
            Description = description;
            return this;
        }

        /// <summary>
        /// Set if the field is editable or not.
        /// </summary>
        /// <param name="editable">Editable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetEditable(bool editable)
        {
            IsEditable = editable;
            return this;
        }

        /// <summary>
        /// Set the index of EntityAttr.
        /// </summary>
        /// <param name="index">Index to set.</param>
        /// <returns></returns>
        public EntityAttributeMetaBuilder SetIndex(int index)
        {
            Index = index;
            return this;
        }

        /// <summary>
        /// Set if the field is shown in lookup.
        /// </summary>
        /// <param name="showInLookup">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetShowInLookup(bool showInLookup)
        {
            ShowInLookup = showInLookup;
            return this;
        }

        /// <summary>
        /// Set if the field is shown on view or not.
        /// </summary>
        /// <param name="showOnView">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetShowOnView(bool showOnView)
        {
            ShowOnView = showOnView;
            return this;
        }

        /// <summary>
        /// Set if the field is shown on edit or not.
        /// </summary>
        /// <param name="showOnEdit">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetShowOnEdit(bool showOnEdit)
        {
            ShowOnEdit = showOnEdit;
            return this;
        }

        /// <summary>
        /// Set if the field is shown on create or not.
        /// </summary>
        /// <param name="showOnCreate">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetShowOnCreate(bool showOnCreate)
        {
            ShowOnCreate = showOnCreate;
            return this;
        }

        /// <summary>
        /// Set the default sorting.
        /// </summary>
        /// <param name="sorting">Sorting to set.</param>
        /// <returns></returns>
        public EntityAttributeMetaBuilder SetSorting(int sorting)
        {
            Sorting = sorting;
            return this;
        }

    }
}
