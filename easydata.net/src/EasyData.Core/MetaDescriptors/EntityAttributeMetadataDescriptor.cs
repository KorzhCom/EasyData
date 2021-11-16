using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

namespace EasyData.MetaDescriptors
{
    /// <summary>
    /// Contains metadata information about attribute in an entity.
    /// </summary>
    public class EntityAttributeMetadataDescriptor
    {
        /// <summary>
        /// Whether to include the attribute in EasyData or not.
        /// </summary>
        public bool IsEnabled { get; set; } = true;

        /// <summary>
        /// Name to use for this attribute in the UI.
        /// </summary>
        public string DisplayName { get; set; }

        /// <summary>
        /// The display format for the attribute.
        /// </summary>
        public string DisplayFormat { get; set; }

        /// <summary>
        /// Detailed description of the attribute.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Define whether the attribute is editable.
        /// </summary>
        public bool? IsEditable { get; set; }

        /// <summary>
        /// The index of the attribute.
        /// </summary>
        public int? Index { get; set; }

        /// <summary>
        /// Define whether attribute is shown in LookUp editor.
        /// </summary>
        public bool? ShowInLookup { get; set; }

        /// <summary>
        /// Define whether attribute is visible in a view mode (in grid).
        /// </summary>
        public bool? ShowOnView { get; set; }

        /// <summary>
        /// Define whether attribute is visible during the edit.
        /// </summary>
        public bool? ShowOnEdit { get; set; }

        /// <summary>
        /// Define whether attribute is visible during the creation.
        /// </summary>
        public bool? ShowOnCreate { get; set; }

        /// <summary>
        /// The sorting order.
        /// </summary>
        public int? Sorting { get; set; }

        /// <summary>
        /// The attribute information.
        /// </summary>
        public PropertyInfo PropertyInfo { get; set; }
    }
}
