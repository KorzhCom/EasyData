using EasyData.Export;

namespace EasyData.Services
{
    public static class EasyDataServiceBuilderExportExtensions
    {

        /// <summary>
        /// Adds <see cref="CsvDataExporter"/> as "csv" format.
        /// </summary>
        /// <param name="builder"></param>
        /// <returns></returns>
        public static EasyDataServicesBuilder AddCsvExporter(this EasyDataServicesBuilder builder)
        {
            return builder.AddDataExporter<CsvDataExporter>("csv");
        }

        /// <summary>
        /// Adds <see cref="ExcelHtmlDataExporter"/> as "excel-html" format.
        /// </summary>
        /// <param name="builder"></param>
        /// <returns></returns>
        public static EasyDataServicesBuilder AddExcelHtmlExporter(this EasyDataServicesBuilder builder)
        {
            return builder.AddDataExporter<ExcelHtmlDataExporter>("excel-html");
        }

        /// <summary>
        /// Adds <see cref="HtmlDataExporter"/> as "html" format.
        /// </summary>
        /// <param name="builder"></param>
        /// <returns></returns>
        public static EasyDataServicesBuilder AddHtmlExporter(this EasyDataServicesBuilder builder)
        {
            return builder.AddDataExporter<HtmlDataExporter>("html");
        }

        /// <summary>
        /// Adds <see cref="ExcelHtmlDataExporter"/> and <see cref="CsvDataExporter"/> exporters
        /// </summary>
        /// <param name="builder"></param>
        /// <returns></returns>
        public static EasyDataServicesBuilder AddDefaultExporters(this EasyDataServicesBuilder builder)
        {
            return builder.AddCsvExporter().AddExcelHtmlExporter();
        }

    }
}
