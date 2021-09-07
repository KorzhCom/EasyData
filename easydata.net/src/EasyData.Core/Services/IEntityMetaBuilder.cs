using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData.Services
{
    /// <summary>
    /// Store entity's meta properties.
    /// </summary>
    public interface IEntityMetaBuilder
    {
        /// <summary>
        /// Entity name to display.
        /// </summary>
        string DisplayName { get; }

        /// <summary>
        /// Entity plural name to display.
        /// </summary>
        string DisplayNamePlural { get; }

        /// <summary>
        /// Define to show the field or not.
        /// </summary>
        bool? Enabled { get; }

        /// <summary>
        /// Entity description.
        /// </summary>
        string Description { get; }

        /// <summary>
        /// Entity type.
        /// </summary>
        Type ClrType { get; }

        /// <summary>
        /// Entity attributes meta information.
        /// </summary>
        List<EntityAttributeMetaBuilder> AttributeMetaBuilders { get; }
    }
}
