using System.Globalization;

namespace EasyData.Export.Pdf
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

    }
}
