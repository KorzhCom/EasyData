using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace EasyData
{
    public class MaskNumberFormat : IFormatProvider, ICustomFormatter
    {
      
        private readonly CultureInfo _culture;

        public MaskNumberFormat(): this(CultureInfo.InvariantCulture)
        {
              
        }

        public MaskNumberFormat(CultureInfo culture)
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
            // Provide default formatting if arg.
            if (arg.GetType() != typeof(int) && arg.GetType() != typeof(long)
                && arg.GetType() != typeof(uint) && arg.GetType() != typeof(ulong)) {

                try {
                    return HandleOtherFormats(fmt, arg);
                }
                catch (FormatException e) {
                    throw new FormatException(String.Format("The format of '{0}' is invalid.", fmt), e);
                }
            }

            // Provide default formatting for unsupported format strings.
            var ufmt = fmt.ToUpper(CultureInfo.InvariantCulture);
            if (!ufmt.StartsWith("M") && ufmt.Length > 1) {
                try {
                    return HandleOtherFormats(fmt, arg);
                }
                catch (FormatException e) {
                    throw new FormatException(String.Format("The format of '{0}' is invalid.", fmt), e);
                }
            }

            var result = arg.ToString();
            var mask = ufmt.Substring(1);

            int index = 0;
            var sb = new StringBuilder();
            foreach (var ch in mask) {
                if (ch == '9') {
                    if (index < result.Length) {
                        sb.Append(result[index]);
                        index++;
                    }
                    else {
                        sb.Append('_');
                    }
                }
                else {
                    sb.Append(ch);
                }
            }

            return sb.ToString();
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
