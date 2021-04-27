using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace EasyData
{
    public class SequenceFormat : IFormatProvider, ICustomFormatter
    {

        private readonly CultureInfo _culture;

        public SequenceFormat() : this(CultureInfo.InvariantCulture)
        { 
        
        }

        public SequenceFormat(CultureInfo culture)
        {
            _culture = culture;
        }

        public object GetFormat(Type formatType)
        {
            if (formatType == typeof(ICustomFormatter))
                return this;
            else
                return null;
        }

        public string Format(string fmt, object arg, IFormatProvider formatProvider)
        {
            // Provide default formatting if arg is not an Int64.
            if (!fmt.StartsWith("S") || arg.GetType() != typeof(bool)) {
                try {
                    return HandleOtherFormats(fmt, arg);
                }
                catch (FormatException e) {
                    throw new FormatException(String.Format("The format of '{0}' is invalid.", fmt), e);
                }
            }

            var values = fmt.Substring(1).Split('|');
            if (values.Length != 2) {
                throw new FormatException(String.Format("The format of '{0}' is invalid.", fmt));
            }

            var value = (bool)arg;
            return values[(value) ? 1 : 0];
        }

        private string HandleOtherFormats(string format, object arg)
        {
            if (arg is IFormattable)
                return ((IFormattable)arg).ToString(format, _culture);
            else if (arg != null)
                return arg.ToString();
            else
                return String.Empty;
        }
    }
}
