using EasyData.Export;

namespace EasyData.Services
{
    public static class EasyDataServicesBuilderClosedXMLExtensions
    {
        /// <summary>
        /// Adds <see cref="ExcelDataExporter"/> as "excel" format.
        /// </summary>
        /// <param name="builder"></param>
        /// <returns></returns>
        public static EasyDataServicesBuilder AddExcelExporter(this EasyDataServicesBuilder builder)
        {
            return builder.AddDataExporter<ExcelDataExporter>("excel");
        }
    }
}
