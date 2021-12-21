using System;
using System.Linq;
using System.Collections.Generic;

using Newtonsoft.Json;

namespace EasyData.Aggregation
{
    public class AggregationSettings
    {
        [JsonProperty("ugt")]
        public bool UseGrandTotals { get; set; }

        [JsonProperty("urc")]
        public bool UseRecordCount { get; set; }

        [JsonProperty("csg")]
        public bool CaseSensitiveGroups { get; set; } = false;

        public List<DataGroup> Groups { get; set; } = new List<DataGroup>();

        public List<DataAggregate> Aggregates { get; set; } = new List<DataAggregate>();

        public bool HasAggregates => Aggregates.Count > 0;

        public bool HasAggregationData => HasAggregates || UseRecordCount;

        public bool HasGroups => Groups.Count > 0;

        public bool HasGrandTotals => UseGrandTotals;

        public bool HasRecordCount => UseRecordCount;

        public List<DataGroup> GetGroups()
        {
            var cols = new List<string>();

            var mappedGroups = Groups.Select(g => {
                cols.AddRange(g.Columns);
                return new DataGroup
                {
                    Columns = new List<string>(cols),
                    Name = g.Name
                };
            })
            .ToList();

            return mappedGroups;
        }

        public AggregationSettings AddGroup(string name, params string[] columns)
        {
            var group = new DataGroup
            {
                Name = name,
                Columns = columns.ToList()
            };
            Groups.Add(group);

            return this;
        }

        public AggregationSettings AddAggregate(string columnId, string funcId = "SUM")
        {
            var aggregate = new DataAggregate
            {
                ColId = columnId,
                FuncId = funcId
            };
            Aggregates.Add(aggregate);

            return this;
        }
    }

    public class DataGroup
    {
        public string Name { get; set; }

        public List<string> Columns { get; set; } = new List<string>();
    }

    public class DataAggregate
    {
        public string ColId { get; set; }

        public string FuncId { get; set; }
    }
}
