using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading;
using System.Threading.Tasks;

namespace EasyData.Export
{

    public delegate Task BeforeRowAddedCallback(EasyDataRow row, Dictionary<string, object> extraData, CancellationToken ct);

    /// <summary>
    /// Represents some settings used during exporting operations
    /// </summary>
    public interface IDataExportSettings
    {
        /// <summary>
        /// Gets or sets a value indicating whether column names should be included into export result.
        /// </summary>
        /// <value>
        ///     <see langword="true"/> if column names should be included into result file; otherwise, <see langword="false"/>.
        /// </value>
        bool ShowColumnNames { get; set; }

        /// <summary>
        /// The culture.
        /// </summary>
        CultureInfo Culture { get; set; }

        /// <summary>
        /// Filter columns during export
        /// </summary>
        Func<EasyDataCol, bool> ColumnFilter { get; set; }

        /// <summary>
        /// Filter rows during export
        /// </summary>
        Func<EasyDataRow, bool> RowFilter { get; set; }

        Func<EasyDataRow, BeforeRowAddedCallback, CancellationToken, Task> BeforeRowAdded { get; set; }

        /// <summary>
        /// The title
        /// </summary>
        string Title { get; set; }

        /// <summary>
        /// The description
        /// </summary>
        string Description { get; set; }

        /// <summary>
        /// Gets or sets value indicating whether title and description will be shown 
        /// </summary>
        bool ShowDatasetInfo { get; set; }

        /// <summary>
        /// Gets or sets value indicating whether the exporter shoud preserve the formatting in the original value
        /// </summary>
        bool PreserveFormatting { get; set; }

        //bool IncludeGrandTotals { get; set; }

        //bool IncludeSubTotals { get; set;}

        //int AggrColumnsCount { get; set; }

        AggregationSettings AggrSettings { get; set; }
    }
}
