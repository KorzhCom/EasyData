using System;
using System.Collections.Generic;
using System.Linq;

using Newtonsoft.Json;

namespace EasyData
{
    public enum ColumnAlignment
    {
        None,
        Left,
        Center,
        Right
    }

    public class EasyDataColStyle
    {
        public ColumnAlignment Alignment { get; set; } = ColumnAlignment.None;
    }


    public class EasyDataColDesc
    {
        /// <summary>
        /// Represents the internal column ID.
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Represents the order number of this column among all columns in the result set.
        /// </summary>
        public int Index { get; set; }

        /// <summary>
        /// Indicates whether this column is an aggregate one.
        /// </summary>
        public bool IsAggr { get; set; }

        /// <summary>
        /// The label that is used for this column in UI.
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// The detailed column description.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// The type of data represented by the property.
        /// </summary>
        public DataType DataType { get; set; }

        /// <summary>
        /// Represents internal property ID.
        /// </summary>
        public string AttrId { get; set; }

        /// <summary>
        /// The display format for the property.
        /// </summary>
        public string DisplayFormat { get; set; }

        public string GroupFooterColumnTemplate { get; set; }

        /// <summary>
        /// The style of the property to display in UI.
        /// </summary>
        public EasyDataColStyle Style { get; set; }


    }

    public class EasyDataCol
    {
        /// <summary>
        /// Represents the internal column ID.
        /// </summary>
        [JsonProperty("id")]
        public string Id { get; }

        /// <summary>
        /// Represents the order number of this column among all columns in the result set.
        /// </summary>
        [JsonIgnore]
        public int Index { get; }

        /// <summary>
        /// Indicates whether this column is an aggregate one.
        /// </summary>
        [JsonProperty("isAggr")]
        public bool IsAggr { get; }

        /// <summary>
        /// The label that is used for this column in UI.
        /// </summary>
        [JsonProperty("label")]
        public string Label { get; set; }

        /// <summary>
        /// The detailed column description.
        /// </summary>
        [JsonProperty("description")]
        public string Description { get; set; }

        /// <summary>
        /// The type of data represented by the property.
        /// </summary>
        [Obsolete("Use DataType instead")]
        [JsonIgnore]
        public DataType Type => DataType;

        /// <summary>
        /// The type of data represented by the property.
        /// </summary>
        [JsonProperty("type")]
        public DataType DataType { get; }

        /// <summary>
        /// Represents the ID of the metadata attribute this column is based on.
        /// </summary>
        [JsonProperty("originAttrId")]
        public string OrginAttrId { get; }

        /// <summary>
        /// The display format for the property.
        /// </summary>
        [JsonProperty("dfmt")]
        public string DisplayFormat { get; set; }

        [JsonProperty("gfct")]
        public string GroupFooterColumnTemplate { get; set; }

        /// <summary>
        /// The style of the property to display in UI.
        /// </summary>
        [JsonProperty("style")]
        public EasyDataColStyle Style { get; }

        public EasyDataCol(EasyDataColDesc desc)
        {
            Id = desc.Id;
            Style = desc.Style ?? new EasyDataColStyle();
            Index = desc.Index;
            IsAggr = desc.IsAggr;
            OrginAttrId = desc.AttrId;
            Label = desc.Label;
            Description = desc.Description;
            DataType = desc.DataType;
            DisplayFormat = desc.DisplayFormat;
            GroupFooterColumnTemplate = desc.GroupFooterColumnTemplate;
        }
    }

    public class EasyDataRow : List<object>
    {
        public EasyDataRow() : base()
        { }

        public EasyDataRow(IEnumerable<object> collection) : base(collection)
        {
        }
    }

    public interface IEasyDataResultSet
    {
        /// <summary>
        /// Gets columns
        /// </summary>
        List<EasyDataCol> Cols { get; }

        /// <summary>
        /// Gets rows.
        /// </summary>
        IEnumerable<EasyDataRow> Rows { get; set; }
    }


    public class EasyDataResultSet : IEasyDataResultSet
    {
        [JsonProperty("cols")]
        public List<EasyDataCol> Cols { get; private set; } = new List<EasyDataCol>();

        [JsonProperty("rows")]
        public IEnumerable<EasyDataRow> Rows { get; set; } = Enumerable.Empty<EasyDataRow>();

        public EasyResultSetOptions Options { get; private set; }

        public EasyDataResultSet(EasyResultSetOptions options) 
        {
            Options = options;
        }
    }

    public class EasyResultSetOptions
    {
        /// <summary>
        /// Gets or sets the callback function that is called before adding a column to the result set.
        /// </summary>
        /// <value>The function that will be called on column addition.</value>
        public Func<EasyDataCol, bool> BeforeAddColumn { get; set; }

        /// <summary>
        /// Gets or sets the callback function that is called before adding a row to the result set.
        /// </summary>
        /// <value>The function that will be called on row addition.</value>
        public Func<EasyDataRow, IReadOnlyList<EasyDataCol>, bool> BeforeAddRow { get; set; }

        /// <summary>
        /// Gets or sets the callback function that is called after the column list is filled (so befor adding the first row)
        /// </summary>
        /// <value>The function that will be called when the column list is ready.</value>
        public Action<IEasyDataResultSet> AfterColumnsAdded { get; set; }

        /// <summary>
        /// Gets or sets the name of the column that holds the number of rows in the result set.
        /// </summary>
        /// <value>The name of the column where the number of rows is stored</value>
        public string RowNumberColumnName { get; set; }

        /// <summary>
        /// Gets or sets value indicating wether timezone offset from query
        /// should be applied to the result
        /// </summary>
        public bool UseTimezoneOffset { get; set; } = false;

        /// <summary>
        /// Timezone offset (in minutes) for all dates used in the result set
        /// </summary>
        public int TimezoneOffset { get; set; } = 0;


        private static EasyResultSetOptions _defaultOptions = null;
        public static EasyResultSetOptions Default {
            get {
                if (_defaultOptions == null) {
                    _defaultOptions = new EasyResultSetOptions();
                }
                return _defaultOptions;
            }
        }
    }
}