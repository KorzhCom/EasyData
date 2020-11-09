using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData.EntityFrameworkCore
{
    /// <summary>
    /// Represents exception class for <see cref="DbContextMetaDataLoader"/>
    /// </summary>
    public class DbContextMetaDataLoaderException : Exception
    {
        /// <summary>
        /// nitializes a new instance of the <see cref="DbContextMetaDataLoaderException" /> class.
        /// </summary>
        /// <param name="message">The error message.</param>
        public DbContextMetaDataLoaderException(string message) : base(message)
        {

        }
    }
}
