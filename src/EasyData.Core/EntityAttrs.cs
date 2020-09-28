using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

using Newtonsoft.Json;

namespace EasyData
{
    /// <summary>
    /// Represents attribute property used in FindAttribute methods
    /// </summary>
    public enum EntityAttrProp
    {
        /// <summary>
        /// Attribute ID
        /// </summary>
        ID,

        /// <summary>
        /// Attribute caption
        /// </summary>
        Caption,

        /// <summary>
        /// Some expression (should be defined in descendants). Same as ID for <see cref="Entity"/> class.
        /// </summary>
        Expression
    }


    /// <summary>
    /// Represents one entity attribute of data model.
    /// </summary>
    /// <remarks>
    /// Usually Attribute object represents some field in database table 
    /// but it also can represent more complicated attributes.
    /// For the user who works with query builder entity attribute - 
    /// is something that he(she) understand well and can operate with.
    /// For example: "name of the company" or "payment method" 
    /// but not the "payment method internal id" which is stored in database.
    /// </remarks>
    public class EntityAttr : IComparable<EntityAttr>
    {
        /// <summary>
        /// Gets or sets the ID.
        /// </summary>
        /// <value>ID string.</value>
        /// <remarks>
        /// ID represents internal entityAttr attribute id which is not shown to user 
        /// but is used for storing data model in external files.
        /// </remarks>
        public string ID { get; set; }

        /// <summary>Gets or sets a value indicating whether this attribute is nullable.</summary>
        /// <value>
        ///   <c>true</c> if this instance is nullable; otherwise, <c>false</c>.</value>
        public bool IsNullable { get; set; }

        /// <summary>
        /// Gets or sets the property information.
        /// </summary>
        /// <value>The property information.</value>
        public PropertyInfo PropInfo { get; set; }

        /// <summary>
        /// Gets or sets the name of the property.
        /// </summary>
        /// <value>The name of the property.</value>
        public string PropName { get; set; }

        /// <summary>
        /// Gets or sets the name of the column associated with property (in EntityFramework context definition).
        /// </summary>
        /// <value>The name of the associated column.</value>
        public string ColumnName { get; set; }

        /// <summary>
        /// Gets or sets the index of EntityAttr
        /// </summary>
        public int Index { get; set; } = int.MaxValue;

        /// <summary>
        /// Attribute expression
        /// </summary>
        protected string expr = "";

        internal string _lookupAttrId = null;
        private EntityAttr _lookupAttr = null;

        /// <summary>
        /// Gets ot sets a value indicating wether Attribute is primary a key
        /// </summary>
        public bool IsPrimaryKey { get; set; } = false;

        /// <summary>
        /// Gets the lookup attribute.
        /// </summary>
        public EntityAttr LookupAttr
        {
            get {
                if (_lookupAttr == null)
                {
                    CheckModel();
                    _lookupAttr = string.IsNullOrEmpty(_lookupAttrId) ? null : Model.GetAttributeByID(_lookupAttrId, false);

                }

                return _lookupAttr;
            }

            set {
                _lookupAttr = value;
                if (value != null)
                {
                    _lookupAttrId = value.ID;
                    _lookupAttr._lookupAttrId = this.ID;
                }
                else
                    _lookupAttrId = null;
            }
        }

        /// <summary>
        /// Gets the model.
        /// </summary>
        /// <value>The model.</value>
        public virtual DataModel Model
        {
            get { return Entity?.Model; }
        }


        /// <summary>
        /// Checks the Model property and raises an exception if it's null.
        /// </summary>
        /// <exception cref="DataModel.Error">
        /// Entity is not specified for attribute:  + {attribute ID}
        /// or
        /// Model is not specified for entity:  + {entity ID}
        /// </exception>
        protected void CheckModel()
        {
            if (Entity == null)
            {
                throw new DataModel.Error("Entity is not specified for attribute: " + this.ID);
            }

            if (Model == null)
            {
                Entity ent = Entity;
                while (ent.Parent != null) ent = ent.Parent;
                throw new DataModel.Error(string.Format("Model is not specified for entity: {0}, root: {1}", ent.Name, ent.IsRoot.ToString()));
            }
        }


