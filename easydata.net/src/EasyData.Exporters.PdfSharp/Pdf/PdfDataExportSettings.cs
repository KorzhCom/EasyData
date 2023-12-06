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

        /// <summary>
        /// Page margins (in millimeters)
        /// </summary>
        public (short Left, short Top, short Right, short Bottom) Margins { get; set; } = (25, 25, 25, 25);

        /// <summary>
        /// Minimum width of columns (in millimeters)
        /// </summary>
        public int MinColWidth { get; set; } = 18;

        /// <summary>
        /// Gets or sets the value indicating whether we can set custom page size if the table width exceeds the page width
        /// </summary>
        /// <value>
        /// <c>true</c> if flexible page size is used; otherwise, <c>false</c>.
        /// </value>
        public bool FlexiblePageSize { get; set; } = false;
    }
}
