using System;
using System.Collections.Generic;
using System.Text;
using EasyData.MetaDescriptors;

namespace EasyData.Services
{
    /// <summary>
    /// Store entity's meta properties.
    /// </summary>
    public interface IEntityMetadataDescriptor
    {
        /// <summary>
        /// Entity name to display.
        /// </summary>
        string DisplayName { get; set; }

        /// <summary>
        /// Entity plural name to display.
        /// </summary>
        string DisplayNamePlural { get; set; }

        /// <summary>
        /// Define whether the entity is enabled.
        /// </summary>
        bool IsEnabled { get; set; }

        /// <summary>
        /// Entity description.
        /// </summary>
        string Description { get; set; }

        /// <summary>
        /// Entity type.
        /// </summary>
        Type ClrType { get; }

        /// <summary>
        /// Entity properties meta information.
        /// </summary>
        HashSet<EntityPropertyMetadataDescriptor> MetadataProperties { get; }
    }
}
