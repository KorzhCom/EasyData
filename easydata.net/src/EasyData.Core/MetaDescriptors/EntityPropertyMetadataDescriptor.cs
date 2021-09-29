using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

namespace EasyData.MetaDescriptors
{
    /// <summary>
    /// Contains metadata information about a property in an entity.
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
        /// <remarks>TODO: figure out the purpose of the field.</remarks>
        public int? Index { get; set; }

        /// <summary>
        /// Define whether property is shown in LookUp editor.
        /// </summary>
        /// <remarks>TODO: figure out the purpose of the field.</remarks>
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
        /// <remarks>TODO: figure out the purpose of the field.</remarks>
        public int? Sorting { get; set; }

        /// <summary>
        /// The property information.
        /// </summary>
        public PropertyInfo PropertyInfo { get; set; }
    }
}
