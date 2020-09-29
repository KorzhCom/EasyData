using System;

namespace EasyData
{
    public class MetaDataException: Exception
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="Error"/> class.
        /// </summary>
        /// <param name="message">Message.</param>
        public MetaDataException(string message) : base(message) { }
    }
}
