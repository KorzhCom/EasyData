using System;

namespace EasyData.EntityFrameworkCore
{
    [AttributeUsage(AttributeTargets.Property)]
    public class MetaEntityAttrAttribute : Attribute
    {
        public bool Enabled { get; set; } = true;

        public DataType DataType { get; set; } = DataType.Unknown;

        public string DisplayName { get; set; }

        public string DisplayFormat { get; set; }

        public string Description { get; set; }

        public bool Editable { get; set; } = true;

        public int Index { get; set; } = int.MaxValue;

        public bool ShowInLookup { get; set; } = false;

        public bool ShowOnView { get; set; } = true;

        public bool ShowOnEdit { get; set; } = true;
        
        public bool ShowOnCreate { get; set; } = true;

        public int Sorting { get; set; } = 0;
    }
}
