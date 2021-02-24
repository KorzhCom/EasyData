using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace EasyData.Export.Excel
{
    /// <summary>
    /// An implementation of <see cref="IDataExporter"/> interface, that performs exporting of the data stream to Excel's html format
    /// </summary>
    [Obsolete("ExcelHtmlDataExporter and its options are deprecated. Use ExcelDataExporter instead")]
    public class ExcelHtmlDataExporter : IDataExporter
    {

        /// <summary>
        /// Gets default settings
        /// </summary>
        /// <param name="culture">The culture info</param>
        /// <returns></returns>
        public IDataExportSettings GetDefaultSettings(CultureInfo culture = null)
        {
            return new ExcelHtmlDataExportSettings(culture);
        }

        /// <summary>
        /// The default settings.
        /// </summary>
        public IDataExportSettings DefaultSettings => ExcelHtmlDataExportSettings.Default;

        /// <summary>
        /// Exports the specified data to the stream.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        public void Export(IEasyDataResultSet data, Stream stream)
        {
            Export(data, stream, ExcelHtmlDataExportSettings.Default);
        }

        /// <summary>
        /// Exports the specified data to the stream with the specified formats.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        /// <param name="settings">The settings.</param>
        public void Export(IEasyDataResultSet data, Stream stream, IDataExportSettings settings)
        {
            ExportAsync(data, stream, settings).GetAwaiter().GetResult();
        }

        /// <summary>
        /// Asynchronical version of <see cref="ExcelHtmlDataExporter.Export(IEasyDataResultSet,Stream)"/> method.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        /// <returns>Task.</returns>
        public Task ExportAsync(IEasyDataResultSet data, Stream stream)
        {
            return ExportAsync(data, stream, ExcelHtmlDataExportSettings.Default);
        }

        /// <summary>
        /// Asynchronical version of <see cref="ExcelHtmlDataExporter.Export(IEasyDataResultSet,Stream, IDataExportSettings)" /> method.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        /// <param name="settings">The settings.</param>
        /// <returns>Task.</returns>
        public async Task ExportAsync(IEasyDataResultSet data, Stream stream, IDataExportSettings settings)
        {
            // do not close stream
            var writer = new StreamWriter(stream, new UTF8Encoding(false));
            await ExportAsync(data, writer, settings);
        }

        private async Task ExportAsync(IEasyDataResultSet data, TextWriter writer, IDataExportSettings settings)
        {
            var mappedSettings = MapSettings(settings);
            if (data == null) return;

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

            await writer.WriteLineAsync("    .eq-desc {"
                            + $"        font: {mappedSettings.FontSize + 1}pt {mappedSettings.FontFamily}"
                            + "}").ConfigureAwait(false);

            await writer.WriteLineAsync("    .eq-result-set {").ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        border-color: {0};", mappedSettings.TableBorderColor)).ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        background-color: {0};", mappedSettings.TableBgColor)).ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        font-size: {0}.0pt;", mappedSettings.FontSize)).ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        font-family: {0};", mappedSettings.FontFamily)).ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        padding: 0;")).ConfigureAwait(false);
            await writer.WriteLineAsync("    }");

            await writer.WriteLineAsync("    .eq-result-set thead tr {").ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        color: {0};", mappedSettings.HeaderFgColor)).ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        background-color: {0};", mappedSettings.HeaderBgColor)).ConfigureAwait(false);
            await writer.WriteLineAsync(string.Format("        font-weight: {0};", mappedSettings.HeaderFontWeight)).ConfigureAwait(false);
            await writer.WriteLineAsync("    }");

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

            await writer.WriteLineAsync("<tbody>");
            int a = 0;
            foreach (var row in data.Rows) {
                await writer.WriteLineAsync("<tr>").ConfigureAwait(false);

                var add = settings?.RowFilter?.Invoke(row);
                if (add.HasValue && !add.Value)
                    continue;

                for (int i = 0; i < row.Count; i++) {

                    if (ignoredCols.Contains(i))
                        continue;

                    string dfmt = data.Cols[i].DisplayFormat;
                    DataType type = data.Cols[i].Type;
                    string s = GetFormattedValue(row[i], type, mappedSettings, dfmt);
                    if (mappedSettings.FixHtmlTags) {
                        s = FixHtmlTags(s);
                    }
                    await writer.WriteLineAsync(string.Format("<td>{0}</td>", s)).ConfigureAwait(false);
                }

                await writer.WriteLineAsync("</tr>").ConfigureAwait(false);
                a++;

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
        public string GetContentType()
        {
            return "application/vnd.ms-excel";
        }


        /// <summary>
        /// Converts string into HTML format.
        /// </summary>
        /// <param name="val">The original string</param>
        /// <param name="dataType">The data type</param>
        /// <param name="settings">Different settings of result HTML file.</param>
        /// <param name="displayFormat">The display format.</param>
        /// <returns>System.String.</returns>
        protected string GetFormattedValue(object val, DataType dataType, ExcelHtmlDataExportSettings settings, string displayFormat)
        {
            var result = Utils.GetFormattedValue(val, dataType, settings, displayFormat);

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

        private static ExcelHtmlDataExportSettings MapSettings(IDataExportSettings settings)
        {
            if (settings is ExcelHtmlDataExportSettings)
                return settings as ExcelHtmlDataExportSettings;

            var result = ExcelHtmlDataExportSettings.Default;
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
