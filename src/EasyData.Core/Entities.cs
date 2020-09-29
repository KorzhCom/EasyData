using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Newtonsoft.Json;

namespace EasyData
{
    /// <summary>
    /// Represents one entity
    /// </summary>
    public class MetaEntity : IComparable<MetaEntity>
    {

        /// <summary>Initializes a new instance of the <see cref="T:Korzh.EasyQuery.Entity"/> class.</summary>
        /// <param name="parent">The parent entity.</param>
        protected internal MetaEntity(MetaEntity parent)
        {
            Parent = parent;
            Attributes = new EntityAttrStore(this);
            SubEntities = new EntityStore(this);
        }

        /// <summary>
        /// Gets the parent entity.
        /// </summary>
        /// <value>The parent entity.</value>
        public virtual MetaEntity Parent { get; internal set; }

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
        /// Gets or sets the type of the entity.
        /// </summary>
        /// <value>The type of the entity.</value>
        public Type ObjType { get; set; }


        /// <summary>
        /// Gets or sets the name of the DbSet associated with entity
        /// </summary>
        /// <value>The name of the associated column.</value>
        public string DbSetName { get; set; }

        /// <summary>
        /// Gets or sets the path for building query for complex types
        /// </summary>
        /// <value>The complex type path.</value>
        public string TypeName { get; set; }

        /// <summary>
        /// Gets or sets the index of Entity
        /// </summary>
        public int Index { get; set; } = int.MaxValue;

        /// <summary>
        /// Gets a value indicating whether this instance is empty.
        /// </summary>
        /// <value>
        ///   <c>true</c> if this entity has no attributes and all its subentities don't have attributes; otherwise, <c>false</c>.
        /// </value>
        public bool IsEmpty
        {
            get {
                if (Attributes.Count != 0) return false;
                foreach (MetaEntity subEntity in SubEntities)
                {
                    if (!subEntity.IsEmpty) return false;
                }
                return true;
            }
        }


        /// <summary>
        /// Gets a value indicating whether this entity is a root entity.
        /// </summary>
        /// <value>
        ///   <c>true</c> if this instance is root; otherwise, <c>false</c>.
        /// </value>
        public bool IsRoot
        {
            get { return Parent == null; }
        }


        /// <summary>
        /// List of sub entities that belong to this entity.
        /// </summary>
        public EntityStore SubEntities { get; private set; }

        /// <summary>
        /// List of Attributes that belong to this entity.
        /// </summary>
        public EntityAttrStore Attributes { get; private set; }


        /// <summary>
        /// Gets the model.
        /// </summary>
        /// <value>The model.</value>
        public virtual MetaData Model {
            get { return Parent?.Model; }
        }

        /// <summary>
        /// Called when the entity is inserted into model.
        /// </summary>
        internal protected virtual void OnModelAssignment()
        {
            foreach (MetaEntity ent in SubEntities)
                ent.OnModelAssignment();
            foreach (MetaEntityAttr attr in Attributes)
                attr.OnModelAssignment();
        }


