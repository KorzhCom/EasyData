using System;
using System.Linq;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace EasyData
{
    public class AggregationSettings
    {
        public class GroupData
        {
            public string Name { get; set; }

            public List<string> Columns { get; set; } = new List<string>();

            public List<AggregateData> Aggregates { get; set; }
        }

        public class AggregateData
        {
            public string ColId { get; set; }

            public string FuncId { get; set; }
        }

        [JsonProperty("ugt")]
        public bool UseGrandTotals { get; set; }

        [JsonProperty("urc")]
        public bool UseRecordCount { get; set; }

        [JsonProperty("csg")]
        public bool CaseSensitiveGroups { get; set; } = false;

        public List<GroupData> Groups { get; set; } = new List<GroupData>();

        public List<AggregateData> Aggregates { get; set; } = new List<AggregateData>();

        public bool HasAggregates => Aggregates.Count > 0;

        public bool HasAggregationData => HasAggregates || UseRecordCount;

        public bool HasGroups => Groups.Count > 0;

        public bool HasGrandTotals => UseGrandTotals;

        public bool HasRecordCount => UseRecordCount;

        public List<GroupData> GetGroups()
        {
            var cols = new List<string>();

            var mappedGorups = Groups.Select(g => {
                cols.AddRange(g.Columns);
                return new GroupData
                {
                    Columns = new List<string>(cols),
                    Aggregates = Aggregates,
                    Name = g.Name
                };
            })
            .ToList();

            return mappedGorups;
        }

    }
}
