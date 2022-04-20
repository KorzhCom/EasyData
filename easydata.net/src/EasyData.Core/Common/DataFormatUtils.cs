using System;
using System.Globalization;
using System.Text.RegularExpressions;

namespace EasyData
{
    public static class DataFormatUtils
    {
        private static Regex _formatRegex = new Regex("{0:(.*?)}", RegexOptions.Singleline);

        public static string ExtractFormatString(string displayFormat)
        {
            if (_formatRegex.IsMatch(displayFormat))
                return _formatRegex.Match(displayFormat).Groups[1].Value;

            return "";
        }

        public static void CheckFormat(string dataFormat)
        {
            if (!_formatRegex.IsMatch(dataFormat))
                throw new InvalidDataFormatException("Invalid display format: " + dataFormat);
        }

        public static string GetDateFormat(DataType dataType, CultureInfo culture, string displayFormat)
        {
            if (!string.IsNullOrEmpty(displayFormat)) {
                var dfmt = _formatRegex.Match(displayFormat).Groups[1].Value;
                if (dfmt == "d") {
                    return BuildShortDateTimeFormat(culture, DataType.Date);
                }
                else if (dfmt == "D") {
                    return BuildLongDateTimeFormat(culture, DataType.Date);
                }
                else if (dfmt == "f") {
                    return BuildShortDateTimeFormat(culture, DataType.DateTime);
                }
                else if (dfmt == "F") {
                    return BuildLongDateTimeFormat(culture, DataType.DateTime);
                }
                return dfmt;
            }

            return BuildShortDateTimeFormat(culture, dataType);
        }

        public static string GetFormattedValue(object val, DataType dataType, CultureInfo culture, string displayFormat)
        {
            if (val == null) {
                return "";
            }

            if (val is DateTime dt) {
                if (!string.IsNullOrEmpty(displayFormat)) {
                    return string.Format(culture, displayFormat, val);
                }

                var format = BuildShortDateTimeFormat(culture, dataType);
                return dt.ToString(format, CultureInfo.InvariantCulture);
            }
            else if (val is DateTimeOffset dto) {
                if (!string.IsNullOrEmpty(displayFormat)) {
                    return string.Format(culture, displayFormat, val);
                }

                var format = BuildShortDateTimeFormat(culture, dataType);
                return dto.ToString(format, CultureInfo.InvariantCulture);
            }
            else if (val is TimeSpan ts) {
                if (!string.IsNullOrEmpty(displayFormat)) {
                    return string.Format(culture, displayFormat, val);
                }

                return ts.ToString(culture.DateTimeFormat.ShortTimePattern, CultureInfo.InvariantCulture);
            }
#if NET6_0_OR_GREATER
            else if (val is DateOnly @do) {
                if (!string.IsNullOrEmpty(displayFormat)) {
                    return string.Format(culture, displayFormat, val);
                }

                return @do.ToString(culture.DateTimeFormat.ShortDatePattern, CultureInfo.InvariantCulture);
            }
            else if (val is TimeOnly to) {
                if (!string.IsNullOrEmpty(displayFormat)) {
                    return string.Format(culture, displayFormat, val);
                }

                return to.ToString(culture.DateTimeFormat.ShortTimePattern, CultureInfo.InvariantCulture);
            }
#endif
            else if (val is float || val is double || val is int || val is decimal) {
                if (!string.IsNullOrEmpty(displayFormat))
                    return string.Format(culture, displayFormat, val);

                return string.Format(culture, "{0}", val);
            }

            return val.ToString();
        }

        private static string BuildShortDateTimeFormat(CultureInfo culture, DataType type)
        {
            if (type == DataType.Date) {
                return culture.DateTimeFormat.ShortDatePattern;
            }
            else if (type == DataType.Time) {
                return culture.DateTimeFormat.ShortTimePattern;
            }

            return culture.DateTimeFormat.ShortDatePattern + " "
                    + culture.DateTimeFormat.ShortTimePattern;
        }

        private static string BuildLongDateTimeFormat(CultureInfo culture, DataType type)
        {
            if (type == DataType.Date) {
                return culture.DateTimeFormat.LongDatePattern;
            }
            else if (type == DataType.Time) {
                return culture.DateTimeFormat.LongTimePattern;
            }

            return culture.DateTimeFormat.LongDatePattern + " "
                    + culture.DateTimeFormat.LongTimePattern;
        }
    }

    public class InvalidDataFormatException : Exception
    {
        public InvalidDataFormatException()
        {
        }

        public InvalidDataFormatException(string message) : base(message)
        {
        }
    }
}
