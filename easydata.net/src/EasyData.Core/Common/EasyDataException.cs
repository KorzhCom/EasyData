using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData
{
    public class EasyDataException : Exception
    {
        public EasyDataException(string message) : base(message)
        {
        }

        public EasyDataException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}
