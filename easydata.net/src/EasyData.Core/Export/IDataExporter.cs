using System.IO;
using System.Threading.Tasks;
using System.Globalization;
using System.Threading;

namespace EasyData.Export
{
    public enum ExportFormatType
    { 
        Text,
        Binary
    }

    /// <summary>
    /// Represents a type used to perform exporting of the data stream to some format (like CSV or PDF) 
    /// </summary>
    public interface IDataExporter
    {
        /// <summary>
        /// Default settings of the exporter.
        /// </summary>
        IDataExportSettings GetDefaultSettings(CultureInfo culture = null);

        /// <summary>
        /// Exports the specified data to the stream.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        void Export(IEasyDataResultSet data, Stream stream);

        /// <summary>
        /// Exports the specified data to the stream with the specified formats.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        /// <param name="settings">Some exporting settings.</param>
        void Export(IEasyDataResultSet data, Stream stream, IDataExportSettings settings);

        /// <summary>
        /// Asynchronical version of <see cref="IDataExporter.Export(IEasyDataResultSet, Stream)"/> method.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        Task ExportAsync(IEasyDataResultSet data, Stream stream, CancellationToken ct = default);

        /// <summary>
        /// Asynchronical version of <see cref="IDataExporter.Export(IEasyDataResultSet,Stream, IDataExportSettings)" /> method.
        /// </summary>
        /// <param name="data">The fetched data.</param>
        /// <param name="stream">The stream.</param>
        /// <param name="settings">Some exporting settings.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        Task ExportAsync(IEasyDataResultSet data, Stream stream, IDataExportSettings settings, CancellationToken ct = default);

        /// <summary>
        /// Gets the MIME content type of the exporting format.
        /// </summary>
        /// <returns>System.String.</returns>
        string GetContentType();
    }
}
