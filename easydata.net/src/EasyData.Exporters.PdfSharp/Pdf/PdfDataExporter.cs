using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

using MigraDoc.DocumentObjectModel;
using MigraDoc.DocumentObjectModel.Tables;
using MigraDoc.Rendering;

namespace EasyData.Export
{
    /// <summary>
    /// An implementation of <see cref="IDataExporter"/> interface, that performs exporting of the data stream to PDF format
    /// </summary>
    public class PdfDataExporter : IDataExporter
    {
        /// <summary>
        /// Gets the MIME content type of the exporting format.
        /// </summary>
        /// <returns>System.String.</returns>
        public string GetContentType()
        {
            return "application/pdf";
        }

        /// <summary>
        /// Gets default settings
        /// </summary>
        /// <param name="culture">The culture info</param>
        /// <returns></returns>
        public IDataExportSettings GetDefaultSettings(CultureInfo culture = null)
        {
            return new PdfDataExportSettings(culture);
        }

        /// <summary>
        /// The default settings.
        /// </summary>
        public IDataExportSettings DefaultSettings => PdfDataExportSettings.Default;

        /// <summary>
        /// Exports the specified data to the stream.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        public void Export(IEasyDataResultSet data, Stream stream)
        {
            Export(data, stream, PdfDataExportSettings.Default);
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
        /// Asynchronical version of <see cref="PdfDataExporter.Export(IEasyDataResultSet,Stream)"/> method.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        /// <returns>Task.</returns>
        public Task ExportAsync(IEasyDataResultSet data, Stream stream)
        {
            return ExportAsync(data, stream, PdfDataExportSettings.Default);
        }

        /// <summary>
        /// Asynchronical version of <see cref="PdfDataExporter.Export(IEasyDataResultSet,Stream, IDataExportSettings)" /> method.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        /// <param name="settings">The settings.</param>
        /// <returns>Task.</returns>
        public async Task ExportAsync(IEasyDataResultSet data, Stream stream, IDataExportSettings settings)
        {
            var mappedSettings = MapSettings(settings);

            var document = new Document();
            document.Info.Title = settings.Title;

            ApplyStyles(document, mappedSettings);

            var section = document.AddSection();

            if (settings.ShowDatasetInfo)
            {
                // TO DO: render paragrap with info here
                if (!string.IsNullOrWhiteSpace(mappedSettings.Title)) {
                    var p = section.AddParagraph();
                    p.Format.Alignment = ParagraphAlignment.Center;
                    p.Format.Font.Bold = true;
                    p.AddText(mappedSettings.Title);
                }

                if (!string.IsNullOrWhiteSpace(mappedSettings.Description)) {
                    var p = section.AddParagraph();
                    p.Format.Alignment = ParagraphAlignment.Left;
                    p.AddText(mappedSettings.Description);
                }
            }

            section.AddParagraph();

            // Create the item table
            var table = section.AddTable();
            table.Style = "Table";
            table.Borders.Color = Color.FromRgb(0, 0, 0);
            table.Borders.Width = 0.25;
            table.Borders.Left.Width = 0.5;
            table.Borders.Right.Width = 0.5;
            table.Rows.LeftIndent = 0;

            // filling columns

            //ignored columns
            var ignoredCols = GetIgnoredColumns(data, settings);
            int colsCount = 0;
            for (int i = 0; i < data.Cols.Count; i++)
            {
                if (ignoredCols.Contains(i))
                    continue;

                var column = table.AddColumn(Unit.FromCentimeter(3));
                column.Format.Alignment = ParagraphAlignment.Center;
                colsCount++;
            }

            // filling rows
            if (settings.ShowColumnNames)
            {

                var row = table.AddRow();
                row.HeadingFormat = true;
                row.Format.Alignment = ParagraphAlignment.Center;
                row.Format.Font.Bold = true;
                row.Shading.Color = Color.FromRgb(0, 191, 255);
                for (int i = 0; i < data.Cols.Count; i++)
                {
                    if (ignoredCols.Contains(i))
                        continue;

                    var colName = data.Cols[i].Label;

                    row.Cells[i].AddParagraph(colName);
                    row.Cells[i].Format.Font.Bold = false;
                    row.Cells[i].Format.Alignment = ParagraphAlignment.Center;
                    row.Cells[i].VerticalAlignment = VerticalAlignment.Center;
                }

                table.SetEdge(0, 0, colsCount, 1, Edge.Box, BorderStyle.Single, 0.75, Color.Empty);
            }

            // filling rows
            var rows = data.Rows.Where(row =>
            {

                var add = settings?.RowFilter?.Invoke(row);
                if (add.HasValue && !add.Value)
                    return false;

                return true;
            }).ToList();


            Task WriteRowAsync(EasyDataRow row, bool isExtra = false)
            {
                var pdfRow = table.AddRow();
                pdfRow.TopPadding = 1.5;

                for (int i = 0; i < row.Count; i++)
                {

                    if (ignoredCols.Contains(i))
                        continue;

                    var col = data.Cols[i];
                    var dfmt = col.DisplayFormat;
                    var type = col.Type;
                    var s = Utils.GetFormattedValue(row[i], type, mappedSettings, dfmt);

                    pdfRow.Cells[i].Shading.Color = Color.FromRgb(255, 255, 255);
                    pdfRow.Cells[i].VerticalAlignment = VerticalAlignment.Center;
                    pdfRow.Cells[i].Format.Alignment = MapAlignment(col.Style.Alignment);
                    pdfRow.Cells[i].Format.FirstLineIndent = 1;
                    pdfRow.Cells[i].Format.Font.Bold = isExtra;
                    pdfRow.Cells[i].AddParagraph(s);

                    table.SetEdge(0, 1, colsCount, 1,
                         Edge.Box, BorderStyle.Single, 0.75);
                }

                return Task.CompletedTask;
            }

            Func<EasyDataRow, Task> WriteExtraRowAsync = (extraRow) => WriteRowAsync(extraRow, true);

            foreach (var row in rows) {

                if (mappedSettings.BeforeRowAdded != null)
                    await mappedSettings.BeforeRowAdded(row, WriteExtraRowAsync);

                await WriteRowAsync(row);
            }

            if (mappedSettings.BeforeRowAdded != null)
                await mappedSettings.BeforeRowAdded(null, WriteExtraRowAsync);

            // rendering pdf
            var pdfRenderer = new PdfDocumentRenderer(true);
            pdfRenderer.Document = document;
            pdfRenderer.RenderDocument();

            using (MemoryStream memoryStream = new MemoryStream())
            {
                pdfRenderer.PdfDocument.Save(memoryStream, false);
                memoryStream.Seek(0, SeekOrigin.Begin);

                await memoryStream.CopyToAsync(stream).ConfigureAwait(false);
            }
        }

        private static ParagraphAlignment MapAlignment(ColumnAlignment alignment) 
        {
            switch (alignment) {
                case ColumnAlignment.Center:
                    return ParagraphAlignment.Center;
                case ColumnAlignment.Left:
                    return ParagraphAlignment.Left;
                case ColumnAlignment.Right:
                    return ParagraphAlignment.Right;
                default:
                    return ParagraphAlignment.Left;
            }
        }

        /// <summary>
        /// Apply styles for pdf document
        /// </summary>
        /// <param name="document"></param>
        /// <param name="settings"></param>
        protected void ApplyStyles(Document document, PdfDataExportSettings settings)
        {
            // Get the predefined style Normal.
            Style style = document.Styles["Normal"];

            // Because all styles are derived from Normal, the next line changes the 
            // font of the whole document. Or, more exactly, it changes the font of
            // all styles and paragraphs that do not redefine the font.
            style.Font.Name = "Verdana";

            style = document.Styles[StyleNames.Header];
            style.ParagraphFormat.AddTabStop("16cm", TabAlignment.Right);

            style = document.Styles[StyleNames.Footer];
            style.ParagraphFormat.AddTabStop("8cm", TabAlignment.Center);

            // Create a new style called Table based on style Normal
            style = document.Styles.AddStyle("Table", "Normal");
            style.Font.Name = "Verdana";
            style.Font.Name = "Times New Roman";
            style.Font.Size = 9;

            // Create a new style called Reference based on style Normal
            style = document.Styles.AddStyle("Reference", "Normal");
            style.ParagraphFormat.SpaceBefore = "5mm";
            style.ParagraphFormat.SpaceAfter = "5mm";
            style.ParagraphFormat.TabStops.AddTabStop("16cm", TabAlignment.Right);
        }

        private static PdfDataExportSettings MapSettings(IDataExportSettings settings)
        {
            if (settings is PdfDataExportSettings)
                return settings as PdfDataExportSettings;

            var result = PdfDataExportSettings.Default;
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
