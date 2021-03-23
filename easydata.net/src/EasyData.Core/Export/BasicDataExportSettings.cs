using System;
using System.Globalization;
using System.Threading.Tasks;

namespace EasyData.Export
{
    /// <summary>
    /// Represents basic (common) formats for data exporting operations
    /// </summary>
    public class BasicDataExportSettings : IDataExportSettings
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="BasicDataExportSettings"/> class.
        /// </summary>
        /// <param name="culture">The culture.</param>
        public BasicDataExportSettings(CultureInfo culture)
        {
            Culture = culture;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="BasicDataExportSettings"/> class.
        /// The date/time formats will be taken for the current culture
        /// </summary>
        public BasicDataExportSettings() : this(CultureInfo.CurrentCulture)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="BasicDataExportSettings"/> class.
        /// <param name="locale">The locale name.</param>
        /// </summary>
        public BasicDataExportSettings(string locale) : this(new CultureInfo(locale))
        {
        }

        /// <summary>
        /// Gets or sets a value indicating whether column names should be included into export result.
        /// </summary>
        /// <value>
        ///     <see langword="true"/> if column names should be included into result file; otherwise, <see langword="false"/>.
        /// </value>
        public bool ShowColumnNames { get; set; } = true;

        /// <summary>
        /// The culture
        /// </summary>
        public CultureInfo Culture { get; set; }
  
        /// <summary>
        /// Returns the default instance of <see cref="BasicDataExportSettings"/>.
        /// </summary>
        public static BasicDataExportSettings Default => new BasicDataExportSettings();

        /// <summary>
        /// Allows to filter columns during export
        /// </summary>
        public Func<EasyDataCol, bool> ColumnFilter { get; set; }

        /// <summary>
        /// Filter rows during export
        /// </summary>
        public Func<EasyDataRow, bool> RowFilter { get; set; }

        public Func<EasyDataRow, Func<EasyDataRow, Task>, Task> BeforeRowAdded { get; set; }

        /// <summary>
        /// The title
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// The description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Gets or sets value indicating wether title and description will be shown 
        /// </summary>
        public bool ShowDatasetInfo { get; set; } = true;

        /// <summary>
        /// Gets or sets value indicating whether the exporter shoud preserve the formatting in the original value
        /// </summary>
        public bool PreserveFormatting { get; set; } = true;

        public bool IncludeGrandTotals { get; set; } = false;

        public bool IncludeSubTotals { get; set; } = false;
    }
}
