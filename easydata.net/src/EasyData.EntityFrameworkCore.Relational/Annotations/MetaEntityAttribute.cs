using System;

namespace EasyData.EntityFrameworkCore
{
    [AttributeUsage(AttributeTargets.Class)]
    public class MetaEntityAttribute: Attribute
    {
        public MetaEntityAttribute(bool enabled = true)
        {
            Enabled = enabled;
        }

        public bool Enabled { get; set; } = true;

        public bool Editable { get; set; } = true;

        public string DisplayName { get; set; }

        public string DisplayNamePlural { get; set; }

        public string Description { get; set; }
    }
}
