using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

using ClosedXML.Excel;

namespace EasyData.Export
{
    /// <summary>
    /// An implementation of <see cref="IDataExporter"/> interface, that performs exporting of the data stream to PDF format
    /// </summary>
    public class ExcelDataExporter : IDataExporter
    {
        /// <summary>
        /// Gets the MIME content type of the exporting format.
        /// </summary>
        /// <returns>System.String.</returns>
        public string GetContentType()
        {
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }

        /// <summary>
        /// Gets default settings
        /// </summary>
        /// <param name="culture">The culture info</param>
        /// <returns></returns>
        public IDataExportSettings GetDefaultSettings(CultureInfo culture = null)
        {
            return new ExcelDataExportSettings(culture);
        }

        /// <summary>
        /// The default settings.
        /// </summary>
        public IDataExportSettings DefaultSettings => ExcelDataExportSettings.Default;

        /// <summary>
        /// Exports the specified data to the stream.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        public void Export(IEasyDataResultSet data, Stream stream)
        {
            Export(data, stream, ExcelDataExportSettings.Default);
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
        /// Asynchronical version of <see cref="ExcelDataExporter.Export(IEasyDataResultSet,Stream)"/> method.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        public Task ExportAsync(IEasyDataResultSet data, Stream stream, CancellationToken ct = default)
        {
            return ExportAsync(data, stream, ExcelDataExportSettings.Default, ct);
        }

        /// <summary>
        /// Asynchronical version of <see cref="ExcelDataExporter.Export(IEasyDataResultSet,Stream, IDataExportSettings)" /> method.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        /// <param name="settings">The settings.</param>
        /// <param name="ct">The cacnellation token.</param>
        /// <returns>Task.</returns>
        public async Task ExportAsync(IEasyDataResultSet data, Stream stream, IDataExportSettings settings, CancellationToken ct = default)
        {
            var mappedSettings = MapSettings(settings);

            // predefined formatters
            var predefinedFormatters = GetPredefinedFormatters(data.Cols, settings);

            var sheetName = Utils.ToExcelSheetName(mappedSettings.Title);

            var wb = new XLWorkbook();
            var ws = wb.Worksheets.Add(sheetName);

            var startLetter = 'B';
            var startNum = 2;
            var cellNum = startNum;
     
            if (mappedSettings.ShowDatasetInfo) {
                if (!string.IsNullOrWhiteSpace(mappedSettings.Title)) {
                    ws.Cell($"{startLetter}{cellNum}").Value = mappedSettings.Title;
                    cellNum++;
                }
                if (!string.IsNullOrWhiteSpace(mappedSettings.Description)) {
                    ws.Cell($"{startLetter}{cellNum}").Value = mappedSettings.Description;
                    cellNum++;
                }

            }

            var ignoredCols = GetIgnoredColumns(data, settings);

            // filling cols
            if (settings.ShowColumnNames) {
                var colCellLetter = startLetter;
                for (int i = 0; i < data.Cols.Count; i++) {
                    if (ignoredCols.Contains(i))
                        continue;

                    var colName = data.Cols[i].Label;
                    ws.Cell($"{colCellLetter}{cellNum}").Value = colName;
                    colCellLetter++;
                }
                cellNum++;
            }


            var endHeaderNum = cellNum;
            var endCellLetter = startLetter;

            Task WriteRowAsync(EasyDataRow row, bool isExtra = false, 
                Dictionary<string, object> extraData = null, CancellationToken cancellationToken = default)
            {
                var rowCellLetter = startLetter;
                for (int i = 0; i < row.Count; i++) {
                    if (ignoredCols.Contains(i))
                        continue;

                    var column = data.Cols[i];

                    var dfmt = column.DisplayFormat;
                    var groupFooterTemplate = data.Cols[i].GroupFooterColumnTemplate;

                    var cell = ws.Cell($"{rowCellLetter}{cellNum}");

                    object value;
                    if (!string.IsNullOrEmpty(dfmt) && predefinedFormatters.TryGetValue(dfmt, out var provider)) {
                        value = string.Format(provider, dfmt, row[i]);
                    }
                    else {
                        value = row[i]; 
                    }

                    if (value != null && isExtra && !string.IsNullOrEmpty(groupFooterTemplate)) {
                        var formattedValue = ExportHelpers.GetFormattedValue(row[i], column.DataType, settings, dfmt);
                        value = ExportHelpers.ApplyGroupFooterColumnTemplate(groupFooterTemplate, formattedValue, extraData);
                    }

                    cell.Value = value ?? "";

                    // setting the cell's format
                    var excelDataType = MapDataType(column.DataType);
                    cell.DataType = excelDataType;
                    if (excelDataType == XLDataType.DateTime) {
                        var format = Utils.GetExcelDateFormat(column.DataType, mappedSettings, dfmt);
                        if (!string.IsNullOrEmpty(format))
                            cell.Style.DateFormat.Format = format;
                    }
                    else if (excelDataType == XLDataType.Number) {
                        var format = Utils.GetExcelNumberFormat(mappedSettings, dfmt);
                        if (!string.IsNullOrEmpty(format))
                            cell.Style.NumberFormat.Format = format;
                    }

                    cell.Style.Alignment.Horizontal = MapAlignment(column.Style.Alignment);

                    if (isExtra)
                        cell.Style.Font.Bold = true;
                    
                    rowCellLetter++;
                }

                endCellLetter = --rowCellLetter;

                cellNum++;

                return Task.CompletedTask;
            }

            BeforeRowAddedCallback WriteExtraRowAsync = (extraRow, extraData, cancellationToken) 
                => WriteRowAsync(extraRow, true, extraData, cancellationToken);

            foreach (var row in data.Rows) {
                var add = settings?.RowFilter?.Invoke(row);
                if (add.HasValue && !add.Value)
                    continue;

                if (mappedSettings.BeforeRowAdded != null)
                    await mappedSettings.BeforeRowAdded(row, WriteExtraRowAsync, ct);

                await WriteRowAsync(row, cancellationToken: ct);
            }

            if (mappedSettings.BeforeRowAdded != null)
                await mappedSettings.BeforeRowAdded(null, WriteExtraRowAsync, ct);

            cellNum--;

            // Setup formats
            //var letter = startLetter;
            //for (int i = 0; i < data.Cols.Count; i++) {
            //    if (ignoredCols.Contains(i))
            //        continue;

            //    var col = data.Cols[i];
            //    var type = col.Type;
            //    var dfmt = col.DisplayFormat;
            //    var colRange = ws.Range($"{letter}{endHeaderNum}:{letter}{cellNum}");
            //    letter++;
            //}

            // Setup styles
            var rngTable = ws.Range($"{startLetter}{startNum}:{endCellLetter}{cellNum}");
            var rowNum = 1;
            if (mappedSettings.ShowDatasetInfo) {
                if (!string.IsNullOrWhiteSpace(mappedSettings.Title)) {
                    rngTable.Cell(rowNum, 1).Style.Font.Bold = true;
                    rngTable.Cell(rowNum, 1).Style.Fill.BackgroundColor = XLColor.CornflowerBlue;
                    rngTable.Cell(rowNum, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    rngTable.Row(rowNum).Merge();
                    rowNum++;
                }
                if (!string.IsNullOrWhiteSpace(mappedSettings.Description)) {
                    rngTable.Cell(rowNum, 1).Style.Font.Bold = true;
                    rngTable.Cell(rowNum, 1).Style.Fill.BackgroundColor = XLColor.White;
                    rngTable.Cell(rowNum, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    rngTable.Row(rowNum).Merge();
                    rowNum++;
                }
            }

            if (settings.ShowColumnNames) {
                var rngHeaders = rngTable.Range($"{startLetter}{rowNum + 1}:{endCellLetter}{rowNum + 1}"); // The address is relative to rngTable (NOT the worksheet)
                rngHeaders.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                rngHeaders.Style.Font.Bold = true;
                rngHeaders.Style.Fill.BackgroundColor = XLColor.Aqua;
            }
            rngTable.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
            rngTable.Style.Border.OutsideBorder = XLBorderStyleValues.Thick;

            ws.Columns(2, 2 + (int)(endCellLetter - startLetter)).AdjustToContents();

            using (MemoryStream memoryStream = new MemoryStream()) {
                wb.SaveAs(memoryStream);
                memoryStream.Seek(0, SeekOrigin.Begin);

                await memoryStream.CopyToAsync(stream, 4096, ct).ConfigureAwait(false);
            }
        }

        private Dictionary<string, IFormatProvider> GetPredefinedFormatters(IReadOnlyList<EasyDataCol> cols, IDataExportSettings settings)
        {
            var result = new Dictionary<string, IFormatProvider>();
            for (int i = 0; i < cols.Count; i++) {
                var dfmt = cols[i].DisplayFormat;
                if (!string.IsNullOrEmpty(dfmt) && !result.ContainsKey(dfmt)) {
                    var format = Utils.GetFormat(dfmt);
                    if (format.StartsWith("S")) {
                        result.Add(dfmt, new SequenceFormat(format, settings.Culture));
                    }
                }

            }
            return result;
        }

        private static XLAlignmentHorizontalValues MapAlignment(ColumnAlignment alignment)
        {
            switch (alignment) {
                case ColumnAlignment.Center:
                    return XLAlignmentHorizontalValues.Center;
                case ColumnAlignment.Left:
                    return XLAlignmentHorizontalValues.Left;
                case ColumnAlignment.Right:
                    return XLAlignmentHorizontalValues.Right;
                default:
                    return XLAlignmentHorizontalValues.General;
            }
        }

        private static XLDataType MapDataType(DataType type)
        {
            switch (type) {
                case DataType.Bool:
                    return XLDataType.Boolean;
                case DataType.Date:
                case DataType.DateTime:
                    return XLDataType.DateTime;
                case DataType.Time:
                    return XLDataType.TimeSpan;
                case DataType.Byte:
                case DataType.Currency:
                case DataType.Int32:
                case DataType.Int64:
                case DataType.Float:
                    return XLDataType.Number;
                default:
                    return XLDataType.Text;
            }
        }

        private ExcelDataExportSettings MapSettings(IDataExportSettings settings)
        {
            if (settings is ExcelDataExportSettings) {
                return settings as ExcelDataExportSettings;
            }

            var result = ExcelDataExportSettings.Default;
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
