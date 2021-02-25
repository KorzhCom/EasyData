using System;
using System.Globalization;

using EasyData.Export.Html;

namespace EasyData.Export.Excel
{
    /// <summary>
    /// Represents different settings used during exporting to Excel-HTML
    /// </summary>
    public class ExcelHtmlDataExportSettings : HtmlDataExportSettings
    {
        /// <summary>
        /// Returns the default instance of <see cref="ExcelHtmlDataExportSettings"/>.
        /// </summary>
        public new static HtmlDataExportSettings Default => new HtmlDataExportSettings();

        /// <summary>
        /// Initializes a new instance of the<see cref="ExcelHtmlDataExportSettings"/> class.
        /// </summary>
        public ExcelHtmlDataExportSettings() : base() 
        {
        
        }

        /// <summary>
        /// Initializes a new instance of the<see cref="ExcelHtmlDataExportSettings"/> class.
        /// </summary>
        public ExcelHtmlDataExportSettings(CultureInfo culture) : base(culture)
        {

        }
    }
}
