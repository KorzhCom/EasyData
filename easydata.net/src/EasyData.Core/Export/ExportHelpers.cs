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


        public static Dictionary<string, IFormatProvider> GetPredefinedFormatters(IReadOnlyList<EasyDataCol> cols, IDataExportSettings settings)
        {
            var result = new Dictionary<string, IFormatProvider>();
            for (int i = 0; i < cols.Count; i++) {
                var dfmt = cols[i].DisplayFormat;
                if (!string.IsNullOrEmpty(dfmt) && !result.ContainsKey(dfmt)) {
                    var format = DataFormatUtils.ExtractFormatString(dfmt);
                    if (format.StartsWith("S", StringComparison.InvariantCultureIgnoreCase)) {
                        result.Add(dfmt, new SequenceFormatter(format, settings.Culture));
                    }
                }

            }
            return result;
        }
    }
}
