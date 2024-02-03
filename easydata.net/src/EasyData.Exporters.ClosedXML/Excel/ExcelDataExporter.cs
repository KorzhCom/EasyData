using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
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
        /// Asynchronous version of <see cref="ExcelDataExporter.Export(IEasyDataResultSet,Stream)"/> method.
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
        /// Asynchronous version of <see cref="ExcelDataExporter.Export(IEasyDataResultSet,Stream, IDataExportSettings)" /> method.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        /// <param name="settings">The settings.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        public async Task ExportAsync(IEasyDataResultSet data, Stream stream, IDataExportSettings settings, CancellationToken ct = default)
        {
            var mappedSettings = MapSettings(settings);

            // predefined formatters
            var predefinedFormatters = GetPredefinedFormatters(data.Cols, settings);

            var sheetName = Utils.ToExcelSheetName(mappedSettings.Title);

            var wb = new XLWorkbook();
            var ws = wb.Worksheets.Add(sheetName);

            var startColNum = 2;
            var startColId = 'B';

            var cellNum = startColNum;

            var xlColID = GetExcelColumnId(startColNum);
            if (mappedSettings.ShowDatasetInfo) {
                if (!string.IsNullOrWhiteSpace(mappedSettings.Title)) {
                    ws.Cell($"{xlColID}{cellNum}").Value = mappedSettings.Title;
                    cellNum++;
                }
                if (!string.IsNullOrWhiteSpace(mappedSettings.Description)) {
                    ws.Cell($"{xlColID}{cellNum}").Value = mappedSettings.Description;
                    cellNum++;
                }
            }

            var ignoredCols = GetIgnoredColumns(data, settings);

            // filling cols
            if (settings.ShowColumnNames) {
                var colNum = 2;
                for (int i = 0; i < data.Cols.Count; i++) {
                    if (ignoredCols.Contains(i))
                        continue;

                    xlColID = GetExcelColumnId(colNum);
                    var colName = data.Cols[i].Label;
                    ws.Cell($"{xlColID}{cellNum}").Value = colName;
                    colNum++;
                }
                cellNum++;
            }

            var endHeaderNum = cellNum;
            var endColId = GetExcelColumnId(data.Cols.Count - 1 + startColNum);

            Task WriteRowAsync(EasyDataRow row, bool isExtraRow = false, 
                Dictionary<string, object> extraData = null, CancellationToken cancellationToken = default)
            {
                for (int i = 0; i < row.Count; i++) {
                    if (ignoredCols.Contains(i))
                        continue;

                    var column = data.Cols[i];

                    var dfmt = column.DisplayFormat;
                    var groupFooterTemplate = data.Cols[i].GroupFooterColumnTemplate;

                    xlColID = GetExcelColumnId(i + startColNum);

                    var cell = ws.Cell($"{xlColID}{cellNum}");

                    object value;
                    if (!string.IsNullOrEmpty(dfmt) && predefinedFormatters.TryGetValue(dfmt, out var provider)) {
                        value = string.Format(provider, dfmt, row[i]);
                    }
                    else {
                        value = row[i]; 
                    }

                    var excelDataType = XLDataType.Text;
                    if (value != null) {
                        if (!isExtraRow) {
                            excelDataType = MapDataType(column.DataType);
                        }
                        else if (!string.IsNullOrEmpty(groupFooterTemplate)) {
                            var formattedValue = DataFormatUtils.GetFormattedValue(row[i], column.DataType, settings.Culture, dfmt);
                            value = ExportHelpers.ApplyGroupFooterColumnTemplate(groupFooterTemplate, formattedValue, extraData);
                        }
                    }

                    if (!(value is DBNull)) {
                        switch (excelDataType) {
                            case XLDataType.DateTime:
                                cell.Value = value is DateTimeOffset
                                                ? ((DateTimeOffset)value).DateTime
                                                : Convert.ToDateTime(value);
                                break;
                            case XLDataType.Text:
                                if (value != null) {
                                    var strValue = settings.PreserveFormatting && !column.Style.AllowAutoFormatting
                                        ? "'" + value
                                        : value.ToString();
                                    cell.Value = (XLCellValue)strValue;
                                }
                                else { 
                                    cell.Value = Blank.Value;
                                }
                                break;
                            case XLDataType.Number:
                                cell.Value = Convert.ToDouble(value);
                                break;
                            default:
                                cell.Value = value.ToString();
                                break;
                        }
                    }
                    else {
                        cell.Value = Blank.Value;
                    }

                    // setting the cell's format
                    var cellFormat = GetCellFormat(excelDataType, column.DataType, mappedSettings, dfmt);
                    if (!string.IsNullOrEmpty(cellFormat)) {
                        if (excelDataType == XLDataType.Number) {
                            cell.Style.NumberFormat.Format = cellFormat;
                        }
                        else {
                            cell.Style.DateFormat.Format = cellFormat;
                        }
                    }
                    cell.Style.Alignment.Horizontal = MapAlignment(column.Style.Alignment);

                    if (isExtraRow)
                        cell.Style.Font.Bold = true;
                }

                cellNum++;

                return Task.CompletedTask;
            }

            WriteRowFunc WriteExtraRowAsync = (extraRow, extraData, cancellationToken) 
                => WriteRowAsync(extraRow, true, extraData, cancellationToken);

            var currentRowNum = 0;
            foreach (var row in data.Rows) {
                var add = settings?.RowFilter?.Invoke(row);
                if (add.HasValue && !add.Value)
                    continue;

                if (settings.RowLimit > 0 && currentRowNum >= settings.RowLimit)
                    continue;

                if (mappedSettings.BeforeRowInsert != null)
                    await mappedSettings.BeforeRowInsert(row, WriteExtraRowAsync, ct).ConfigureAwait(false);

                await WriteRowAsync(row, cancellationToken: ct).ConfigureAwait(false);

                currentRowNum++;
            }

            if (mappedSettings.BeforeRowInsert != null)
                await mappedSettings.BeforeRowInsert(null, WriteExtraRowAsync, ct).ConfigureAwait(false);

            cellNum--;

            // Setup styles
            var rngTable = ws.Range($"{startColId}{startColNum}:{endColId}{cellNum}");
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
                var rngHeaders = rngTable.Range($"{startColId}{rowNum + 1}:{endColId}{rowNum + 1}"); // The address is relative to rngTable (NOT the worksheet)
                rngHeaders.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                rngHeaders.Style.Font.Bold = true;
                rngHeaders.Style.Fill.BackgroundColor = XLColor.Aqua;
            }
            rngTable.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
            rngTable.Style.Border.OutsideBorder = XLBorderStyleValues.Thick;

            AdjustColumnsSize(ws.Columns(2, 2 + data.Cols.Count - 1));

            using (MemoryStream memoryStream = new MemoryStream()) {
                wb.SaveAs(memoryStream);
                memoryStream.Seek(0, SeekOrigin.Begin);

                await memoryStream.CopyToAsync(stream, 4096, ct).ConfigureAwait(false);
            }
        }

        private void AdjustColumnsSize(IXLColumns columns)
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows)) {
                columns.AdjustToContents();
            }
            else { 
                columns.Width = 16; //TODO: we need to figure out how to make it more intelligently.
            }
        }

        private static string GetExcelColumnId(int num)
        {
            var shift1 = (num - 1) / 26;
            var shift2 = (num - 1) % 26;

            if (shift1 == 0) {
                return ((char)('A' + shift2)).ToString();
            }
            else if (shift1 <= 26) {
                return ((char)('A' + shift1 - 1)).ToString() + (char)('A' + shift2);
            }
            else
                throw new InvalidOperationException($"Can't get ID for {num}'s column");
        }

        private Dictionary<string, IFormatProvider> GetPredefinedFormatters(IReadOnlyList<EasyDataCol> cols, IDataExportSettings settings)
        {
            var result = new Dictionary<string, IFormatProvider>();
            for (int i = 0; i < cols.Count; i++) {
                var dfmt = cols[i].DisplayFormat;
                if (!string.IsNullOrEmpty(dfmt) && !result.ContainsKey(dfmt)) {
                    var format = Utils.GetFormat(dfmt);
                    if (format.StartsWith("S")) {
                        result.Add(dfmt, new SequenceFormatter(format, settings.Culture));
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
                case DataType.Autoinc:
                case DataType.Byte:
                case DataType.Word:
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
            result.BeforeRowInsert = settings.BeforeRowInsert;

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

        private static string GetCellFormat(XLDataType xlDataType, DataType dataType, ExcelDataExportSettings settings, string format)
        {
            switch (xlDataType) {
                case XLDataType.DateTime:
                    return Utils.GetExcelDateFormat(dataType, settings, format);
                case XLDataType.Number:
                    return Utils.GetExcelNumberFormat(settings, format);
                case XLDataType.TimeSpan:
                    return Utils.GetExcelTimeFormat(settings, format);
                default:
                    return null;
            }
        }
    }

}
