using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace EasyData.Export
{
    public static class ExportHelpers
    {
        private static Regex _varEntry = new Regex("{{(.+?)}}");

        public static string ApplyGroupFooterColumnTemplate(string template, string val, Dictionary<string, object> extraData)
        {
            return _varEntry.Replace(template, match =>
            {
                var varName = match.Groups[1].Value.Trim();
                if (varName == "GroupValue") {
                    return val;
                }

                if (extraData != null && extraData.TryGetValue(varName, out var extraVal)) {
                    return extraVal.ToString();
                }

                return "";
            });
        }

        private static Regex _formatRegex = new Regex("{0:(.*?)}", RegexOptions.Singleline);

        public static string GetFormat(string displayFormat)
        {
            if (_formatRegex.IsMatch(displayFormat))
                return _formatRegex.Match(displayFormat).Groups[1].Value;

            return "";
        }

        public static Dictionary<string, IFormatProvider> GetPredefinedFormatters(IReadOnlyList<EasyDataCol> cols, IDataExportSettings settings)
        {
            var result = new Dictionary<string, IFormatProvider>();
            for (int i = 0; i < cols.Count; i++) {
                var dfmt = cols[i].DisplayFormat;
                if (!string.IsNullOrEmpty(dfmt) && !result.ContainsKey(dfmt)) {
                    var format = GetFormat(dfmt);
                    if (format.StartsWith("S", StringComparison.InvariantCultureIgnoreCase)) {
                        result.Add(dfmt, new SequenceFormat(format, settings.Culture));
                    }
                }

            }
            return result;
        }

        public static string GetDateFormat(DataType dataType, IDataExportSettings settings, string displayFormat)
        {
            if (!string.IsNullOrEmpty(displayFormat))
            {
                var dfmt = _formatRegex.Match(displayFormat).Groups[1].Value;
                if (dfmt == "d") {
                    return BuildShortDateTimeFormat(settings.Culture, DataType.Date);
                }
                else if (dfmt == "D") {
                    return BuildLongDateTimeFormat(settings.Culture, DataType.Date);
                }
                else if (dfmt == "f") {
                    return BuildShortDateTimeFormat(settings.Culture, DataType.DateTime);
                }
                else if (dfmt == "F") {
                    return BuildLongDateTimeFormat(settings.Culture, DataType.DateTime);
                }
                return dfmt;
            }

            return BuildShortDateTimeFormat(settings.Culture, dataType);
        }

        public static string GetFormattedValue(object val, DataType dataType, IDataExportSettings settings, string displayFormat)
        {
            if (val == null) {
                return "";
            }

            if (val is DateTime) {
                DateTime dt = (DateTime)val;

                if (!string.IsNullOrEmpty(displayFormat)) {
                    return string.Format(settings.Culture, displayFormat, val);
                }

                var format = BuildShortDateTimeFormat(settings.Culture, dataType);
                return dt.ToString(format, CultureInfo.InvariantCulture);
            }
            else if (val is DateTimeOffset) {
                DateTimeOffset dt = (DateTimeOffset)val;

                if (!string.IsNullOrEmpty(displayFormat)) {
                    return string.Format(settings.Culture, displayFormat, val);
                }

                var format = BuildShortDateTimeFormat(settings.Culture, dataType);
                return dt.ToString(format, CultureInfo.InvariantCulture);
            }
            else if (val is float || val is double || val is int || val is decimal) {
                if (!string.IsNullOrEmpty(displayFormat))
                    return string.Format(settings.Culture, displayFormat, val);

                return string.Format(settings.Culture, "{0}", val);
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
}