        /// <summary>
        /// Gets or sets the entity.
        /// </summary>
        /// <value>The entity.</value>
        public Entity Entity { get; internal set; }


        /// <summary>
        /// Called when model is assigned.
        /// </summary>
        public virtual void OnModelAssignment() {}

        private bool _isAggregate = false;

        /// <summary>
        /// Gets or sets a value indicating whether this attribute represents some aggregate column.
        /// </summary>
        /// <value>
        /// 	<c>true</c> if this attribute represents some aggregate column; otherwise, <c>false</c>.
        /// </value>
        public bool IsAggregate
        {
            get { return _isAggregate; }
            set {
                if (IsVirtual)
                {
                    _isAggregate = value;
                }
            }
        }

        private bool _hasSubQuery = false;

        /// <summary>
        /// Gets or sets a value indicating whether this attribute includes a sub-query in its expression.
        /// </summary>
        /// <value><c>true</c> if this attribute includes a sub-query in its expression; otherwise, <c>false</c>.</value>
        public bool HasSubQuery
        {
            get { return _hasSubQuery; }
            set {
                if (IsVirtual)
                {
                    _hasSubQuery = value;
                }
            }
        }


        /// <summary>
        /// Gets or sets a value indicating whether the attribute can be used in query conditions.
        /// </summary>
        /// <value>
        /// 	<see langword="true"/> if attribute can be used in query conditions; otherwise, <see langword="false"/>.
        /// </value>
        public bool UseInConditions { get; set; } = true;

        /// <summary>
        /// Gets or sets a value indicating whether the attribute can be used in result columns (SELECT clause).
        /// </summary>
        /// <value>
        /// 	<see langword="true"/> if attribute can be used in result columns; otherwise, <see langword="false"/>.
        /// </value>
        public bool UseInResult { get; set; } = true;

        /// <summary>
        /// Gets or sets a value indicating whether the attribute can be used in sorting.
        /// </summary>
        /// <value><c>true</c> if attribute can be used in sorting; otherwise, <c>false</c>.</value>
        public bool UseInSorting { get; set; } = true;


        /// <summary>
        /// Hides this entity attribute. 
        /// It means that this function just sets all UseInResult, UseInConditions and UseInSorting properties to <c>false</c>.
        /// </summary>
        public void Hide()
        {
            UseInResult = false;
            UseInConditions = false;
            UseInSorting = false;
        }


        /// <summary>
        /// Gets or sets the entityAttr attribute caption.
        /// </summary>
        /// <value>Caption text</value>
        /// <remarks> Caption is the public representation of entityAttr.
        /// It must have clear and understandable name. 
        /// Example: "Company name" is a good caption 
        /// but "CName" - is bad.
        /// </remarks>
        public string Caption { get; set; }

        /// <summary>
        /// Gets or sets the description of entity attribute.
        /// </summary>
        /// <value>The description of entity attribute.</value>
        public string Description { get; set; } = "";


        /// <summary>
        /// Indicates if this attribute is a virtual (calculate) one.
        /// </summary>
        public bool IsVirtual { get; internal set; } = false;

        /// <summary>
        /// Initializes a new instance of the <see cref="Attribute"/> class.
        /// </summary>
        public EntityAttr() : this(null, false)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="T:Korzh.EasyQuery.EntityAttr" /> class.
        /// </summary>
        /// <param name="parentEntity">The parent entity.</param>
        /// <param name="isVirtual">if set to <c>true</c> the created attribute will be virtual (calculated).</param>
        public EntityAttr(Entity parentEntity, bool isVirtual = false)
        {
            Entity = parentEntity;
            IsVirtual = isVirtual;
        }

