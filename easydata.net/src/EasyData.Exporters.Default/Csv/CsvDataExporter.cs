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
    /// An implementation of <see cref="IDataExporter"/> interface, that performs exporting of the data stream to CSV format
    /// </summary>
    public class CsvDataExporter : IDataExporter
    {
        /// <summary>
        /// Gets default settings
        /// </summary>
        /// <param name="culture">The culture info</param>
        /// <returns></returns>
        public IDataExportSettings GetDefaultSettings(CultureInfo culture = null)
        {
            return new CsvDataExportSettings(culture);
        }

        /// <summary>
        /// Exports the specified data to the stream.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        public void Export(IEasyDataResultSet data, Stream stream)
        {
            Export(data, stream, CsvDataExportSettings.Default);
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
        /// Asynchronical version of <see cref="CsvDataExporter.Export(IEasyDataResultSet,Stream)"/> method.
        /// </summary>
        /// <param name="data">The data reader.</param>
        /// <param name="stream">The stream.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        public Task ExportAsync(IEasyDataResultSet data, Stream stream, CancellationToken ct = default)
        {
            return ExportAsync(data, stream, CsvDataExportSettings.Default, ct);
        }

        /// <summary>
        /// Asynchronical version of <see cref="CsvDataExporter.Export(IEasyDataResultSet,Stream, IDataExportSettings)" /> method.
        /// </summary>
        /// <param name="data">The data reader.</param>
        /// <param name="stream">The stream.</param>
        /// <param name="settings">The settings.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        public async Task ExportAsync(IEasyDataResultSet data, Stream stream, IDataExportSettings settings, CancellationToken ct = default)
        {
            var writer = new StreamWriter(stream, new UTF8Encoding(false));
            await ExportAsync(data, writer, settings, ct).ConfigureAwait(false);
        }

        private async Task ExportAsync(IEasyDataResultSet data, TextWriter writer, IDataExportSettings settings, CancellationToken ct)
        {
            var mappedSettings = MapSettings(settings);
            if (data == null) return;

            if (settings.ShowDatasetInfo) {
                if (!string.IsNullOrEmpty(mappedSettings.Title)) {
                    await writer.WriteLineAsync($"{mappedSettings.CommentCharacter} ").ConfigureAwait(false);
                    await writer.WriteLineAsync($"{mappedSettings.CommentCharacter} {mappedSettings.Title}").ConfigureAwait(false);
                    await writer.WriteLineAsync($"{mappedSettings.CommentCharacter} ").ConfigureAwait(false);
                }

                if (!string.IsNullOrEmpty(mappedSettings.Description)) {
                    await writer.WriteLineAsync($"{mappedSettings.CommentCharacter} ").ConfigureAwait(false);
                    await writer.WriteLineAsync($"{mappedSettings.CommentCharacter} {mappedSettings.Description}").ConfigureAwait(false);
                    await writer.WriteLineAsync($"{mappedSettings.CommentCharacter} ").ConfigureAwait(false);
                }
            }

            //ignored columns
            var ignoredCols = GetIgnoredColumns(data, settings);

            //creating header 
            if (mappedSettings.ShowColumnNames) {
                var val = new StringBuilder();

                for (int i = 0; i < data.Cols.Count; i++) {
                    if (ignoredCols.Contains(i))
                        continue;

                    string colName = data.Cols[i].Label;
                    DataType type = data.Cols[i].Type;

                    if (i > 0) val.Append(mappedSettings.Separator);
                    val.Append(GetFormattedValue(colName, DataType.String, mappedSettings, null));
                }
                await writer.WriteLineAsync(val.ToString()).ConfigureAwait(false);
            }


            async Task WriteRowAsync(EasyDataRow row, bool isExtra = false, CancellationToken cancellationToken = default)
            {
                var rowContent = new StringBuilder();

                for (int i = 0; i < row.Count; i++)
                {
                    if (ignoredCols.Contains(i))
                        continue;

                    string dfmt = data.Cols[i].DisplayFormat;
                    DataType type = data.Cols[i].Type;

                    if (i > 0) rowContent.Append(mappedSettings.Separator);
                    rowContent.Append(GetFormattedValue(row[i], type, mappedSettings, dfmt));
                }

                await writer.WriteLineAsync(rowContent.ToString()).ConfigureAwait(false);
            }

            Func<EasyDataRow, CancellationToken, Task> WriteExtraRowAsync = (extraRow, cancellationToken) => WriteRowAsync(extraRow, true, cancellationToken);


            foreach (var row in data.Rows) {
                var add = settings?.RowFilter?.Invoke(row);
                if (add.HasValue && !add.Value)
                    continue;

                if (mappedSettings.BeforeRowAdded != null)
                    await mappedSettings.BeforeRowAdded(row, WriteExtraRowAsync, ct);

                await WriteRowAsync(row, false, ct);

            }

            if (mappedSettings.BeforeRowAdded != null) {
                await mappedSettings.BeforeRowAdded(null, WriteExtraRowAsync, ct);
            }

            await writer.FlushAsync().ConfigureAwait(false);
        }

        /// <summary>
        /// Gets the MIME content type of the exporting format.
        /// </summary>
        /// <returns>System.String.</returns>
        public string GetContentType()
        {
            return "text/csv";
        }


        /// <summary>
        /// Converts string into CVS format.
        /// </summary>
        /// <param name="val">The original string</param>
        /// <param name="dataType">The data type</param>
        /// <param name="settings">Different settings of result HTML file.</param>
        /// <param name="displayFormat">The display format.</param>
        /// <returns>System.String.</returns>

        protected string GetFormattedValue(object val, DataType dataType, CsvDataExportSettings settings, string displayFormat)
        {
            if (val == null) {
                return "";
            }

            var s = Utils.GetFormattedValue(val, dataType, settings, displayFormat);

            bool needQuote = settings.QuoteAlways || s.Contains(settings.Separator) || s.IndexOfAny(new[] { '\n', '\r' }) > -1;
            if (needQuote) {
                return "\"" + s.Replace("\"", "\"\"") + "\"";
            }
            else {
                return s;
            }
        }


        private CsvDataExportSettings MapSettings(IDataExportSettings settings)
        {
            if (settings is CsvDataExportSettings) {
                return settings as CsvDataExportSettings;
            }

            var result = CsvDataExportSettings.Default;
            result.Title = settings.Title;
            result.Description = settings.Description;
            result.ShowDatasetInfo = settings.ShowDatasetInfo;
            result.Culture = settings.Culture;
            result.ShowColumnNames = settings.ShowColumnNames;
            result.RowFilter = settings.RowFilter;
            result.ColumnFilter = settings.ColumnFilter;
            result.BeforeRowAdded = settings.BeforeRowAdded;

            return result;
        }

        private List<int> GetIgnoredColumns(IEasyDataResultSet data, IDataExportSettings settings) 
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
