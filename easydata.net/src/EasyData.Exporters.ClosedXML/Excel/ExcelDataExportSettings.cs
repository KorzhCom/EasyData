using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace EasyData.Export.Excel
{
    /// <summary>
    /// Represents different settings used during exporting to EXCEL
    /// </summary>
    public class ExcelDataExportSettings : BasicDataExportSettings
    {
        /// <summary>
        /// Returns the default instance of <see cref="ExcelDataExportSettings"/>.
        /// </summary>
        public new static ExcelDataExportSettings Default => new ExcelDataExportSettings();

        /// <summary>
        /// Initializes a new instance of the<see cref="ExcelDataExportSettings"/> class.
        /// </summary>
        public ExcelDataExportSettings() : base()
        {

        }

        /// <summary>
        /// Initializes a new instance of the<see cref="ExcelDataExportSettings"/> class.
        /// </summary>
        public ExcelDataExportSettings(CultureInfo culture) : base(culture)
        {

        }

    }
}