        /// <summary>
        /// Gets or sets the type of data represented by attribute.
        /// </summary>
        /// <value>DataType value.</value>
        public DataType DataType { get; set; }

        /// <summary>
        /// Gets or sets the size of data represented by attribute.
        /// </summary>
        /// <value></value>
        public int Size { get; set; }

        /// <summary>
        /// Gets or sets the attribute expression.
        /// </summary>
        /// <value>Text that represents attribute expression. 
        /// Can be simply field name for EntAttrKind.Data attributes or 
        /// more complicated SQL expression composed of several fields, operators and functions.</value>
        public string Expr
        {
            get { return expr; }
            set {
                if (expr != value)
                {
                    expr = value;
                    if (IsVirtual)
                    {
                        ProcessVirtualExpr();
                    }
                }
            }
        }

        /// <summary>
        /// Scans attribute's expression for new parameters, tables, etc
        /// </summary>
        protected virtual void ProcessVirtualExpr()
        {
            ExtractParams();
        }

        /// <summary>
        /// Gets the full expression of entity attribute.
        /// </summary>
        /// <value>
        /// The full expression.
        /// </value>
        public string FullExpr
        {
            get {
                return IsVirtual ? this.Expr : GetDataAttrFullExpr();
            }
        }


        /// <summary>
        /// Gets full expression of the entity attribute.
        /// </summary>
        /// <returns></returns>
        protected virtual string GetDataAttrFullExpr()
        {
            return Entity.GetFullName(".") + ':' + this.Expr;
        }


        /// <summary>
        /// Gets or sets the custom function.
        /// </summary>
        /// <value>
        /// The custom function.
        /// </value>
        public string CustomFunc { get; set; }

        /// <summary>
        /// Gets or sets the user data object assosiated with attribute.
        /// </summary>
        /// <value></value>
        public object UserData { get; set; }

        internal bool _isGhost = false;

        /// <summary>
        /// Gets a value indicating whether this is a "ghost attribute" - an attribute which was not found in the model.
        /// </summary>
        /// <value><c>true</c> if this instance is a "ghost attribute"; otherwise, <c>false</c>.</value>
        public bool IsGhost
        {
            get { return _isGhost; }
        }


        /// <summary>
        /// Determines whether this attribute has parameters in its expression.
        /// </summary>
        /// <returns><c>true</c> if this attribute has parameters; otherwise, <c>false</c>.</returns>
        public virtual bool HasParams()
        {
            return Params.Count > 0;
        }

        /// <summary>
        /// Parse attribute's expression and extract all parameters (like @Param1) used there.
        /// </summary>
        protected virtual void ExtractParams()
        {
            Params.ExtractFromExpr(this.Expr);
        }

        /// <summary>
        /// Compares attribute's expression with the one passed in the parameter.
        /// </summary>
        /// <param name="expr">The expression definition to compare with</param>
        /// <returns><c>true</c> if our attribute's expression is equal to the one passed in the parameter, <c>false</c> otherwise.</returns>
        public virtual bool CompareWithExpr(string expr)
        {
            return string.Compare(Expr, expr, StringComparison.InvariantCultureIgnoreCase) == 0;
        }

        /// <summary>
        /// Copies all attribute's properties from another entity attribute
        /// </summary>
        /// <param name="attr">An EntityAttr object to copy from.</param>
        public virtual void CopyFrom(EntityAttr attr)
        {
            Caption = attr.Caption;
            CustomFunc = attr.CustomFunc;
            DataType = attr.DataType;
            Description = attr.Description;
            Expr = attr.Expr;
            ID = attr.ID;
            IsVirtual = attr.IsVirtual;
            _lookupAttrId = attr._lookupAttrId;
            Size = attr.Size;
            UseInConditions = attr.UseInConditions;
            UseInResult = attr.UseInResult;
            UseInSorting = attr.UseInSorting;
            UserData = attr.UserData;
        }

