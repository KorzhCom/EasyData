using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Text;

namespace EasyData
{
    /// <summary>
    /// Represents an exception which occurs during the reading of the model from JSON
    /// </summary>
    /// <seealso cref="System.Exception" />
    public class BadJsonFormatException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="BadJsonFormatException"/> class.
        /// </summary>
        /// <param name="path">The path.</param>
        public BadJsonFormatException(string path)
            : base($"Wrong JSON format at path: {path}")
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="BadJsonFormatException"/> class.
        /// </summary>
        /// <param name="message">The error message that explains the reason for the exception.</param>
        /// <param name="innerException">The exception that is the cause of the current exception, or a null reference (Nothing in Visual Basic) if no inner exception is specified.</param>
        public BadJsonFormatException(string message, Exception innerException) : base(message, innerException)
        {
        }

#if !NET8_0_OR_GREATER
        /// <summary>
        /// Initializes a new instance of the <see cref="BadJsonFormatException"/> class.
        /// </summary>
        /// <param name="info">The <see cref="T:System.Runtime.Serialization.SerializationInfo"></see> that holds the serialized object data about the exception being thrown.</param>
        /// <param name="context">The <see cref="T:System.Runtime.Serialization.StreamingContext"></see> that contains contextual information about the source or destination.</param>
        protected BadJsonFormatException(SerializationInfo info, StreamingContext context) : base(info, context)
        {
        }
#endif
    }
}
