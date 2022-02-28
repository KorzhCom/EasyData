using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace EasyData.Export
{
    /// <summary>
    /// An implementation of <see cref="IDataExporter"/> interface, that performs exporting of the data stream to HTML format
    /// </summary>
    public class HtmlDataExporter : IDataExporter
    {
        /// <summary>
        /// Gets default settings
        /// </summary>
        /// <param name="culture">The culture info</param>
        /// <returns></returns>
        public IDataExportSettings GetDefaultSettings(CultureInfo culture = null)
        {
            return new HtmlDataExportSettings(culture);
        }

        /// <summary>
        /// The default settings.
        /// </summary>
        public IDataExportSettings DefaultSettings => HtmlDataExportSettings.Default;

        /// <summary>
        /// Exports the specified data to the stream.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        public void Export(IEasyDataResultSet data, Stream stream)
        {
            Export(data, stream, HtmlDataExportSettings.Default);
        }

        /// <summary>
        /// Exports the specified data to the stream with the specified formats.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        /// <param name="settings">The settings.</param>
        public void Export(IEasyDataResultSet data, Stream stream, IDataExportSettings settings)
        {
            ExportAsync(data, stream, settings)
                .ConfigureAwait(false)
                .GetAwaiter()
                .GetResult();
        }

        /// <summary>
        /// Asynchronical version of <see cref="HtmlDataExporter.Export(IEasyDataResultSet,Stream)"/> method.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        public Task ExportAsync(IEasyDataResultSet data, Stream stream, CancellationToken ct = default)
        {
            return ExportAsync(data, stream, HtmlDataExportSettings.Default, ct);
        }

        /// <summary>
        /// Asynchronical version of <see cref="HtmlDataExporter.Export(IEasyDataResultSet,Stream, IDataExportSettings)" /> method.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        /// <param name="settings">The settings.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        public async Task ExportAsync(IEasyDataResultSet data, Stream stream, IDataExportSettings settings, CancellationToken ct = default)
        {
            using (var writer = new StreamWriter(stream, new UTF8Encoding(false))) {
                await ExportAsync(data, writer, settings, ct).ConfigureAwait(false);
            }
        }

        private async Task ExportAsync(IEasyDataResultSet data, TextWriter writer, IDataExportSettings settings, CancellationToken ct)
        {
            var mappedSettings = MapSettings(settings);
            if (data == null) return;

            // predefined formatters
            var predefinedFormatters = ExportHelpers.GetPredefinedFormatters(data.Cols, settings);

            await writer.WriteLineAsync("<!DOCTYPE HTML PUBLIC ''-//W3C//DTD HTML 4.0 Transitional//EN''>").ConfigureAwait(false);
            await writer.WriteLineAsync("<html>").ConfigureAwait(false);
            await writer.WriteLineAsync("<head>").ConfigureAwait(false);
            await writer.WriteLineAsync("<meta http-equiv=Content-Type content=\"text/html;charset=utf-8\">").ConfigureAwait(false);
            await writer.WriteLineAsync("<meta name=ProgId content=Excel.Sheet/>").ConfigureAwait(false);
            await writer.WriteLineAsync("<meta name=Generator content=\"Microsoft Excel 11\">").ConfigureAwait(false);
            await writer.WriteLineAsync("<style>").ConfigureAwait(false);
            await writer.WriteLineAsync("    tr {vertical-align:top;}").ConfigureAwait(false);
            await writer.WriteLineAsync("    td br, td p, td ul, td ol, td li  {mso-data-placement:same-cell;}").ConfigureAwait(false);

            await writer.WriteLineAsync("    .eq-title {"
                            + $"        font: bold {mappedSettings.FontSize + 4}pt {mappedSettings.FontFamily}"
                            + "}").ConfigureAwait(false);

            await writer.WriteLineAsync("    .eq-extra-row {"
                            + $"        font-weight: bold"
                            + "}").ConfigureAwait(false);

            await writer.WriteLineAsync("    .eq-desc {"
                            + $"        font: {mappedSettings.FontSize + 1}pt {mappedSettings.FontFamily}"
                            + "}").ConfigureAwait(false);

            await writer.WriteLineAsync("    .eq-result-set {").ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        border-color: {0};", mappedSettings.TableBorderColor)).ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        background-color: {0};", mappedSettings.TableBgColor)).ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        font-size: {0}.0pt;", mappedSettings.FontSize)).ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        font-family: {0};", mappedSettings.FontFamily)).ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        padding: 0;")).ConfigureAwait(false);
            await writer.WriteLineAsync("    }").ConfigureAwait(false);

            await writer.WriteLineAsync("    .eq-result-set thead tr {").ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        color: {0};", mappedSettings.HeaderFgColor)).ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        background-color: {0};", mappedSettings.HeaderBgColor)).ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        font-weight: {0};", mappedSettings.HeaderFontWeight)).ConfigureAwait(false);
            await writer.WriteLineAsync("    }").ConfigureAwait(false);

            await writer.WriteLineAsync("</style>").ConfigureAwait(false);
            await writer.WriteLineAsync("<body>").ConfigureAwait(false);

            if (mappedSettings.ShowDatasetInfo) {
                if (!string.IsNullOrEmpty(mappedSettings.Title)) {
                    await writer.WriteLineAsync($"<div class=\"eq-title\">{mappedSettings.Title}</div>").ConfigureAwait(false);
                }

                if (!string.IsNullOrEmpty(mappedSettings.Description)) {
                    await writer.WriteLineAsync($"<div class=\"eq-desc\">{mappedSettings.Description}</div>").ConfigureAwait(false);
                }
            }

            await writer.WriteLineAsync("<table class=\"eq-result-set\" border=\"1\" cellspacing=\"0\">").ConfigureAwait(false);


            //ignored columns
            var ignoredCols = GetIgnoredColumns(data, settings);

            //creating header 
            if (mappedSettings.ShowColumnNames) {
                await writer.WriteLineAsync("<thead>").ConfigureAwait(false);
                await writer.WriteLineAsync("<tr>").ConfigureAwait(false);
                for (int i = 0; i < data.Cols.Count; i++) {
                    if (ignoredCols.Contains(i))
                        continue;

                    string colName = data.Cols[i].Label;
                    await writer.WriteLineAsync(string.Format("<th>{0}</th>", colName)).ConfigureAwait(false);
                }
                await writer.WriteLineAsync("</tr>").ConfigureAwait(false);
                await writer.WriteLineAsync("</thead>").ConfigureAwait(false);
            }

            await writer.WriteLineAsync("<tbody>").ConfigureAwait(false);
            int a = 0;

            async Task RenderRowAsync(EasyDataRow row, bool isExtra = false, 
                Dictionary<string, object> extraData = null, CancellationToken cancellationToken = default)
            {
                await writer.WriteLineAsync($"<tr {(isExtra ? "class=\"eq-extra-row\"" : "")}>").ConfigureAwait(false);

                for (int i = 0; i < row.Count; i++) {
                    if (ignoredCols.Contains(i))
                        continue;

                    var dfmt = data.Cols[i].DisplayFormat;
                    var gfct = data.Cols[i].GroupFooterColumnTemplate;
                    var type = data.Cols[i].DataType;
                   
                    string value;
                    if (!string.IsNullOrEmpty(dfmt) && predefinedFormatters.TryGetValue(dfmt, out var provider)) {
                        value = string.Format(provider, dfmt, row[i]);
                    }
                    else {
                        value = GetFormattedValue(row[i], type, mappedSettings, dfmt);
                    }

                    if (!string.IsNullOrEmpty(value) && isExtra && !string.IsNullOrEmpty(gfct)) {
                        value = ExportHelpers.ApplyGroupFooterColumnTemplate(gfct, value, extraData);
                    }

                    if (mappedSettings.FixHtmlTags) {
                        value = FixHtmlTags(value);
                    }

                    await writer.WriteLineAsync(string.Format("<td>{0}</td>", value)).ConfigureAwait(false);
                }

                await writer.WriteLineAsync("</tr>").ConfigureAwait(false);
            }

            WriteRowFunc RenderExtraRowAsync = (extraRow, extraData, cancellationToken) =>
                RenderRowAsync(extraRow, true, extraData, cancellationToken);

            var currentRowNum = 0;
            foreach (var row in data.Rows) {
                var add = settings?.RowFilter?.Invoke(row);
                if (add.HasValue && !add.Value)
                    continue;

                if (settings.RowLimit > 0 && currentRowNum >= settings.RowLimit)
                    continue;

                if (mappedSettings.BeforeRowInsert != null)
                    await mappedSettings.BeforeRowInsert(row, RenderExtraRowAsync, ct).ConfigureAwait(false);

                await RenderRowAsync(row, false, null, ct).ConfigureAwait(false);

                a++;
                currentRowNum++;
            }

            if (mappedSettings.BeforeRowInsert != null) {
                await mappedSettings.BeforeRowInsert(null, RenderExtraRowAsync, ct).ConfigureAwait(false);
            }

            await writer.WriteLineAsync("</tbody>").ConfigureAwait(false);
            await writer.WriteLineAsync("</table>").ConfigureAwait(false);
            await writer.WriteLineAsync("</body>").ConfigureAwait(false);
            await writer.WriteLineAsync("</html>").ConfigureAwait(false);

            await writer.FlushAsync().ConfigureAwait(false);
        }

        /// <summary>
        /// Gets the MIME content type of the exporting format.
        /// </summary>
        /// <returns>System.String.</returns>
        public virtual string GetContentType()
        {
            return "text/html";
        }


        /// <summary>
        /// Converts string into HTML format.
        /// </summary>
        /// <param name="val">The original string</param>
        /// <param name="dataType">The data type</param>
        /// <param name="settings">Different settings of result HTML file.</param>
        /// <param name="displayFormat">The display format.</param>
        /// <returns>System.String.</returns>
        protected string GetFormattedValue(object val, DataType dataType, HtmlDataExportSettings settings, string displayFormat)
        {
            var result = DataFormatUtils.GetFormattedValue(val, dataType, settings.Culture, displayFormat);

            if (settings.PreserveFormatting) {
                result = result.Replace("\n", "<br>");
            }
                
            return result;
        }

        private static string FixHtmlTags(string s)
        {
            StringBuilder sb = new StringBuilder(s);
            sb.Replace("<p>", "<br /");
            sb.Replace("</p>", "<br /");
            sb.Replace("<ul>", "<br />");
            sb.Replace("</ul>", "<br />");
            sb.Replace("<ol>", "<br />");
            sb.Replace("</ol>", "<br />");
            sb.Replace("<li>", " ● ");
            sb.Replace("</li>", "<br />");

            return sb.ToString();
        }

        private static HtmlDataExportSettings MapSettings(IDataExportSettings settings)
        {
            if (settings is HtmlDataExportSettings) {
                return settings as HtmlDataExportSettings;
            }

            var result = HtmlDataExportSettings.Default;
            result.Title = settings.Title;
            result.Description = settings.Description;
            result.ShowDatasetInfo = settings.ShowDatasetInfo;
            result.Culture = settings.Culture;
            result.ShowColumnNames = settings.ShowColumnNames;
            result.RowFilter = settings.RowFilter;
            result.ColumnFilter = settings.ColumnFilter;

            return result;
        }

        private static List<int> GetIgnoredColumns(IEasyDataResultSet data, IDataExportSettings settings)
        {
            var result = new List<int>();
            for (int i = 0; i < data.Cols.Count; i++) {
                var add = settings?.ColumnFilter?.Invoke(data.Cols[i]);
                if (add.HasValue && !add.Value) {
                    result.Add(i);
                }
            }

            return result;
        }
    }
}