        /// <summary>
        /// Compares the current instance with another EntityAttr object 
        /// and returns an integer that indicates whether the current instance precedes, 
        /// follows, or occurs in the same position in the sort order as the other object.
        /// </summary>
        /// <param name="attr">The entity attribute.</param>
        /// <returns>An integer that indicates whether the current instance precedes, 
        /// follows, or occurs in the same position in the sort order as the other object</returns>
        int IComparable<EntityAttr>.CompareTo(EntityAttr attr)
        {
            return this.Caption.CompareToCI(attr.Caption);
        }

        /// <summary>
        /// Adds all query parameters used in this attribute to the list passed via paramList.
        /// </summary>
        /// <param name="paramList">The list where to add the attribute's parameters to.</param>
        public virtual void AddParamsTo(QueryParamList paramList)
        {
        }

        /// <summary>
        /// Writes attribute's content to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer.</param>
        /// <param name="rwOptions">The model's read/write options.</param>
        /// <returns>Task.</returns>
        internal async Task WriteToJsonAsync(JsonWriter writer, MetaDataReadWriterOptions rwOptions)
        {
            await writer.WriteStartObjectAsync().ConfigureAwait(false);
            await WritePropertiesToJsonAsync(writer, rwOptions).ConfigureAwait(false);
            await writer.WriteEndObjectAsync().ConfigureAwait(false);
        }

