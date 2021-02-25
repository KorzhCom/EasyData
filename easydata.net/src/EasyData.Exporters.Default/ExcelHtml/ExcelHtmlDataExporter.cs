using System.Globalization;


namespace EasyData.Export
{
    /// <summary>
    /// An implementation of <see cref="IDataExporter"/> interface, that performs exporting of the data stream to Excel's html format
    /// </summary>
    public class ExcelHtmlDataExporter : HtmlDataExporter
    {
        /// <summary>
        /// Gets default settings
        /// </summary>
        /// <param name="culture">The culture info</param>
        /// <returns></returns>
        public new IDataExportSettings GetDefaultSettings(CultureInfo culture = null)
        {
            return new HtmlDataExportSettings(culture);
        }

        /// <summary>
        /// The default settings.
        /// </summary>
        public new IDataExportSettings DefaultSettings => ExcelHtmlDataExportSettings.Default;

        /// <summary>
        /// Gets the MIME content type of the exporting format.
        /// </summary>
        /// <returns>System.String.</returns>
        public new string GetContentType()
        {
            return "application/vnd.ms-excel";
        }
    }
}
