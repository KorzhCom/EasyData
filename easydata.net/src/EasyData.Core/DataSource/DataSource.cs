using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace EasyData
{
    public class DataSource : IComparable<DataSource>
    {

        /// <summary>
        /// Initializes a new instance of the <see cref="T:Korzh.EasyData.MetaEntity"/> class.
        /// </summary>
        public DataSource()
        {
        }

        /// <summary>
        /// Gets or sets the entity identifier
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Gets or sets the name of the entity.
        /// </summary>
        /// <value>Entity name</value>
        public string Name { get; set; }

        /// <summary>
        /// Gets ot sets a value indicating whether this entity is editable
        /// </summary>
        public bool IsEditable { get; set; } = true;

        /// <summary>
        /// Gets or sets the index of the entity
        /// </summary>
        public int Index { get; set; } = int.MaxValue;

        /// <summary>
        /// Called when the entity is inserted into model.
        /// </summary>
        internal protected virtual void OnModelAssignment()
        {
        }

        /// <summary>
        /// Gets or sets the description.
        /// </summary>
        /// <value>The description.</value>
        public string Description { get; set; }


        /// <summary>
        /// Gets or sets the user data object associated with entity.
        /// </summary>
        /// <value></value>
        public object UserData { get; set; }

        int IComparable<DataSource>.CompareTo(DataSource source)
        {
            return string.Compare(Id, source.Id, true);
        }
    }
}
