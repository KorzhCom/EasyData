using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace EasyData
{
    public class SequenceFormat : IFormatProvider, ICustomFormatter
    {

        private readonly CultureInfo _culture;
        private readonly string _format;

        private readonly Dictionary<long, string> _values;

        public SequenceFormat(string format) : this(format, CultureInfo.InvariantCulture)
        { 
            
        }

        public SequenceFormat(string format, CultureInfo culture)
        {
            if (!format.StartsWith("S"))
                throw new FormatException(string.Format("The format of '{0}' is invalid.", format));

            _format = format;
            _culture = culture;
            _values = new Dictionary<long, string>();

            var keyValues = format.Substring(1)
                .Split('|')
                .Where(v => v != string.Empty)
                .Select(v => v.Split('='))
                .ToArray();

            if (keyValues.Length > 0) {
                var containsKey = keyValues.First().Length == 2;
                if (containsKey) {
                    foreach (var kv in keyValues) {
                        _values[long.Parse(kv[1])] = kv[0];
                    }
                }
                else {
                    for (long i = 0; i < keyValues.Length; i++) {
                        _values[i] = keyValues[i][0];
                    }
                }

            }
           
        }

        public object GetFormat(Type formatType)
        {
            if (formatType == typeof(ICustomFormatter))
                return this;
            else
                return null;
        }

        private static HashSet<Type> _appliedTypes = new HashSet<Type> 
        {
            typeof(bool),
            typeof(sbyte),
            typeof(byte),
            typeof(int),
            typeof(uint),
            typeof(long),
            typeof(ulong),
        };

        public string Format(string fmt, object arg, IFormatProvider formatProvider)
        {
            // Provide default formatting if arg is not an Int64.
            if (!fmt.StartsWith("S") || fmt != _format || !_appliedTypes.Contains(arg.GetType())) {
                try {
                    return HandleOtherFormats(fmt, arg);
                }
                catch (FormatException e) {
                    throw new FormatException(String.Format("The format of '{0}' is invalid.", fmt), e);
                }
            }

            if (arg is bool boolVal) {
                if (_values.TryGetValue((boolVal) ? 1 : 0, out var result))
                    return result;
            }
            else {
                var longVal = (long)Convert.ChangeType(arg, typeof(long));
                if (_values.TryGetValue(longVal, out var result))
                    return result;
            }
  
            return arg.ToString();
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