        /// <summary>
        /// Writes attribute properties to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer</param>
        /// <param name="rwOptions">Some read/write options</param>
        /// <returns>Task.</returns>
        protected virtual async Task WritePropertiesToJsonAsync(JsonWriter writer, MetaDataReadWriterOptions rwOptions)
        {
            await writer.WritePropertyNameAsync("id").ConfigureAwait(false);
            await writer.WriteValueAsync(ID).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("cptn").ConfigureAwait(false);
            await writer.WriteValueAsync(Caption).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("dtype").ConfigureAwait(false);
            await writer.WriteValueAsync(DataType.ToInt()).ConfigureAwait(false);

            if (IsVirtual)
            {
                await writer.WritePropertyNameAsync("virtual").ConfigureAwait(false);
                await writer.WriteValueAsync(IsVirtual).ConfigureAwait(false);
            }

            if (HasSubQuery)
            {
                await writer.WritePropertyNameAsync("subq").ConfigureAwait(false);
                await writer.WriteValueAsync(HasSubQuery).ConfigureAwait(false);
            }

            await writer.WritePropertyNameAsync("size").ConfigureAwait(false);
            await writer.WriteValueAsync(Size).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("uir").ConfigureAwait(false);
            await writer.WriteValueAsync(UseInResult).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("uic").ConfigureAwait(false);
            await writer.WriteValueAsync(UseInConditions).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("uis").ConfigureAwait(false);
            await writer.WriteValueAsync(UseInSorting).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("ipk").ConfigureAwait(false);
            await writer.WriteValueAsync(IsPrimaryKey).ConfigureAwait(false);

            if (this.LookupAttr != null)
            {
                await writer.WritePropertyNameAsync("lattr").ConfigureAwait(false);
                await writer.WriteValueAsync(LookupAttr.ID).ConfigureAwait(false);
            }

            if (_defaultOperator != null)
            {
                await writer.WritePropertyNameAsync("dfop").ConfigureAwait(false);
                await writer.WriteValueAsync(_defaultOperator.ID).ConfigureAwait(false);
            }

            //we save only as custom operator group currently
            await writer.WritePropertyNameAsync("opg").ConfigureAwait(false);
            await writer.WriteValueAsync(OperatorGroupKind.Custom).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("ops").ConfigureAwait(false);

            //saving the list of operators' IDs
            await writer.WriteStartArrayAsync().ConfigureAwait(false);
            foreach (var op in this.Operations)
            {
                await writer.WriteValueAsync(op.ID).ConfigureAwait(false);
            }
            await writer.WriteEndArrayAsync().ConfigureAwait(false);

            if (this.Params.Count > 0)
            {
                await writer.WritePropertyNameAsync("prms").ConfigureAwait(false);
                await Params.WriteToJsonAsync(writer).ConfigureAwait(false);
            }

            if (this.DefaultEditor != null)
            {
                await writer.WritePropertyNameAsync("edtr").ConfigureAwait(false);
                await writer.WriteValueAsync(DefaultEditor.Id).ConfigureAwait(false);
            }

            if (!string.IsNullOrEmpty(this.Description))
            {
                await writer.WritePropertyNameAsync("desc").ConfigureAwait(false);
                await writer.WriteValueAsync(Description).ConfigureAwait(false);
            }

            if (UserData != null)
            {
                await writer.WritePropertyNameAsync("udata").ConfigureAwait(false);
                await writer.WriteValueAsync(UserData.ToString()).ConfigureAwait(false);
            }

            if ((rwOptions & MetaDataReadWriterOptions.DbInfo) > 0)
            {
                await writer.WritePropertyNameAsync("expr").ConfigureAwait(false);
                await writer.WriteValueAsync(Expr).ConfigureAwait(false);

                await writer.WritePropertyNameAsync("cfunc").ConfigureAwait(false);
                await writer.WriteValueAsync(CustomFunc).ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Reads the attribute content from JSON (asynchronous way).
        /// </summary>
        /// <param name="reader">A JsonReader.</param>
        /// <returns>Task.</returns>
        /// <exception cref="BadJsonFormatException">
        /// </exception>
        public async Task ReadFromJsonAsync(JsonReader reader)
        {
            if (reader.TokenType != JsonToken.StartObject)
            {
                throw new BadJsonFormatException(reader.Path);
            }

            while ((await reader.ReadAsync().ConfigureAwait(false))
                && reader.TokenType != JsonToken.EndObject)
            {

                if (reader.TokenType != JsonToken.PropertyName)
                {
                    throw new BadJsonFormatException(reader.Path);
                }

                var propName = reader.Value.ToString();
                await ReadPropertyFromJsonAsync(reader, propName).ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Reads one attribute's property from JSON (asynchronous way).
        /// </summary>
        /// <param name="reader">A JsonReader.</param>
        /// <param name="propName">Name of the property.</param>
        /// <returns>Task.</returns>
        protected virtual async Task ReadPropertyFromJsonAsync(JsonReader reader, string propName)
        {
            switch (propName)
            {
                case "id":
                    ID = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                case "cptn":
                    Caption = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                case "dtype":
                    DataType = (await reader.ReadAsInt32Async().ConfigureAwait(false))
                        .Value.IntToDataType();
                    break;
                case "virtual":
                    IsVirtual = (await reader.ReadAsBooleanAsync().ConfigureAwait(false)).Value;
                    break;
                case "subq":
                    HasSubQuery = (await reader.ReadAsBooleanAsync().ConfigureAwait(false)).Value;
                    break;
                case "size":
                    Size = (await reader.ReadAsInt32Async().ConfigureAwait(false)).Value;
                    break;
                case "uir":
                    UseInResult = (await reader.ReadAsBooleanAsync().ConfigureAwait(false)).Value;
                    break;
                case "uic":
                    UseInConditions = (await reader.ReadAsBooleanAsync().ConfigureAwait(false)).Value;
                    break;
                case "uis":
                    UseInSorting = (await reader.ReadAsBooleanAsync().ConfigureAwait(false)).Value;
                    break;
                case "ipk":
                    IsPrimaryKey = (await reader.ReadAsBooleanAsync().ConfigureAwait(false)).Value;
                    break;
                case "lattr":
                    _lookupAttrId = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                case "dfop":
                    _defaultOperator = Model.Operators.FindByID(await reader.ReadAsStringAsync().ConfigureAwait(false));
                    break;
                case "opg":
                    await reader.SkipAsync().ConfigureAwait(false);
                    break;
                case "ops":
                    await reader.ReadAsync().ConfigureAwait(false); //reading array start

                    while ((await reader.ReadAsync().ConfigureAwait(false))
                        && reader.TokenType != JsonToken.EndArray)
                    {
                        var opid = reader.Value.ToString();
                        var op = Model.Operators.FindByID(opid);
                        if (op != null)
                        {
                            Operations.Add(op);
                        }
                    }
                    break;
                case "prms":
                    await reader.ReadAsync().ConfigureAwait(false); //reading array start
                    await Params.ReadFromJsonAsync(reader).ConfigureAwait(false);
                    break;
                case "edtr":
                    DefaultEditor = Model.Editors.FindByID(await reader.ReadAsStringAsync().ConfigureAwait(false));
                    break;
                case "desc":
                    Description = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                case "udata":
                    UserData = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                case "expr":
                    Expr = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                case "cfunc":
                    CustomFunc = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                default:
                    await reader.SkipAsync().ConfigureAwait(false);
                    break;
            }
        }
    }
    
    /// <summary>
    /// Represents list of entity attributes
    /// </summary>
    public class EntityAttrList : Collection<EntityAttr>
    {
        /// <summary>
        /// Orders list of attributes by their captions.
        /// </summary>
        public void SortByCaption()
        {
            List<EntityAttr> items = (List<EntityAttr>)Items;

            items.Sort();
        }

        /// <summary>
        /// Reorders entity attributes by index in increase order.
        /// </summary>
        public void Reorder()
        {
            List<EntityAttr> items = (List<EntityAttr>)Items;

            items.Sort((item1, item2) => item1.Index - item2.Index);
        }
    }

    /// <summary>
    /// Represents entity attributes storage associated with a particular entity.
    /// </summary>
    public class EntityAttrStore : EntityAttrList
    {
        private Entity _entity = null;

        /// <summary>
        /// Initializes a new instance of the <see cref="T:EntityAttrStore"/> class.
        /// </summary>
        /// <param name="entity">The entity.</param>
        public EntityAttrStore(Entity entity)
            : base()
        {
            this._entity = entity;
        }

        /// <summary>Gets the DataModel object this entity attribute belongs to</summary>
        /// <value>The model.</value>
        public DataModel Model
        {
            get { return _entity != null ? _entity.Model : null; }
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
        protected override void InsertItem(int index, EntityAttr item)
        {
            base.InsertItem(index, item);
            OnEntityAttrInsertion(item, index);
        }

        /// <summary>
        /// Called when some attribute is inserted to the list.
        /// </summary>
        /// <param name="entityAttr">The attribute.</param>
        /// <param name="index">The index.</param>
        protected virtual void OnEntityAttrInsertion(EntityAttr entityAttr, int index)
        {
            entityAttr.Entity = _entity;
            if (_entity.Model != null)
            {
                entityAttr.OnModelAssignment();
            }
        }

        protected internal async Task WriteToJsonAsync(JsonWriter writer, MetaDataReadWriterOptions rwOptions)
        {
            await writer.WriteStartArrayAsync().ConfigureAwait(false);
            foreach (var attr in this)
            {
                await attr.WriteToJsonAsync(writer, rwOptions).ConfigureAwait(false);
            }
            await writer.WriteEndArrayAsync().ConfigureAwait(false);
        }


        protected internal async Task ReadFromJsonAsync(JsonReader reader)
        {
            if (reader.TokenType != JsonToken.StartArray)
            {
                throw new BadJsonFormatException(reader.Path);
            }

            while ((await reader.ReadAsync().ConfigureAwait(false))
                && reader.TokenType != JsonToken.EndArray)
            {

                var attr = Model.CreateEntityAttr(this._entity);
                await attr.ReadFromJsonAsync(reader).ConfigureAwait(false);
                this.Add(attr);
            }
        }

    }
}