        /// <summary>
        /// Gets the full name.
        /// </summary>
        /// <value>The full name.</value>
        public string GetFullName(string separator)
        {
            string parentName = Parent?.GetFullName(separator);
            string result = string.IsNullOrEmpty(parentName) ? Name : parentName + separator + Name;

            return result;
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

        /// <summary>
        /// Gets the first attribute in all attributes and sub-entities of the current entity.
        /// </summary>
        /// <returns>An Attribute object.</returns>
        public MetaEntityAttr GetFirstLeaf()
        {
            if (Attributes.Count > 0) return Attributes[0];
            MetaEntityAttr result;
            foreach (MetaEntity subEntity in SubEntities)
            {
                result = subEntity.GetFirstLeaf();
                if (result != null) return result;
            }
            return null;
        }

        /// <summary>
        /// Finds the attribute by its ID.
        /// </summary>
        /// <param name="what">Attribute property (ID, Caption or SqlName) that we use to compare with searched value.</param>
        /// <param name="val">Value of entityAttr property used for searching </param>
        /// <returns>
        /// An Attribute object with specified ID or null if such object cannot be found.
        /// </returns>
        public virtual MetaEntityAttr FindAttribute(EntityAttrProp what, string val)
        {
            switch (what)
            {
                case EntityAttrProp.Caption:
                    foreach (MetaEntityAttr entityAttr in Attributes)
                    {
                        if (entityAttr.Caption == val) return entityAttr;
                    }
                    break;
                case EntityAttrProp.Expression:
                    foreach (MetaEntityAttr entityAttr in Attributes)
                    {
                        if (entityAttr.CompareWithExpr(val)) return entityAttr;
                    }
                    break;
                default:
                    foreach (MetaEntityAttr entityAttr in Attributes)
                    {
                        if (entityAttr.ID == val) return entityAttr;
                    }
                    break;
            }

            MetaEntityAttr result = null;
            foreach (MetaEntity subEntity in SubEntities)
            {
                result = subEntity.FindAttribute(what, val);
                if (result != null) return result;
            }
            return null;
        }

        /// <summary>
        /// Finds a sub-entity in current entity by its name.
        /// </summary>
        /// <param name="entityName">Name of sub-entity we are srearching for</param>
        /// <returns>
        /// An Entity object with specified name or null if it cannot be found.
        /// </returns>
        public virtual MetaEntity FindSubEntity(string entityName)
        {
            MetaEntity result = null;
            foreach (MetaEntity subEntity in SubEntities)
            {
                if (string.Equals(subEntity.Name, entityName, 
                    StringComparison.InvariantCultureIgnoreCase)) {
                    result = subEntity;
                    break;
                }

                result = subEntity.FindSubEntity(entityName);
                if (result != null)
                    break;
            }
            return result;
        }

        /// <summary>
        /// Deletes the sub-entities specified by name(s) passed in method's parameter(s).
        /// </summary>
        /// <param name="namesToDelete">The names of the entities to delete.</param>
        /// <returns>The amount of deleted entities</returns>
        public virtual int DeleteSubEntities(params string[] namesToDelete)
        {
            int count = 0;

            for (int i = SubEntities.Count - 1; i >= 0; i--) {
                if (namesToDelete.Contains(SubEntities[i].Name)) {
                    SubEntities.RemoveAt(i);
                    count++;
                }
            }
            return count;
        }

        /// <summary>
        /// Deletes the sub-entities.
        /// </summary>
        /// <param name="entityToDeleteFilter">The "filter" function that returns <c>true</c> if the entity should be removed</param>
        /// <returns>The amount of deleted entities</returns>
        public virtual int DeleteSubEntities(Func<MetaEntity, bool> entityToDeleteFilter)
        {
            int count = 0;

            for (int i = SubEntities.Count - 1; i >= 0; i--) {
                if (entityToDeleteFilter.Invoke(SubEntities[i])) {
                    SubEntities.RemoveAt(i);
                    count++;
                }
            }
            return count;
        }


        /// <summary>
        /// Scans all child entities and attributes (including this one one) calls entityHandler and attrHanlder delegates (correspondingly) for each of them
        /// </summary>
        /// <param name="entityHandler">The delegate which will be called for each entity.</param>
        /// <param name="attrHandler">The delegate which will be called for each attribute</param>
        /// <param name="processRoot">Indicates whether we need to call delegates for this entity as well.</param>
        public void Scan(Action<MetaEntity> entityHandler, Action<MetaEntityAttr> attrHandler, bool processRoot = true)
        {
            //do whatever you need with this entity
            if (processRoot && entityHandler != null) {
                entityHandler(this);
            }

            //run through all sub-entities
            foreach (MetaEntity ent in this.SubEntities) {
                ent.Scan(entityHandler, attrHandler, true);
            }

            if (processRoot && attrHandler != null) {
                //run through all attributes of this entity
                foreach (MetaEntityAttr attr in this.Attributes) {
                    attrHandler(attr);
                }
            }
        }

        int IComparable<MetaEntity>.CompareTo(MetaEntity ent)
        {
            return string.Compare(Name, ent.Name, true);
        }

        #region Saving/loading to/from JSON

        /// <summary>
        /// Writes the content of the entity to JSON (asynchronious way)
        /// </summary>
        /// <param name="writer">The writer.</param>
        /// <returns>Task.</returns>
        public async Task WriteToJsonAsync(JsonWriter writer)
        {
            await writer.WriteStartObjectAsync().ConfigureAwait(false);
            await WritePropertiesToJsonAsync(writer).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("attrs").ConfigureAwait(false);
            await Attributes.WriteToJsonAsync(writer).ConfigureAwait(false);

            if (SubEntities.Count > 0) {
                await writer.WritePropertyNameAsync("ents").ConfigureAwait(false);
                await SubEntities.WriteToJsonAsync(writer).ConfigureAwait(false);
            }

            await writer.WriteEndObjectAsync().ConfigureAwait(false);
        }

        /// <summary>
        /// Writes entity's properties to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer.</param>
        /// <returns>Task.</returns>
        protected virtual async Task WritePropertiesToJsonAsync(JsonWriter writer)
        {
            if (!string.IsNullOrEmpty(this.Id)) {
                await writer.WritePropertyNameAsync("id").ConfigureAwait(false);
                await writer.WriteValueAsync(Id).ConfigureAwait(false);
            }

            if (!string.IsNullOrEmpty(Name)) {
                await writer.WritePropertyNameAsync("name").ConfigureAwait(false);
                await writer.WriteValueAsync(Name).ConfigureAwait(false);
            }

            if (!string.IsNullOrEmpty(Description))  {
                await writer.WritePropertyNameAsync("desc").ConfigureAwait(false);
                await writer.WriteValueAsync(Description).ConfigureAwait(false);
            }

            if (UserData != null) {
                await writer.WritePropertyNameAsync("udata").ConfigureAwait(false);
                await writer.WriteValueAsync(UserData.ToString()).ConfigureAwait(false);
            }
        }

        /// <summary>Reads the entity content from JSON (asynchronous way).</summary>
        /// <param name="reader">The reader.</param>
        /// <returns>Task.</returns>
        /// <exception cref="BadJsonFormatException"></exception>
        public async Task ReadFromJsonAsync(JsonReader reader)
        {
            if (reader.TokenType != JsonToken.StartObject) {
                throw new BadJsonFormatException(reader.Path);
            }

            Attributes.Clear();
            SubEntities.Clear();

            while ((await reader.ReadAsync().ConfigureAwait(false))
                && reader.TokenType != JsonToken.EndObject) {

                if (reader.TokenType != JsonToken.PropertyName) {
                    throw new BadJsonFormatException(reader.Path);
                }

                var propName = reader.Value.ToString();
                if (propName == "attrs") {
                    await reader.ReadAsync().ConfigureAwait(false); //reading first StartArray token
                    await Attributes.ReadFromJsonAsync(reader).ConfigureAwait(false);
                }
                else if (propName == "ents") {
                    await reader.ReadAsync().ConfigureAwait(false); //reading first StartArray token
                    await SubEntities.ReadFromJsonAsync(reader).ConfigureAwait(false);
                }
                else {
                    await ReadOnePropertyFromJsonAsync(reader, propName).ConfigureAwait(false);
                }
            }
        }

        /// <summary>
        /// Reads one entity property from JSON (asynchronous way) or skips unused.
        /// </summary>
        /// <param name="reader">The reader.</param>
        /// <param name="propName">Name of the property.</param>
        /// <returns>Task.</returns>
        protected virtual async Task ReadOnePropertyFromJsonAsync(JsonReader reader, string propName)
        {
            switch (propName)
            {
                case "id":
                    Id = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                case "name":
                    Name = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                case "desc":
                    Description = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                case "udata":
                    UserData = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                default:
                    await reader.SkipAsync().ConfigureAwait(false);
                    break;
            }
        }

        #endregion //Saving/loading to/from JSON
    }

