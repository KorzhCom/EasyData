using System;
using System.Globalization;

namespace EasyData.Export
{
    /// <summary>
    /// Represents different settings used during exporting to HTML
    /// </summary>
    public class HtmlDataExportSettings : BasicDataExportSettings
    {
        /// <summary>
        /// Returns the default instance of <see cref="HtmlDataExportSettings"/>.
        /// </summary>
        public new static HtmlDataExportSettings Default => new HtmlDataExportSettings();

        /// <summary>
        /// Initializes a new instance of the<see cref="HtmlDataExportSettings"/> class.
        /// </summary>
        public HtmlDataExportSettings() : base() 
        {
            ShowColumnNames = true;
            FixHtmlTags = true;
            FontFamily = "Calibri";
            FontSize = 12;
            TableBgColor = "#ffffff";
            TableBorderColor = "#000000";
            ThicknessOfBorder = 1;
            HeaderBgColor = "navy";
            HeaderFgColor = "#ffffff";
            HeaderFontWeight = "bold";
        }

        /// <summary>
        /// Initializes a new instance of the<see cref="HtmlDataExportSettings"/> class.
        /// </summary>
        public HtmlDataExportSettings(CultureInfo culture) : base(culture)
        {
            ShowColumnNames = true;
            FixHtmlTags = true;
            FontFamily = "Calibri";
            FontSize = 12;
            TableBgColor = "#ffffff";
            TableBorderColor = "#000000";
            ThicknessOfBorder = 1;
            HeaderBgColor = "navy";
            HeaderFgColor = "#ffffff";
            HeaderFontWeight = "bold";

            AddBOM = true;
        }

        /// <summary>
        /// Sets the size of the font.
        /// </summary>
        /// <value>
        /// The size of the font.
        /// </value>
        public int FontSize { get; set; }

        /// <summary>
        /// Sets the font family.
        /// </summary>
        /// <value>
        /// The font family.
        /// </value>
        public string FontFamily { get; set; }

        /// <summary>
        /// the color of the table debug.
        /// </summary>
        /// <value>
        /// for example: #ffffff
        /// </value>
        public string TableBgColor { get; set; }


        /// <summary>
        /// sets the thickness of border.
        /// </summary>
        /// <value>
        /// The thickness of border.
        /// </value>
        public int ThicknessOfBorder { get; set; }


        /// <summary>
        /// sets the color of the table border.
        /// </summary>
        /// <value>
        /// for example: #000000
        /// </value>
        public string TableBorderColor { get; set; }

        /// <summary>
        /// Gets or sets the color of the header bg.
        /// </summary>
        /// <value>
        /// The color of the header bg.
        /// </value>
        public string HeaderBgColor { get; set; }

        /// <summary>
        /// Gets or sets the color of the header fg.
        /// </summary>
        /// <value>
        /// The color of the header fg.
        /// </value>
        public string HeaderFgColor { get; set; }

        /// <summary>
        /// Gets or sets the header font weight.
        /// </summary>
        /// <value>
        /// The header font weight.
        /// </value>
        public string HeaderFontWeight { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether HTML tags (such as p, ol, ul, li, etc) must be converted to plain text during the export.
        /// </summary>
        /// <value>
        ///     <see langword="true"/> if HTML tags will be replaced to plain text; otherwise, <see langword="false"/>.
        /// </value>
        public bool FixHtmlTags { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether we should add BOM at the beginning of the result stream.
        /// </summary>
        /// <value><c>true</c> to add the BOM at the start; otherwise, <c>false</c>.</value>
        public bool AddBOM { get; set; }
    }
}
