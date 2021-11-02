using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using EasyData.MetaDescriptors;

namespace EasyData.EntityFrameworkCore.Services
{
    /// <summary>
    /// Builder for entity attribute metadata.
    /// </summary>
    public class EntityAttributeMetaBuilder
    {
        /// <summary>
        /// Store entity attribute metadata.
        /// </summary>
        public EntityAttributeMetadataDescriptor EntityAttributeMetadataDescriptor { get; }

        /// <summary>
        /// Initialize entity attribute descriptor.
        /// </summary>
        public EntityAttributeMetaBuilder(PropertyInfo propertyInfo)
        {
            EntityAttributeMetadataDescriptor = new EntityAttributeMetadataDescriptor
            {
                PropertyInfo = propertyInfo
            };
        }

        /// <summary>
        /// Set availability for the attribute.
        /// </summary>
        /// <param name="enabled">Enable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetEnabled(bool enabled)
        {
            EntityAttributeMetadataDescriptor.IsEnabled = enabled;
            return this;
        }

        /// <summary>
        /// Set attribute display name.
        /// </summary>
        /// <param name="displayName">Name to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetDisplayName(string displayName)
        {
            EntityAttributeMetadataDescriptor.DisplayName = displayName;
            return this;
        }

        /// <summary>
        /// Set attribute display format.
        /// </summary>
        /// <param name="displayFormat">Display format to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetDisplayFormat(string displayFormat)
        {
            EntityAttributeMetadataDescriptor.DisplayFormat = displayFormat;
            return this;
        }

        /// <summary>
        /// Set attribute description.
        /// </summary>
        /// <param name="description">Description to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetDescription(string description)
        {
            EntityAttributeMetadataDescriptor.Description = description;
            return this;
        }

        /// <summary>
        /// Set whether the attribute is editable or not.
        /// </summary>
        /// <param name="editable">Editable or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetEditable(bool editable)
        {
            EntityAttributeMetadataDescriptor.IsEditable = editable;
            return this;
        }

        /// <summary>
        /// Set the index of the attribute.
        /// </summary>
        /// <param name="index">Index to set.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetIndex(int index)
        {
            EntityAttributeMetadataDescriptor.Index = index;
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown in LookUp editor.
        /// </summary>
        /// <param name="showInLookup">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetShowInLookup(bool showInLookup)
        {
            EntityAttributeMetadataDescriptor.ShowInLookup = showInLookup;
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown on view.
        /// </summary>
        /// <param name="showOnView">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetShowOnView(bool showOnView)
        {
            EntityAttributeMetadataDescriptor.ShowOnView = showOnView;
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown on edit.
        /// </summary>
        /// <param name="showOnEdit">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetShowOnEdit(bool showOnEdit)
        {
            EntityAttributeMetadataDescriptor.ShowOnEdit = showOnEdit;
            return this;
        }

        /// <summary>
        /// Set whether attribute is shown on create.
        /// </summary>
        /// <param name="showOnCreate">To show or not.</param>
        /// <returns>Current instance of the class.</returns>
        public EntityAttributeMetaBuilder SetShowOnCreate(bool showOnCreate)
        {
            EntityAttributeMetadataDescriptor.ShowOnCreate = showOnCreate;
            return this;
        }

        /// <summary>
        /// Set the default sorting.
        /// </summary>
        /// <param name="sorting">Sorting to set.</param>
        /// <returns></returns>
        public EntityAttributeMetaBuilder SetSorting(int sorting)
        {
            EntityAttributeMetadataDescriptor.Sorting = sorting;
            return this;
        }
    }
}
