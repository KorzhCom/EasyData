using System.Globalization;

using MigraDoc.DocumentObjectModel;

namespace EasyData.Export
{
    /// <summary>
    /// Represents different settings used during exporting to PDF
    /// </summary>
    public class PdfDataExportSettings: BasicDataExportSettings
    {
        /// <summary>
        /// Returns the default instance of <see cref="PdfDataExportSettings"/>.
        /// </summary>
        public new static PdfDataExportSettings Default => new PdfDataExportSettings();

        /// <summary>
        /// Initializes a new instance of the<see cref="PdfDataExportSettings"/> class.
        /// </summary>
        public PdfDataExportSettings() : base()
        {
           
        }

        /// <summary>
        /// Initializes a new instance of the<see cref="PdfDataExportSettings"/> class.
        /// </summary>
        public PdfDataExportSettings(CultureInfo culture) : base(culture)
        {
       
        }

        /// <summary>
        /// Orientation of the page
        /// </summary>
        public Orientation Orientation { get; set; } = Orientation.Portrait;

        /// <summary>
        /// Format of the page
        /// </summary>
        public PageFormat PageFormat { get; set; } = PageFormat.A4;

    }
}
