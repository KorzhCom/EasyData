using System;
using System.Collections.Generic;
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
    }
}