    /// <summary>
    /// Represents root entity in the model
    /// </summary>
    public class RootMetaEntity : MetaEntity
    {

        private MetaData model = null;

        /// <summary>
        /// Gets the model.
        /// </summary>
        /// <value>The model.</value>
        public override MetaData Model
        {
            get {
                return model;
            }
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="T:RootEntity"/> class.
        /// </summary>
        /// <param name="model">The model.</param>
        public RootMetaEntity(MetaData model) : base(null)
        {
            this.model = model;
        }
    }

    /// <summary>
    /// Represents list of entities
    /// </summary>
    public class EntityList : Collection<MetaEntity>
    {

        /// <summary>
        /// Sorts all items in this list by their names.
        /// </summary>
        public void SortByName()
        {
            List<MetaEntity> items = (List<MetaEntity>)Items;

            items.Sort();
        }

        /// <summary>
        /// Reorders entity attributes by index in increase order.
        /// </summary>
        public void Reorder()
        {
            List<MetaEntity> items = (List<MetaEntity>)Items;

            items.Sort((item1, item2) => item1.Index - item2.Index);
        }

    }

    /// <summary>
    /// Represents storage of entities
    /// </summary>
    public class EntityStore : EntityList
    {
        private MetaEntity _parentEntity = null;

        /// <summary>
        /// Initializes a new instance of the <see cref="T:EntityStore"/> class.
        /// </summary>
        /// <param name="parentEntity">The parent entity.</param>
        public EntityStore(MetaEntity parentEntity)
        {
            this._parentEntity = parentEntity;
        }

