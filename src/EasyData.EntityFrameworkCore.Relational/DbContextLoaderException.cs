using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData.EntityFrameworkCore
{
    /// <summary>
    /// Represents exception class for <see cref="DbContextLoader"/>
    /// </summary>
    public class DbContextLoaderException : Exception
    {
        /// <summary>
        /// nitializes a new instance of the <see cref="DbContextLoaderException" /> class.
        /// </summary>
        /// <param name="message">The error message.</param>
        public DbContextLoaderException(string message) : base(message)
        {

        }
    }
}
