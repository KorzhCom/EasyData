using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Newtonsoft.Json;

namespace EasyData
{

    public class EntityData 
    {
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
        /// Gets or sets the description.
        /// </summary>
        /// <value>The description.</value>
        public string Description { get; set; }

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
        /// Gets or sets the user data object associated with entity.
        /// </summary>
        /// <value></value>
        public object UserData { get; set; }

    }


    public class EntityNode<TEntityData, TAttributeData>: IComparable<EntityNode<TEntityData, TAttributeData>>
        where TEntityData: EntityData, new()
        where TAttributeData: AttributeData, new()
    {

        public readonly MetaData<TEntityData, TAttributeData> Model;

        public readonly EntityNodeStore<TEntityData, TAttributeData> SubEntities;

        public readonly AttributeNodeStore<TEntityData, TAttributeData> Attributes;

        public EntityNode<TEntityData, TAttributeData> Parent { get; internal set; }

        public bool IsRoot => Parent == null;

        protected EntityNode()
        {
            SubEntities = new EntityNodeStore<TEntityData, TAttributeData>(this);
            Attributes = new AttributeNodeStore<TEntityData, TAttributeData>(this);
        }

        internal EntityNode(MetaData<TEntityData, TAttributeData> model): this()
        {
            Model = model;
        }

        public EntityNode(EntityNode<TEntityData, TAttributeData> parent = null): this()
        {
            Parent = parent;
        }

        public TEntityData Data { get; set; } = new TEntityData();

        public string Id 
        {
            get => Data?.Id;
            set => Data.Id = value;
        }

        public string Name
        {
            get => Data?.Name;
            set => Data.Name = value;
        }

        public string Description
        {
            get => Data?.Description;
            set => Data.Description = value;
        }

        public object UserData
        {
            get => Data?.UserData;
            set => Data.UserData = value;
        }

        public Type ObjType
        {
            get => Data?.ObjType;
            set => Data.ObjType = value;
        }

        public string TypeName
        {
            get => Data?.TypeName;
            set => Data.TypeName = value;
        }

        public string DbSetName
        {
            get => Data?.DbSetName;
            set => Data.DbSetName = value;
        }

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
                if (Attributes.Count != 0) 
                    return false;

                foreach (var subEntity in SubEntities) {
                    if (!subEntity.IsEmpty) 
                        return false;
                }
                return true;
            }
        }


        /// <summary>
        /// Called when the entity is inserted into model.
        /// </summary>
        internal protected virtual void OnModelAssignment()
        {
            foreach (var ent in SubEntities)
                ent.OnModelAssignment();
            foreach (var attr in Attributes)
                attr.OnModelAssignment();
        }

        /// <summary>
        /// Finds a sub-entity in current entity by its name.
        /// </summary>
        /// <param name="entityName">Name of sub-entity we are srearching for</param>
        /// <returns>
        /// An Entity object with specified name or null if it cannot be found.
        /// </returns>
        public EntityNode<TEntityData, TAttributeData> FindSubEntity(string entityName)
        {
            EntityNode<TEntityData, TAttributeData> result = null;
            foreach (var subEntity in SubEntities) {
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
        /// Gets the first attribute in all attributes and sub-entities of the current entity.
        /// </summary>
        /// <returns>An Attribute object.</returns>
        public AttributeNode<TEntityData, TAttributeData> GetFirstLeaf()
        {
            if (Attributes.Count > 0)
                return Attributes[0];

            foreach (var subEntity in SubEntities) {
                var result = subEntity.GetFirstLeaf();
                if (result != null) 
                    return result;
            }

            return null;
        }

       public AttributeNode<TEntityData, TAttributeData> FindAttributeById(string id) 
       {
            return FindAttribute(attr => attr.ID == id);
       }

        public AttributeNode<TEntityData, TAttributeData> FindAttributeByCaption(string caption)
        {
            return FindAttribute(attr => attr.Caption == caption);
        }

        public AttributeNode<TEntityData, TAttributeData> FindAttributeByExpression(string expr)
        {
            return FindAttribute(attr => attr.CompareWithExpr(expr));
        }

        public AttributeNode<TEntityData, TAttributeData> FindAttribute(Func<AttributeNode<TEntityData, TAttributeData>, bool> predicate)
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
        /// Scans all child entities and attributes (including this one one) calls entityHandler and attrHanlder delegates (correspondingly) for each of them
        /// </summary>
        /// <param name="entityHandler">The delegate which will be called for each entity.</param>
        /// <param name="attrHandler">The delegate which will be called for each attribute</param>
        /// <param name="processRoot">Indicates whether we need to call delegates for this entity as well.</param>
        public void Scan(Action<EntityNode<TEntityData, TAttributeData>> entityHandler, 
            Action<AttributeNode<TEntityData, TAttributeData>> attrHandler, bool processRoot = true)
        {
            //do whatever you need with this entity
            if (processRoot && entityHandler != null) {
                entityHandler(this);
            }

            //run through all sub-entities
            foreach (var ent in this.SubEntities) {
                ent.Scan(entityHandler, attrHandler, true);
            }

            if (processRoot && attrHandler != null) {

                //run through all attributes of this entity
                foreach (var attr in this.Attributes) {
                    attrHandler(attr);
                }
            }
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
        public int DeleteSubEntities(Func<EntityNode<TEntityData, TAttributeData>, bool> entityToDeleteFilter)
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

        public int CompareTo(EntityNode<TEntityData, TAttributeData> other)
        {
            return string.Compare(Name, other.Name, true);
        }

        #region Saving/loading to/from JSON

        /// <summary>
        /// Writes the content of the entity to JSON (asynchronious way)
        /// </summary>
        /// <param name="writer">The writer.</param>
        /// <param name="options">Some read/write options.</param>
        /// <returns>Task.</returns>
        public async Task WriteToJsonAsync(JsonWriter writer, BitOptions options)
        {
            await writer.WriteStartObjectAsync().ConfigureAwait(false);
            await WritePropertiesToJsonAsync(writer).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("attrs").ConfigureAwait(false);
            await Attributes.WriteToJsonAsync(writer, options).ConfigureAwait(false);

            if (SubEntities.Count > 0) {
                await writer.WritePropertyNameAsync("ents").ConfigureAwait(false);
                await SubEntities.WriteToJsonAsync(writer, options).ConfigureAwait(false);
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
            if (!string.IsNullOrEmpty(Id)) {
                await writer.WritePropertyNameAsync("id").ConfigureAwait(false);
                await writer.WriteValueAsync(Id).ConfigureAwait(false);
            }

            if (!string.IsNullOrEmpty(Name)) {
                await writer.WritePropertyNameAsync("name").ConfigureAwait(false);
                await writer.WriteValueAsync(Name).ConfigureAwait(false);
            }

            if (string.IsNullOrEmpty(Description)) {
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
                && reader.TokenType != JsonToken.EndObject)
            {

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
    /// Represents list of entities
    /// </summary>
    public class EntityNodeList<TEntityData, TAttributeData> : Collection<EntityNode<TEntityData, TAttributeData>> 
        where TEntityData: EntityData, new()
        where TAttributeData: AttributeData, new()
    {

        /// <summary>
        /// Sorts all items in this list by their names.
        /// </summary>
        public void SortByName()
        {
            var items = (List<EntityNode<TEntityData, TAttributeData>>)Items;
            items.Sort();
        }

        /// <summary>
        /// Reorders entity attributes by index in increase order.
        /// </summary>
        public void Reorder()
        {
            var items = (List<EntityNode<TEntityData, TAttributeData>>)Items;
            items.Sort((item1, item2) => item1.Index - item2.Index);
        }

    }

    /// <summary>
    /// Represents storage of entities
    /// </summary>
    public class EntityNodeStore<TEntityData, TEntityAttrData> : EntityNodeList<TEntityData, TEntityAttrData>
        where TEntityData: EntityData, new()
        where TEntityAttrData: AttributeData, new()
    {
        private EntityNode<TEntityData, TEntityAttrData> _parentEntity = null;

        /// <summary>
        /// Initializes a new instance of the <see cref="T:EntityStore"/> class.
        /// </summary>
        /// <param name="parentEntity">The parent entity.</param>
        public EntityNodeStore(EntityNode<TEntityData, TEntityAttrData> parentEntity)
        {
            _parentEntity = parentEntity;
        }

        /// <summary>Gets the model.</summary>
        /// <value>The model.</value>
        protected MetaData<TEntityData, TEntityAttrData> Model => _parentEntity?.Model;

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
        protected override void InsertItem(int index, EntityNode<TEntityData, TEntityAttrData> item)
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
        protected virtual void OnEntityInsertion(EntityNode<TEntityData, TEntityAttrData> entity, int index)
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
        /// <returns>Task.</returns>
        public async Task WriteToJsonAsync(JsonWriter writer, BitOptions rwOptions)
        {
            await writer.WriteStartArrayAsync().ConfigureAwait(false);
            foreach (var ent in this) {
                await ent.WriteToJsonAsync(writer, rwOptions).ConfigureAwait(false);
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
                var ent = new EntityNode<TEntityData, TEntityAttrData>(_parentEntity);
                await ent.ReadFromJsonAsync(reader).ConfigureAwait(false);
                Add(ent);
            }
        }
    }
}
