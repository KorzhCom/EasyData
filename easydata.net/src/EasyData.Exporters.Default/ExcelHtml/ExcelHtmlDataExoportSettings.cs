using System;
using System.Globalization;

using EasyData.Export.Html;

namespace EasyData.Export.Excel
{
    /// <summary>
    /// Represents different settings used during exporting to Excel-HTML
    /// </summary>
    public class ExcelHtmlDataExoportSettings : HtmlDataExoportSettings
    {
        /// <summary>
        /// Returns the default instance of <see cref="ExcelHtmlDataExoportSettings"/>.
        /// </summary>
        public new static HtmlDataExoportSettings Default => new HtmlDataExoportSettings();

        /// <summary>
        /// Initializes a new instance of the<see cref="ExcelHtmlDataExoportSettings"/> class.
        /// </summary>
        public ExcelHtmlDataExoportSettings() : base() 
        {
        
        }

        /// <summary>
        /// Initializes a new instance of the<see cref="ExcelHtmlDataExoportSettings"/> class.
        /// </summary>
        public ExcelHtmlDataExoportSettings(CultureInfo culture) : base(culture)
        {

        }
    }
}
