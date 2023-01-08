using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Dynamic;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace EasyData
{

    /// <summary>
    /// Represents an attribute's kind
    /// </summary>
    public enum EntityAttrKind
    {
        /// <summary>
        /// The data attribute represents a field in some database table
        /// </summary>
        Data = 0,

        /// <summary>
        /// The virtual or calculated attribute does not has a direct representations in a database.
        /// It is defined as a calculation of few data attributes (fields)
        /// </summary>
        Virtual = 1,

        /// <summary>
        /// The lookup attribute represents the connection between two entities.
        /// It usually correspond to a navigation property in a model class.
        /// </summary>
        Lookup = 2
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
    public class MetaEntityAttr : IComparable<MetaEntityAttr>
    {
        /// <summary>
        /// Gets or sets the ID.
        /// </summary>
        /// <value>ID string.</value>
        /// <remarks>
        /// ID represents internal entityAttr attribute id which is not shown to user 
        /// but is used for storing data model in external files.
        /// </remarks>
        public string Id { get; set; }

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


        internal string _lookupEntityId = null;
        private MetaEntity _lookupEntity = null;
        public MetaEntity LookupEntity
        {
            get {
                if (_lookupEntity == null)
                {
                    CheckModel();
                    _lookupEntity = string.IsNullOrEmpty(_lookupEntityId)
                        ? null
                        : Model.FindEntity(_lookupEntityId);

                }

                return _lookupEntity;
            }
            set {
                _lookupEntity = value;
                _lookupEntityId = value?.Id;
            }
        }

        internal string _lookupDataAttrId = null;
        private MetaEntityAttr _lookupDataAttr = null;

        /// <summary>
        /// Gets or sets the data attribute in the lookup entity (where the actual values will be saved to).
        /// </summary>
        /// <value>The lookup data attribute.</value>
        public MetaEntityAttr LookupDataAttribute
        {
            get {
                if (_lookupDataAttr == null)
                {
                    CheckModel();
                    _lookupDataAttr = string.IsNullOrEmpty(_lookupDataAttrId)
                        ? null
                        : Model.GetAttributeById(_lookupDataAttrId, false);

                }

                return _lookupDataAttr;
            }
            set {
                _lookupDataAttr = value;
                _lookupDataAttrId = value?.Id;
            }
        }

        internal string _dataAttrId = null;
        private MetaEntityAttr _dataAttr = null;
        public MetaEntityAttr DataAttr
        {
            get {
                if (_dataAttr == null) {
                    CheckModel();
                    _dataAttr = string.IsNullOrEmpty(_dataAttrId)
                        ? null
                        : Model.GetAttributeById(_dataAttrId, false);

                }

                return _dataAttr;
            }
            set {
                _dataAttr = value;
                _dataAttrId = value?.Id;
            }
        }

        /// <summary>
        /// Attribute expression
        /// </summary>
        protected string expr = "";

        /// <summary>
        /// Gets ot sets a value indicating whether this attribute is a primary key
        /// </summary>
        public bool IsPrimaryKey { get; set; } = false;

        /// <summary>
        /// Gets ot sets a value indicating whether this attribute is a foreign key
        /// </summary>
        public bool IsForeignKey { get; set; } = false;

        /// <summary>
        /// Gets ot sets a value indicating whether this attribute is editable
        /// </summary>
        public bool IsEditable { get; set; } = true;

        /// <summary>
        /// Gets or sets a value indicating whether this attribute is shown in LookUp editor
        /// </summary>
        public bool ShowInLookup { get; set; } = false;

        /// <summary>
        /// Gets ot sets a value indicating whether this attribute is visible
        /// </summary>
        [Obsolete("Use ShowOnView instead")]
        public bool IsVisible { get; set; } = true;

        /// <summary>
        /// Gets ot sets a value indicating whether this attribute is visible in a view mode (in grid)
        /// </summary>
        public bool ShowOnView { get; set; } = true;

        /// <summary>
        /// Gets ot sets a value indicating whether this attribute is visible during the edit
        /// </summary>
        public bool ShowOnEdit { get; set; } = true;

        /// <summary>
        /// Gets ot sets a value indicating whether this attribute is visible during the creation
        /// </summary>
        public bool ShowOnCreate { get; set; } = true;

        private ValueEditor _defaultEditor = null;
        /// <summary>
        /// Gets or sets the default value editor.
        /// </summary>
        /// <value>The default value editor. null value represent AUTO value editor.</value>
        public ValueEditor DefaultEditor
        {
            get { return _defaultEditor; }
            set {
                _defaultEditor = value;
                if (_defaultEditor != null && Model != null)
                    _defaultEditor.CheckInModel(Model);
            }
        }

        /// <summary>
        /// Sets default editor without adding it to model.
        /// </summary>
        public void SetDefaultEditorWithoutChecking(ValueEditor editor)
        {
            _defaultEditor = editor;
        }


        internal string _lookupAttrId = null;
        private MetaEntityAttr _lookupAttr = null;

        /// <summary>
        /// Gets the lookup attribute.
        /// </summary>
        public MetaEntityAttr LookupAttr
        {
            get {
                if (_lookupAttr == null) {
                    CheckModel();
                    _lookupAttr = string.IsNullOrEmpty(_lookupAttrId)
                        ? null
                        : Model.GetAttributeById(_lookupAttrId, false);

                }

                return _lookupAttr;
            }

            set {
                _lookupAttr = value;
                if (value != null) {
                    _lookupAttrId = value.Id;
                    _lookupAttr._lookupAttrId = Id;
                }
                else
                    _lookupAttrId = null;
            }
        }

        public virtual ValueEditor GetValueEditor(DataType? type = null)
        {
            ValueEditor result = DefaultEditor;

            type = type ?? DataType;
            if (result == null) {
                switch (type.Value) {
                    case DataType.Date:
                    case DataType.Time:
                    case DataType.DateTime:
                        result = new DateTimeValueEditor();
                        break;
                    case DataType.Bool:
                        result = new CustomListValueEditor("BooleanValues", "MENU");
                        break;
                    default:
                        result = new TextValueEditor();
                        break;
                }
            }

            if (result is DateTimeValueEditor) {
                ((DateTimeValueEditor)result).SubType = type.Value;
            }

            return result;
        }

        /// <summary>
        /// Gets the model.
        /// </summary>
        /// <value>The model.</value>
        public virtual MetaData Model => Entity?.Model;

        public EntityAttrKind Kind { get; internal set; }


        private string _displayFormat;

        /// <summary>
        /// The display format for the attribute.
        /// </summary>
        public string DisplayFormat {
            get => _displayFormat;
            set {
                if (_displayFormat != value) {
                    DataFormatUtils.CheckFormat(value);
                    _displayFormat = value;
                }            
            }
        }


        /// <summary>
        /// Checks the Model property and raises an exception if it's null.
        /// </summary>
        /// <exception cref="MetaDataException">
        /// Entity is not specified for attribute:  + {attribute ID}
        /// or
        /// Model is not specified for entity:  + {entity ID}
        /// </exception>
        protected void CheckModel()
        {
            if (Entity == null) {
                throw new MetaDataException("Entity is not specified for attribute: " + this.Id);
            }

            if (Model == null) {
                MetaEntity ent = Entity;

                while (ent.Parent != null) {
                    ent = ent.Parent;
                }

                throw new MetaDataException(string.Format("Model is not specified for entity: {0}, root: {1}", ent.Name, ent.IsRoot.ToString()));
            }
        }


        /// <summary>
        /// Gets or sets the entity.
        /// </summary>
        /// <value>The entity.</value>
        public virtual MetaEntity Entity { get; internal set; }


        /// <summary>
        /// Called when model is assigned.
        /// </summary>
        public virtual void OnModelAssignment() { }

        /// <summary>
        /// Gets or sets the attribute's caption.
        /// </summary>
        /// <value>Caption text</value>
        /// <remarks> Caption is the public representation of entityAttr.
        /// It must have clear and understandable name. 
        /// Example: "Company name" is a good caption 
        /// but "CName" - is bad.
        /// </remarks>
        public string Caption { get; set; }


        /// <summary>
        /// Gets the full name of the attribute (including the name of the parent entity).
        /// </summary>
        /// <param name="separator">The separator (space by default).</param>
        /// <returns>System.String.</returns>
        public string GetFullCaption(string separator = " ")
        {
            return Entity.GetFullName(separator) + separator + Caption;
        }

        /// <summary>
        /// Gets or sets the description of entity attribute.
        /// </summary>
        /// <value>The description of entity attribute.</value>
        public string Description { get; set; } = "";


        /// <summary>
        /// Indicates if this attribute is a virtual (calculate) one.
        /// </summary>
        public bool IsVirtual => Kind == EntityAttrKind.Virtual;

        /// <summary>
        /// The default value
        /// </summary>
        public object DefaultValue { get; set; }


        protected internal MetaEntityAttr() : this(null, false)
        {
        }


        protected internal MetaEntityAttr(MetaEntity parentEntity, bool isVirtual = false) : this(parentEntity,
            isVirtual ? EntityAttrKind.Virtual : EntityAttrKind.Data)
        {

        }

        protected internal MetaEntityAttr(MetaEntity parentEntity, EntityAttrKind kind)
        {
            Entity = parentEntity;
            Kind = kind;
        }

        /// <summary>
        /// Gets or sets the default sorting order
        /// </summary>
        public int Sorting { get; set; }

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
                if (expr != value) {
                    expr = value;
                    if (IsVirtual) {
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
        /// Gets or sets the user data object assosiated with attribute.
        /// </summary>
        /// <value></value>
        public object UserData { get; set; }

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
        public virtual void CopyFrom(MetaEntityAttr attr)
        {
            Caption = attr.Caption;
            DataType = attr.DataType;
            Description = attr.Description;
            Expr = attr.Expr;
            Id = attr.Id;
            Kind = attr.Kind;
            _lookupAttrId = attr._lookupAttrId;
            _defaultEditor = attr.DefaultEditor;
            Size = attr.Size;
            UserData = attr.UserData;
            IsNullable = attr.IsNullable;
            IsPrimaryKey = attr.IsPrimaryKey;
            IsForeignKey = attr.IsForeignKey;
            IsEditable = attr.IsEditable;
            ShowInLookup = attr.ShowInLookup;
            ShowOnView = attr.ShowOnView;
            ShowOnEdit = attr.ShowOnEdit;
            ShowOnCreate = attr.ShowOnCreate;
        }

        /// <summary>
        /// Compares the current instance with another EntityAttr object 
        /// and returns an integer that indicates whether the current instance precedes, 
        /// follows, or occurs in the same position in the sort order as the other object.
        /// </summary>
        /// <param name="attr">The entity attribute.</param>
        /// <returns>An integer that indicates whether the current instance precedes, 
        /// follows, or occurs in the same position in the sort order as the other object</returns>
        int IComparable<MetaEntityAttr>.CompareTo(MetaEntityAttr attr)
        {
            return string.Compare(Caption, attr.Caption, StringComparison.InvariantCultureIgnoreCase);
        }


        /// <summary>
        /// Writes attribute's content to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer.</param>
        /// <returns>Task.</returns>
        /// <param name="options">Some read/write options</param>
        /// <param name="ct">The cancellation token.</param>
        protected internal async Task WriteToJsonAsync(JsonWriter writer, BitOptions options, CancellationToken ct)
        {
            await writer.WriteStartObjectAsync(ct).ConfigureAwait(false);
            await WritePropertiesToJsonAsync(writer, options, ct).ConfigureAwait(false);
            await writer.WriteEndObjectAsync(ct).ConfigureAwait(false);
        }

        /// <summary>
        /// Writes attribute properties to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer</param>
        /// <param name="options">Some read/write options</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        protected virtual async Task WritePropertiesToJsonAsync(JsonWriter writer, BitOptions options, CancellationToken ct)
        {
            await writer.WritePropertyNameAsync("id", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(Id, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("cptn", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(Caption, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("dtype", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(DataType.ToInt(), ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("kind", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(Kind, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("size", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(Size, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("ipk", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(IsPrimaryKey, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("ifk", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(IsForeignKey, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("nul", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(IsNullable, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("ied", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(IsEditable, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("sov", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(ShowOnView, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("soe", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(ShowOnEdit, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("soc", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(ShowOnCreate, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("sil", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(ShowInLookup, ct).ConfigureAwait(false);

            if (DefaultValue != null) {
                await writer.WritePropertyNameAsync("defVal", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(DefaultValue, ct).ConfigureAwait(false);
            }

            if (!string.IsNullOrEmpty(DisplayFormat)) {
                await writer.WritePropertyNameAsync("dfmt", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(DisplayFormat, ct).ConfigureAwait(false);
            }

            if (LookupAttr != null) {
                await writer.WritePropertyNameAsync("lattr", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(LookupAttr.Id, ct).ConfigureAwait(false);
            }

            if (DataAttr != null) {
                await writer.WritePropertyNameAsync("dattr", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(DataAttr.Id, ct).ConfigureAwait(false);
            }

            if (LookupEntity != null) {
                await writer.WritePropertyNameAsync("lent", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(LookupEntity.Id, ct).ConfigureAwait(false);
            }

            if (LookupDataAttribute != null) {
                await writer.WritePropertyNameAsync("ldattr", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(LookupDataAttribute.Id, ct).ConfigureAwait(false);
            }

            if (DefaultEditor != null) {
                await writer.WritePropertyNameAsync("edtr", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(DefaultEditor.Id, ct).ConfigureAwait(false);
            }

            //saving the list of operators' IDs
            if (!string.IsNullOrEmpty(Description)) {
                await writer.WritePropertyNameAsync("desc", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(Description, ct).ConfigureAwait(false);
            }

            if (UserData != null) {
                await writer.WritePropertyNameAsync("udata", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(UserData.ToString(), ct).ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Reads the attribute content from JSON (asynchronous way).
        /// </summary>
        /// <param name="reader">A JsonReader.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        /// <exception cref="BadJsonFormatException">
        /// </exception>
        public async Task ReadFromJsonAsync(JsonReader reader, CancellationToken ct = default)
        {
            if (reader.TokenType != JsonToken.StartObject) {
                throw new BadJsonFormatException(reader.Path);
            }

            while ((await reader.ReadAsync(ct).ConfigureAwait(false))
                && reader.TokenType != JsonToken.EndObject) {

                if (reader.TokenType != JsonToken.PropertyName) {
                    throw new BadJsonFormatException(reader.Path);
                }

                var propName = reader.Value.ToString();
                await ReadPropertyFromJsonAsync(reader, propName, ct).ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Reads one attribute's property from JSON (asynchronous way).
        /// </summary>
        /// <param name="reader">A JsonReader.</param>
        /// <param name="propName">Name of the property.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        protected virtual async Task ReadPropertyFromJsonAsync(JsonReader reader, string propName, CancellationToken ct)
        {
            switch (propName)
            {
                case "id":
                    Id = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "dfmt":
                    DisplayFormat = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "cptn":
                    Caption = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "dtype":
                    DataType = (await reader.ReadAsInt32Async(ct).ConfigureAwait(false))
                        .Value.IntToDataType();
                    break;
                case "edtr":
                    var editor = Model.Editors.FindById(await reader.ReadAsStringAsync(ct).ConfigureAwait(false));
                    SetDefaultEditorWithoutChecking(editor);
                    break;
                case "kind":
                    Kind = (EntityAttrKind)await reader.ReadAsInt32Async(ct).ConfigureAwait(false);
                    break;
                case "virtual":
                    if ((await reader.ReadAsBooleanAsync(ct).ConfigureAwait(false)).Value)
                        Kind = EntityAttrKind.Virtual;
                    break;
                case "size":
                    Size = (await reader.ReadAsInt32Async(ct).ConfigureAwait(false)).Value;
                    break;
                case "ipk":
                    IsPrimaryKey = (await reader.ReadAsBooleanAsync(ct).ConfigureAwait(false)).Value;
                    break;
                case "ifk":
                    IsForeignKey = (await reader.ReadAsBooleanAsync(ct).ConfigureAwait(false)).Value;
                    break;
                case "ied":
                    IsEditable = (await reader.ReadAsBooleanAsync(ct).ConfigureAwait(false)).Value;
                    break;
                case "sov":
                    ShowOnView = (await reader.ReadAsBooleanAsync(ct).ConfigureAwait(false)).Value;
                    break;
                case "soe":
                    ShowOnEdit = (await reader.ReadAsBooleanAsync(ct).ConfigureAwait(false)).Value;
                    break;
                case "soc":
                    ShowOnCreate = (await reader.ReadAsBooleanAsync(ct).ConfigureAwait(false)).Value;
                    break;
                case "sil":
                    ShowInLookup = (await reader.ReadAsBooleanAsync(ct).ConfigureAwait(false)).Value;
                    break;
                case "nul":
                    IsNullable = (await reader.ReadAsBooleanAsync(ct).ConfigureAwait(false)).Value;
                    break;
                case "lattr":
                    _lookupAttrId = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "dattr":
                    _dataAttrId = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "ldattr":
                    _lookupDataAttrId = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "lent":
                    _lookupEntityId = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "opg":
                    await reader.SkipAsync(ct).ConfigureAwait(false);
                    break;
                case "desc":
                    Description = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "udata":
                    UserData = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "defVal":
                    var jObj = await JObject.ReadFromAsync(reader, ct).ConfigureAwait(false);
                    DefaultValue = jObj.ToObject<string>();
                    break;
                default:
                    await reader.SkipAsync(ct).ConfigureAwait(false);
                    break;
            }
        }
    }

    /// <summary>
    /// Represents list of entity attributes
    /// </summary>
    public class MetaEntityAttrList : Collection<MetaEntityAttr>
    {
        /// <summary>
        /// Orders list of attributes by their captions.
        /// </summary>
        public void SortByCaption()
        {
            List<MetaEntityAttr> items = (List<MetaEntityAttr>)Items;
            items.Sort();
        }

        /// <summary>
        /// Reorders entity attributes by index in increase order.
        /// </summary>
        public void Reorder()
        {
            List<MetaEntityAttr> items = (List<MetaEntityAttr>)Items;

            items.Sort((item1, item2) => item1.Index - item2.Index);
        }
    }

 
    /// <summary>
    /// Represents entity attributes storage associated with a particular entity.
    /// </summary>
    public class MetaEntityAttrStore: MetaEntityAttrList
    {
        private MetaEntity _entity = null;

        /// <summary>
        /// Initializes a new instance of the <see cref="T:EntityAttrStore"/> class.
        /// </summary>
        /// <param name="entity">The entity.</param>
        public MetaEntityAttrStore(MetaEntity entity)
            : base()
        {
            _entity = entity;
        }

        /// <summary>Gets the DataModel object this entity attribute belongs to</summary>
        /// <value>The model.</value>
        public MetaData Model
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
        protected override void InsertItem(int index, MetaEntityAttr item)
        {
            base.InsertItem(index, item);
            OnEntityAttrInsertion(item, index);
        }

        /// <summary>
        /// Called when some attribute is inserted to the list.
        /// </summary>
        /// <param name="entityAttr">The attribute.</param>
        /// <param name="index">The index.</param>
        protected virtual void OnEntityAttrInsertion(MetaEntityAttr entityAttr, int index)
        {
            entityAttr.Entity = _entity;
            if (_entity.Model != null) {
                entityAttr.OnModelAssignment();
            }
        }

        public async Task WriteToJsonAsync(JsonWriter writer, BitOptions options, CancellationToken ct = default)
        {
            await writer.WriteStartArrayAsync(ct).ConfigureAwait(false);
            foreach (var attr in this) {
                await attr.WriteToJsonAsync(writer, options, ct).ConfigureAwait(false);
            }
            await writer.WriteEndArrayAsync(ct).ConfigureAwait(false);
        }


        public async Task ReadFromJsonAsync(JsonReader reader, CancellationToken ct = default)
        {
            if (reader.TokenType != JsonToken.StartArray) {
                throw new BadJsonFormatException(reader.Path);
            }

            while ((await reader.ReadAsync(ct).ConfigureAwait(false))
                && reader.TokenType != JsonToken.EndArray) {

                var attr = Model.CreateEntityAttr(new MetaEntityAttrDescriptor() { Parent = _entity });
                await attr.ReadFromJsonAsync(reader, ct).ConfigureAwait(false);
                Add(attr);
            }
        }

    }
}
