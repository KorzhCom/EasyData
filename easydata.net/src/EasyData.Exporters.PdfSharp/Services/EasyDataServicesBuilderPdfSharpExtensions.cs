using EasyData.Export;

namespace EasyData.Services
{
    public static class EasyDataServicesBuilderPdfSharpExtensions
    {
        /// <summary>
        /// Adds <see cref="PdfDataExporter"/> as "pdf" format.
        /// </summary>
        /// <param name="builder"></param>
        /// <returns></returns>
        public static EasyDataServicesBuilder AddPdfExporter(this EasyDataServicesBuilder builder)
        {
            return builder.AddDataExporter<PdfDataExporter>("pdf");
        }
    }
}
