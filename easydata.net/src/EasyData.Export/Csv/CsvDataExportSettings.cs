using System.Globalization;

namespace EasyData.Export.Csv
{
    /// <summary>
    /// Represents csv format used during exporting operations
    /// </summary>
    public class CsvDataExportSettings : BasicDataExportSettings
    {
        /// <summary>
        /// Returns the default instance of <see cref="CsvDataExportSettings"/>.
        /// </summary>
        public new static CsvDataExportSettings Default => new CsvDataExportSettings();

        /// <summary>
        /// Initializes a new instance of the <see cref="CsvDataExportSettings"/> class.
        /// </summary>
        public CsvDataExportSettings(): this(CultureInfo.CurrentCulture)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="CsvDataExportSettings"/> class.
        /// </summary>
        /// <param name="locale">The locale name.</param>
        public CsvDataExportSettings(string locale) : this(new CultureInfo(locale))
        {
        }


        /// <summary>
        /// Initializes a new instance of the <see cref="CsvDataExportSettings"/> class.
        /// </summary>
        /// <param name="culture">The culture info.</param>
        public CsvDataExportSettings(CultureInfo culture) : base(culture)
        {
            ShowColumnNames = true;
            ShowDatasetInfo = false;
            QuoteAlways = false;
            Separator = ",";
            CommentCharacter = "#";
        }

        /// <summary>
        /// Sets the separator.
        /// </summary>
        /// <value>
        /// simple: ' or ;
        /// </value>
        public string Separator { get; set; }

        /// <summary>
        /// Sets the commanet characetr.
        /// </summary>
        /// /// <value>
        /// simple: # or ;
        /// </value>
        public string CommentCharacter { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether we should always put quotes around field values.
        /// If it's false - quotes will be added only if it's necessary.
        /// </summary>
        /// <value><c>true</c> if all fields must be quoted; otherwise, <c>false</c>.</value>
        public bool QuoteAlways { get; set; }
    }
}
