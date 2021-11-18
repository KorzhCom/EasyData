using System;
using System.Collections.Generic;
using System.Text;

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
        /// Represents internal property id.
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Index of property.
        /// </summary>
        public int Index { get; set; }

        public bool IsAggr { get; set; }

        /// <summary>
        /// Name to use for this property in the UI.
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Detailed description of the property.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// The type of data represented by property.
        /// </summary>
        public DataType DataType { get; set; }

        /// <summary>
        /// Represents internal property id.
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
        /// Represents internal property id.
        /// </summary>
        [JsonProperty("id")]
        public string Id { get; }

        /// <summary>
        /// Index of property.
        /// </summary>
        [JsonIgnore]
        public int Index { get; }

        [JsonProperty("isAggr")]
        public bool IsAggr { get; }

        /// <summary>
        /// Name to use for this property in the UI.
        /// </summary>
        [JsonProperty("label")]
        public string Label { get; set; }

        /// <summary>
        /// Detailed description of the property.
        /// </summary>
        [JsonProperty("desc")]
        public string Description { get; set; }

        /// <summary>
        /// The type of data represented by property.
        /// </summary>
        [Obsolete("Use DataType instead")]
        [JsonIgnore]
        public DataType Type => DataType;

        /// <summary>
        /// The type of data represented by property.
        /// </summary>
        [JsonProperty("type")]
        public DataType DataType { get; }

        /// <summary>
        /// Represents original internal property id.
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
        IReadOnlyList<EasyDataCol> Cols { get; }

        /// <summary>
        /// Gets rows.
        /// </summary>
        IEnumerable<EasyDataRow> Rows { get; }
    }


    public class EasyDataResultSet : IEasyDataResultSet
    {
        [JsonProperty("cols")]
        public List<EasyDataCol> Cols { get; } = new List<EasyDataCol>();
        [JsonProperty("rows")]
        public List<EasyDataRow> Rows { get; } = new List<EasyDataRow>();

        IReadOnlyList<EasyDataCol> IEasyDataResultSet.Cols => Cols;

        IEnumerable<EasyDataRow> IEasyDataResultSet.Rows => Rows;
    }
}