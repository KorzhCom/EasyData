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
        public string Id { get; set; }

        public int Index { get; set; }

        public bool IsAggr { get; set; }

        public string Label { get; set; }

        public DataType Type { get; set; }

        public string AttrId { get; set; }

        public string DisplayFormat { get; set; }

        public string GroupFooterColumnTemplate { get; set; }

        public EasyDataColStyle Style { get; set; }


    }

    public class EasyDataCol
    {
        [JsonProperty("id")]
        public string Id { get;  }

        [JsonIgnore]
        public int Index { get;  }

        [JsonProperty("isAggr")]
        public bool IsAggr { get;  }

        [JsonProperty("label")]
        public string Label { get; set; }

        [JsonProperty("type")]
        public DataType Type { get; }

        [JsonProperty("originAttrId")]
        public string OrginAttrId { get; }

        [JsonProperty("dfmt")]
        public string DisplayFormat { get; set; }

        [JsonProperty("gfct")]
        public string GroopFooterColumnTemplate { get; set; }

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
            Type = desc.Type;
            DisplayFormat = desc.DisplayFormat;
            GroopFooterColumnTemplate = desc.GroupFooterColumnTemplate;
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

    public interface IEasyDataResultSet {
        /// <summary>
        /// Gets columns
        /// </summary>
        IReadOnlyList<EasyDataCol> Cols { get; }

        /// <summary>
        /// Gets rows.
        /// </summary>
        IEnumerable<EasyDataRow> Rows { get; }
    }


    public class EasyDataResultSet: IEasyDataResultSet
    {
        [JsonProperty("cols")]
        public List<EasyDataCol> Cols { get; } = new List<EasyDataCol>();
        [JsonProperty("rows")]
        public List<EasyDataRow> Rows { get; } = new List<EasyDataRow>();

        IReadOnlyList<EasyDataCol> IEasyDataResultSet.Cols => Cols;

        IEnumerable<EasyDataRow> IEasyDataResultSet.Rows => Rows;
    }
}
