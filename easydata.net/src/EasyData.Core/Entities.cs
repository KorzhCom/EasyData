using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading;
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
            Attributes = CreateEntityAttrStore();
            SubEntities = CreateEntityStore();
        }

        protected MetaData _model { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="T:Korzh.EasyData.MetaEntity"/> class.
        /// </summary>
        /// <param name="model">The mofrl.</param>
        protected internal MetaEntity(MetaData model)
        {
            _model = model;
            Attributes = CreateEntityAttrStore();
            SubEntities = CreateEntityStore();
        }

        protected virtual MetaEntityStore CreateEntityStore()
        { 
            return new MetaEntityStore(this);
        }

        protected virtual MetaEntityAttrStore CreateEntityAttrStore()
        {
            return new MetaEntityAttrStore(this);
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
        /// Gets or sets the name of the entity in plural form.
        /// </summary>
        /// <value>Entity name</value>
        public string NamePlural { get; set; }

        /// <summary>
        /// Gets ot sets a value indicating whether this entity is editable
        /// </summary>
        public bool IsEditable { get; set; } = true;


        /// <summary>
        /// Gets or sets the type of the entity.
        /// </summary>
        /// <value>The type of the entity.</value>
        public Type ClrType { get; set; }


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
        /// Gets or sets the index of the entity
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
        public virtual MetaEntityStore SubEntities { get; protected set; }

        /// <summary>
        /// List of Attributes that belong to this entity.
        /// </summary>
        public virtual MetaEntityAttrStore Attributes { get; protected set; }


        /// <summary>
        /// Gets the model.
        /// </summary>
        /// <value>The model.</value>
        public virtual MetaData Model => _model ?? Parent?.Model;

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
        /// <param name="id">The ID of the attribute we are looking for.</param>
        /// <returns>MetaEntityAttr.</returns>
        public MetaEntityAttr FindAttributeById(string id)
        {
            return FindAttribute(attr => attr.Id == id);
        }

        /// <summary>
        /// Finds the attribute by its caption.
        /// </summary>
        /// <param name="caption">The caption.</param>
        /// <returns>MetaEntityAttr.</returns>
        public MetaEntityAttr FindAttributeByCaption(string caption)
        {
            return FindAttribute(attr => attr.Caption == caption);
        }

        /// <summary>Finds the attribute by its expression.</summary>
        /// <param name="expr">The expression that represents the attribute.
        /// Must be a combination of the entity name and attribute's name.
        /// For example: "Customer.CompanyName". Or "Order.OrderDate".</param>
        /// <returns>MetaEntityAttr.</returns>
        public MetaEntityAttr FindAttributeByExpression(string expr)
        {
            return FindAttribute(attr => attr.CompareWithExpr(expr));
        }

        /// <summary>Finds the attribute using a predicate function.</summary>
        /// <param name="predicate">The predicate.</param>
        /// <returns>MetaEntityAttr.</returns>
        public MetaEntityAttr FindAttribute(Func<MetaEntityAttr, bool> predicate)
        {
            var result = Attributes.FirstOrDefault(predicate);
            if (result == null) {
                foreach (var subEntity in SubEntities) {
                    result = subEntity.FindAttribute(predicate);
                    if (result != null)
                        break;
                }
            }
            return result;
        }


        /// <summary>
        /// Finds a sub-entity by its name.
        /// </summary>
        /// <param name="entityName">Name of the sub-entity we are srearching for</param>
        /// <returns>
        /// An Entity object with specified name or null if it cannot be found.
        /// </returns>
        public MetaEntity FindSubEntity(string entityName)
        {
            MetaEntity result = null;
            foreach (MetaEntity subEntity in SubEntities) {
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

        /// <summary>Finds the attribute using a predicate function.</summary>
        /// <param name="predicate">The predicate.</param>
        /// <returns>MetaEntityAttr.</returns>
        public MetaEntity FindEntity(Func<MetaEntity, bool> predicate)
        {
            foreach (MetaEntity subEntity in SubEntities) {
                if (predicate(subEntity)) {
                    return subEntity;
                }

                var result = subEntity.FindEntity(predicate);
                if (result != null) return result;
            }

            return null;
        }

        /// <summary>
        /// Deletes the sub-entities specified by name(s) passed in method's parameter(s).
        /// </summary>
        /// <param name="namesToDelete">The names of the entities to delete.</param>
        /// <returns>The amount of deleted entities</returns>
        public int DeleteSubEntities(params string[] namesToDelete)
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
        /// <param name="options">Some read/write options.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        public async Task WriteToJsonAsync(JsonWriter writer, BitOptions options, CancellationToken ct = default)
        {
            await writer.WriteStartObjectAsync(ct).ConfigureAwait(false);
            await WritePropertiesToJsonAsync(writer, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("attrs", ct).ConfigureAwait(false);
            await Attributes.WriteToJsonAsync(writer, options, ct).ConfigureAwait(false);

            if (SubEntities.Count > 0) {
                await writer.WritePropertyNameAsync("ents", ct).ConfigureAwait(false);
                await SubEntities.WriteToJsonAsync(writer, options, ct).ConfigureAwait(false);
            }

            await writer.WriteEndObjectAsync(ct).ConfigureAwait(false);
        }

        /// <summary>
        /// Writes entity's properties to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        protected virtual async Task WritePropertiesToJsonAsync(JsonWriter writer, CancellationToken ct)
        {
            if (!string.IsNullOrEmpty(Id)) {
                await writer.WritePropertyNameAsync("id", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(Id, ct).ConfigureAwait(false);
            }

            if (!string.IsNullOrEmpty(Name)) {
                await writer.WritePropertyNameAsync("name", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(Name, ct).ConfigureAwait(false);
            }

            if (!string.IsNullOrEmpty(NamePlural)) {
                await writer.WritePropertyNameAsync("namePlur", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(NamePlural, ct).ConfigureAwait(false);
            }

            if (!string.IsNullOrEmpty(Description))  {
                await writer.WritePropertyNameAsync("desc", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(Description, ct).ConfigureAwait(false);
            }

            if (UserData != null) {
                await writer.WritePropertyNameAsync("udata", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(UserData.ToString(), ct).ConfigureAwait(false);
            }

            if (!IsEditable) {
                await writer.WritePropertyNameAsync("ied", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(IsEditable, ct).ConfigureAwait(false);
            }
        }

        /// <summary>Reads the entity content from JSON (asynchronous way).</summary>
        /// <param name="reader">The reader.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        /// <exception cref="BadJsonFormatException"></exception>
        public async Task ReadFromJsonAsync(JsonReader reader, CancellationToken ct = default)
        {
            if (reader.TokenType != JsonToken.StartObject) {
                throw new BadJsonFormatException(reader.Path);
            }

            Attributes.Clear();
            SubEntities.Clear();

            while ((await reader.ReadAsync(ct).ConfigureAwait(false))
                && reader.TokenType != JsonToken.EndObject) {

                if (reader.TokenType != JsonToken.PropertyName) {
                    throw new BadJsonFormatException(reader.Path);
                }

                var propName = reader.Value.ToString();
                if (propName == "attrs") {
                    await reader.ReadAsync(ct).ConfigureAwait(false); //reading first StartArray token
                    await Attributes.ReadFromJsonAsync(reader, ct).ConfigureAwait(false);
                }
                else if (propName == "ents") {
                    await reader.ReadAsync().ConfigureAwait(false); //reading first StartArray token
                    await SubEntities.ReadFromJsonAsync(reader, ct).ConfigureAwait(false);
                }
                else {
                    await ReadOnePropertyFromJsonAsync(reader, propName, ct).ConfigureAwait(false);
                }
            }
        }

        /// <summary>
        /// Reads one entity property from JSON (asynchronous way) or skips unused.
        /// </summary>
        /// <param name="reader">The reader.</param>
        /// <param name="propName">Name of the property.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        protected virtual async Task ReadOnePropertyFromJsonAsync(JsonReader reader, string propName, CancellationToken ct)
        {
            switch (propName)
            {
                case "id":
                    Id = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "name":
                    Name = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "namePlur":
                    NamePlural = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "desc":
                    Description = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "udata":
                    UserData = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "ied":
                    IsEditable = (await reader.ReadAsBooleanAsync(ct).ConfigureAwait(false)).Value;
                    break;
                default:
                    await reader.SkipAsync(ct).ConfigureAwait(false);
                    break;
            }
        }

        #endregion //Saving/loading to/from JSON
    }

    /// <summary>
    /// Represents list of entities
    /// </summary>
    public class MetaEntityList : Collection<MetaEntity>
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
            var items = (List<MetaEntity>)Items;

            items.Sort((item1, item2) => item1.Index - item2.Index);
        }
    }


    /// <summary>
    /// Represents storage of entities
    /// </summary>
    public class MetaEntityStore: MetaEntityList
    {
        private MetaEntity _parentEntity = null;

        /// <summary>
        /// Initializes a new instance of the <see cref="T:EntityStore"/> class.
        /// </summary>
        /// <param name="parentEntity">The parent entity.</param>
        public MetaEntityStore(MetaEntity parentEntity)
        {
            _parentEntity = parentEntity;
        }

        /// <summary>Gets the model.</summary>
        /// <value>The model.</value>
        protected MetaData Model => _parentEntity.Model;

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
            if (item == _parentEntity)
                throw new ArgumentException("Can't add an entity to itself");
            if (item.Parent != null && item.Parent != _parentEntity) {
                item.Parent.SubEntities.Remove(item);
            }
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
            if (_parentEntity.Model != null) 
                entity.OnModelAssignment();
        }

        /// <summary>
        /// Writes the list of entities to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">An instance of JsonWriter class.</param>
        /// <param name="rwOptions">Different read/write options.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        public async Task WriteToJsonAsync(JsonWriter writer, BitOptions rwOptions, CancellationToken ct = default)
        {
            await writer.WriteStartArrayAsync(ct).ConfigureAwait(false);
            foreach (var ent in this) {
                await ent.WriteToJsonAsync(writer, rwOptions, ct).ConfigureAwait(false);
            }
            await writer.WriteEndArrayAsync(ct).ConfigureAwait(false);
        }

        /// <summary>Reads the list of entities from JSON (asynchronous way).</summary>
        /// <param name="reader">The reader.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        public async Task ReadFromJsonAsync(JsonReader reader, CancellationToken ct = default)
        {
            if (reader.TokenType != JsonToken.StartArray) {
                throw new BadJsonFormatException(reader.Path);
            }

            while ((await reader.ReadAsync(ct).ConfigureAwait(false))
                && reader.TokenType != JsonToken.EndArray)
            {
                var ent = Model.CreateEntity(_parentEntity);
                await ent.ReadFromJsonAsync(reader, ct).ConfigureAwait(false);
                Add(ent);
            }
        }
    }
}
