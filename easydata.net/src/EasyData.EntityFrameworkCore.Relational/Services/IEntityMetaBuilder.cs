using System;
using System.Collections.Generic;
using System.Text;
using EasyData.MetaDescriptors;

namespace EasyData.EntityFrameworkCore.Services
{
    /// <summary>
    /// Build entity metadata.
    /// </summary>
    public interface IEntityMetaBuilder
    {
        /// <summary>
        /// Store entity metadata.
        /// </summary>
        EntityMetadataDescriptor EntityMetadataDescriptor { get; }

        /// <summary>
        /// Entity type.
        /// </summary>
        Type ClrType { get; }
    }
}
