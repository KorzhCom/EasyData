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

        [Obsolete("Use ShowOnView instead")]
        public bool Visible {
            get => ShowOnView;
            set => ShowOnView = value;
        }

        public bool Editable { get; set; } = true;

        public int Index { get; set; } = int.MaxValue;

        public bool ShowInLookup { get; set; } = false;

        public bool ShowOnView { get; set; } = true;

        public bool ShowOnEdit { get; set; } = true;
        
        public bool ShowOnCreate { get; set; } = true;
    }
}
