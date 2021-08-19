using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace EasyData.Export
{
    internal static class Utils
    {
        private static Regex _formatRegex = new Regex("{0:(.*?)}", RegexOptions.Singleline);


        public static string GetFormat(string displayFormat)
        {
            if (_formatRegex.IsMatch(displayFormat))
                return _formatRegex.Match(displayFormat).Groups[1].Value;

            return "";
        }

        public static string GetExcelNumberFormat(IDataExportSettings settings, string dataFormat)
        {
            if (_formatRegex.IsMatch(dataFormat)) {
                return _formatRegex.Replace(dataFormat, m => {
                    var format = m.Groups[1].Value;
      
                    var type = char.ToUpperInvariant(format[0]);
                    if (type == 'D' || type == 'C' || type == 'F') {
                        var digits = (format.Length > 1)
                          ? int.Parse(format.Substring(1))
                          : type == 'D' ? 1 : 2;

                        if (type == 'D') {
                            return new string('0', digits);
                        }

                        var floatFormat = "#0." + new string('0', digits);
                        if (type == 'C') {
                            return settings.Culture.NumberFormat.CurrencySymbol + floatFormat;
                        }
                        else if (type == 'F') {
                            return floatFormat;
                        }
                    }
                   
                    return format;
                });
            }

            return dataFormat;
        }

        public static string GetExcelDateFormat(DataType dataType, IDataExportSettings settings, string dataFormat)
        {
            if (!string.IsNullOrEmpty(dataFormat)) {
                var dfmt = _formatRegex.Match(dataFormat).Groups[1].Value;
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

        private static string BuildShortDateTimeFormat(CultureInfo culture, DataType type)
        {
            string format;
            if (type == DataType.Date) {
                format = culture.DateTimeFormat.ShortDatePattern;
            }
            else if (type == DataType.Time) {
                format = culture.DateTimeFormat.ShortTimePattern;
            }
            else {
                format = culture.DateTimeFormat.ShortDatePattern + " "
                        + culture.DateTimeFormat.ShortTimePattern;
            }

            return ConvertToExcelDateFormat(format);
        }

        private static string BuildLongDateTimeFormat(CultureInfo culture, DataType type)
        {
            string format;
            if (type == DataType.Date) {
                format = culture.DateTimeFormat.LongDatePattern;
            }
            else if (type == DataType.Time) {
                format = culture.DateTimeFormat.LongTimePattern;
            }
            else {
                format = culture.DateTimeFormat.LongDatePattern + " "
                        + culture.DateTimeFormat.LongTimePattern;
            }

            return ConvertToExcelDateFormat(format);
        }

        private static string ConvertToExcelDateFormat(string dateFormat)
        {
            var result = dateFormat.Replace("tt", "AM/PM");
            result = result.Replace("t", "A/P");
            return result;
        }

        private static Regex _forbidSymbols = new Regex(string.Format("[{0}]", Regex.Escape(@":\/?*[]""")));

        public static string ToExcelSheetName(string title)
        {
            title = title ?? "";
            var result = _forbidSymbols.Replace(title, "");
            return !string.IsNullOrWhiteSpace(result)
                ? (result.Length > 30)
                    ? result.Substring(0, 30)
                    : result
                : "Sheet 1";
        }
    }
}