        /// <summary>Gets the model.</summary>
        /// <value>The model.</value>
        protected MetaData Model
        {
            get {
                return _parentEntity.Model;
            }
        }


        /// <summary>
        /// Inserts an element into the <see cref="T:System.Collections.ObjectModel.Collection`1"/> at the specified index.
        /// </summary>
        /// <param name="index">The zero-based index at which <paramref name="item"/> should be inserted.</param>
        /// <param name="item">The object to insert. The value can be null for reference types.</param>
        /// <exception cref="T:System.ArgumentOutOfRangeException">
        /// 	<paramref name="index"/> is less than zero.
        /// -or-
        /// <paramref name="index"/> is greater than <see cref="P:System.Collections.ObjectModel.Collection`1.Count"/>.
        /// </exception>
        protected override void InsertItem(int index, MetaEntity item)
        {
            if (item == this._parentEntity)
                throw new ArgumentException("Can't add an entity to itself");
            base.InsertItem(index, item);
            OnEntityInsertion(item, index);
        }

        /// <summary>
        /// Called on entity's insertion.
        /// </summary>
        /// <param name="entity">The entity.</param>
        /// <param name="index">The index.</param>
        protected virtual void OnEntityInsertion(MetaEntity entity, int index)
        {
            entity.Parent = _parentEntity;
            if (_parentEntity.Model != null) entity.OnModelAssignment();
        }

        /// <summary>
        /// Writes the list of entities to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">An instance of JsonWriter class.</param>
        /// <param name="rwOptions">Different read/write options.</param>
        /// <returns>Task.</returns>
        public async Task WriteToJsonAsync(JsonWriter writer)
        {
            await writer.WriteStartArrayAsync().ConfigureAwait(false);
            foreach (var ent in this) {
                await ent.WriteToJsonAsync(writer).ConfigureAwait(false);
            }
            await writer.WriteEndArrayAsync().ConfigureAwait(false);
        }

        /// <summary>Reads the list of entities from JSON (asynchronous way).</summary>
        /// <param name="reader">The reader.</param>
        /// <returns>Task.</returns>
        internal async Task ReadFromJsonAsync(JsonReader reader)
        {
            if (reader.TokenType != JsonToken.StartArray) {
                throw new BadJsonFormatException(reader.Path);
            }

            while ((await reader.ReadAsync().ConfigureAwait(false))
                && reader.TokenType != JsonToken.EndArray)
            {
                var ent = Model.CreateEntity(this._parentEntity);
                await ent.ReadFromJsonAsync(reader).ConfigureAwait(false);
                Add(ent);
            }
        }
    }
}
