using System;
using System.Collections.Generic;
using System.Text;

namespace EasyData.EntityFrameworkCore
{
    [AttributeUsage(AttributeTargets.Property)]
    public class MetaEntityAttrAttribute : Attribute
    {
        public bool Enabled { get; set; } = true;

        public string DisplayName { get; set; }

        public string Description { get; set; }

        public bool Visible { get; set; } = true;

        public bool Editable { get; set; } = true;

        public int Index { get; set; } = int.MaxValue;
    }
}
