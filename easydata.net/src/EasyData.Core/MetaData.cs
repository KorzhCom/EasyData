using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace EasyData
{
    public class MetaEntityAttrDescriptor
    {
        public MetaEntityAttrDescriptor()
        {
            Kind = EntityAttrKind.Data;
            DataType = DataType.Unknown;
            Size = 100;
        }

        public MetaEntity Parent { get; set; }

        private string _caption;
        public string Caption { 
            get => _caption ?? Expression?.GetSecondPart('.');
            set => _caption = value;
        }

        public string Expression { get; set; }

        public DataType DataType { get; set; }

        public EntityAttrKind Kind { get; set; }

        public int Size { get; set; }

        public bool IsVirtual {
            get {

                return Kind == EntityAttrKind.Virtual;
            }
            set {
                Kind = value ? EntityAttrKind.Virtual : EntityAttrKind.Data;
            } 
        }
        
    }

    /// <summary>
    /// Represents different options used during meta data loading or saving 
    /// </summary>
    public static class MetaDataReadWriteOptions
    {
        /// <summary>
        /// Default options
        /// </summary>
        public static readonly BitOptions Defaults = Entities 
            | Description 
            | Editors
            | CustomInfo 
            | KeepCurrent;

        public const ulong Editors = 4;

        public const ulong Entities = 8;

        public const ulong Description = 32;

        public const ulong CustomInfo = 512;

        public const ulong KeepCurrent = 4096;

        public static BitOptions ClientSideContent => Defaults.Without(KeepCurrent);
    }

    public class MetaData
    {
        /// <summary>
        /// Read-only constant that represent the latest format version of data model definition JSON files
        /// </summary>
        static public readonly int LastJsonFormatVersion = 4;


        /// <summary>
        /// Gets or sets the ID of the model.
        /// </summary>
        /// <value>
        /// Model's ID.
        /// </value>
        public string Id { get; set; }


        /// <summary>
        /// Gets or Sets the version of data model JSON format.
        /// </summary>
        /// <value>The version of data model JSON format.</value>
        public int FormatVersionJson { get; set; } = LastJsonFormatVersion;


        /// <summary>
        /// Initializes a new instance of the <see cref="MetaData"/> class.
        /// </summary>
        public MetaData()
        {
            Id = Guid.NewGuid().ToString();

            EntityRoot = CreateRootEntity();

            Editors = new ValueEditorStore(this);

            //null entity
            nullEntity = CreateRootEntity();
            nullEntity.Name = "";

            AddDefaultDisplayFormats();

        }

        /// <summary>
        /// Initializes the <see cref="MetaData"/> class.
        /// Registers the main value editors types.
        /// </summary>
        static MetaData()
        {
            ValueEditor.RegisterCreator(new BasicValueEditorsCreator());
        }

        /// <summary>
        /// List of data model operators.
        /// </summary>
        public ValueEditorList Editors { get; private set; }

        /// <summary>
        /// Gets or sets the description.
        /// </summary>
        /// <value>The description.</value>
        public string Description { get; set; }

        /// <summary>
        /// Gets or sets the user-defined name of the model.
        /// </summary>
        /// <value>The name of the model.</value>
        public string Name { get; set; }


        protected internal SynchronizationContext MainSyncContext { get; internal set; } = SynchronizationContext.Current;

        /// <summary>
        /// Gets or sets the custom information associated with data model.
        /// </summary>
        /// <value>The custom info.</value>
        public string CustomInfo { get; set; } = "";

        /// <summary>
        /// Gets the model file path. It is automatically assigned when you use LoadFromFile method.
        /// </summary>
        /// <value>The model file path.</value>
        public string FilePath { get; set; }

        /// <summary>
        /// Called when the model is loaded (from XML file or string).
        /// </summary>
        public virtual void OnModelLoaded()
        {
        }

        /// <summary>
        /// Called after the model has been changed. Raises ModelChanged event if defined.
        /// </summary>
        public virtual void OnModelChanged()
        {
            TryRunWithMainSyncContext(() => ModelChanged?.Invoke(this, new EventArgs()));
        }

        /// <summary>
        /// Clears this instance.
        /// </summary>
        public virtual void Clear()
        {
            EntityRoot.Attributes.Clear();
            EntityRoot.SubEntities.Clear();
        }

        /// <summary>
        /// Clones the model object
        /// </summary>
        /// <returns>A duplicate of original DataModel object</returns>
        public MetaData Clone()
        {
            var model = Activator.CreateInstance(this.GetType()) as MetaData;
            using (MemoryStream buffer = new MemoryStream(2000000)) {
                SaveToJsonStream(buffer);
                buffer.Position = 0;
                model.LoadFromJsonStream(buffer);
            }
            return model;
        }


        /// <summary>
        /// Gets the model version.
        /// </summary>
        /// <value>The model version.</value>
        public int ModelVersion { get; set; } = 1;


        /// <summary>
        /// Increases the model version.
        /// </summary>
        public void IncreaseModelVersion()
        {
            ModelVersion++;
        }

        /// <summary>
        /// Occurs when the model is changed.
        /// </summary>
        public event EventHandler ModelChanged;

        #region Entities and attributes

        /// <summary>
        /// The root entity of data model entities.
        /// </summary>
        public virtual MetaEntity EntityRoot { get; protected set; }

        /// <summary>
        /// Creates the root entity.
        /// This method can be overriden in descendant classes to retrun the object of appropriate class (e.g. DbEntity).
        /// </summary>
        /// <returns>Entity object.</returns>
        public MetaEntity CreateRootEntity()
        {
            return CreateRootEntityCore();
        }

        /// <summary>
        /// Creates the entity.
        /// </summary>
        /// <returns></returns>
        public MetaEntity CreateEntity(MetaEntity parentEntity = null)
        {
            return CreateEntityCore(parentEntity ?? EntityRoot);
        }


        /// <summary>
        /// Creates the entity attribute. Used for creating entity attributes while building the model
        /// </summary>
        /// <param name="desc">The descriptor</param>
        /// <returns></returns>
        public MetaEntityAttr CreateEntityAttr(MetaEntityAttrDescriptor desc)
        {
            var attr = CreateEntityAttrCore(desc.Parent, desc.Kind);
            if (!string.IsNullOrEmpty(desc.Expression))
                attr.Id = DataUtils.ComposeKey(desc.Parent?.Id, desc.Expression);
            attr.Expr = desc.Expression;
            attr.Caption = desc.Caption;
            attr.DataType = desc.DataType;
            attr.Size = desc.Size;

            return attr;
        }

        protected virtual void ValidateEntityAttrDesc(MetaEntityAttrDescriptor desc) {
            if (desc == null)
                throw new ArgumentNullException(nameof(desc));

            if (desc.Parent == null)
                throw new InvalidOperationException("Parent entity is required");
        }

        protected virtual MetaEntity CreateEntityCore(MetaEntity parent)
        {
            return new MetaEntity(parent);
        }

        protected virtual MetaEntity CreateRootEntityCore()
        {
            return new MetaEntity(this);
        }

        protected virtual MetaEntityAttr CreateEntityAttrCore(MetaEntity parent, EntityAttrKind kind)
        {
            return new MetaEntityAttr(parent, kind);
        }


        protected internal void TryRunWithMainSyncContext(Action action)
        {
            if (MainSyncContext != null) {
                MainSyncContext.Post((_) => action(), null);
            }
            else {
                action();
            }
        }

        /// <summary>
        /// The formats store
        /// </summary>
        public readonly DisplayFormatStore DisplayFormats = new DisplayFormatStore();

        protected virtual void AddDefaultDisplayFormats()
        {
            // Bool
            DisplayFormats.AddOrUpdate(DataType.Bool, "0/1", "{0:S0|1}");
            DisplayFormats.AddOrUpdate(DataType.Bool, "False/True", "{0:SFalse|True}");
            DisplayFormats.AddOrUpdate(DataType.Bool, "No/Yes", "{0:SNo|Yes}");

            // Byte
            DisplayFormats.AddOrUpdate(DataType.Byte, "3-digit", "{0:D3}");

            // Int32
            DisplayFormats.AddOrUpdate(DataType.Int32, "5-digit", "{0:D5}");
            DisplayFormats.AddOrUpdate(DataType.Int32, "10-digit", "{0:D10}");

            // Int64
            DisplayFormats.AddOrUpdate(DataType.Int64, "10-digit", "{0:D10}");

            // Float
            DisplayFormats.AddOrUpdate(DataType.Float, "2-precision", "{0:F2}");
            DisplayFormats.AddOrUpdate(DataType.Float, "3-precision", "{0:F3}");
            DisplayFormats.AddOrUpdate(DataType.Float, "4-precision", "{0:F4}");

            // Currency
            DisplayFormats.AddOrUpdate(DataType.Currency, "2-precision", "{0:F2}");
            DisplayFormats.AddOrUpdate(DataType.Currency, "3-precision", "{0:F3}");
            DisplayFormats.AddOrUpdate(DataType.Currency, "4-precision", "{0:F4}");

            // Date
            DisplayFormats.AddOrUpdate(DataType.Date, "Short date", "{0:d}");
            DisplayFormats.AddOrUpdate(DataType.Date, "Long date", "{0:D}");

            // Time
            DisplayFormats.AddOrUpdate(DataType.Time, "Short time", "{0:HH:mm}");
            DisplayFormats.AddOrUpdate(DataType.Time, "Full time", "{0:HH:mm:ss}");

            // DateTime
            DisplayFormats.AddOrUpdate(DataType.DateTime, "Short date & time", "{0:f}");
            DisplayFormats.AddOrUpdate(DataType.DateTime, "Long date & time", "{0:F}");
            DisplayFormats.AddOrUpdate(DataType.DateTime, "Short date", "{0:d}");
            DisplayFormats.AddOrUpdate(DataType.DateTime, "Long date", "{0:D}");
            DisplayFormats.AddOrUpdate(DataType.DateTime, "Short time", "{0:HH:mm}");
            DisplayFormats.AddOrUpdate(DataType.DateTime, "Full time", "{0:HH:mm:ss}");
        }


        /// <summary>
        /// Sorts all entities and their attributes alphabetically.
        /// </summary>
        public void SortEntities()
        {
            SortEntityContent(EntityRoot);
        }

        /// <summary>
        /// Sorts the content of one entity alphabetically.
        /// This function is called by <see cref="SortEntities" /> method
        /// </summary>
        /// <param name="entity">The entity.</param>
        protected virtual void SortEntityContent(MetaEntity entity)
        {
            entity.SubEntities.SortByName();
            foreach (var ent in entity.SubEntities) {
                SortEntityContent(ent);
            }

            entity.Attributes.SortByCaption();
        }

        MetaEntity nullEntity = null;

        /// <summary>
        /// Gets a value indicating whether this model is empty (doesn't contain any entity or attribute) or not.
        /// </summary>
        public virtual bool IsEmpty => EntityRoot.Attributes.Count == 0 && EntityRoot.SubEntities.Count == 0;

        /// <summary>
        /// Number of virtual attributes
        /// </summary>
        protected internal int _maxEntAttrId = 0;

        /// <summary>
        /// Gets the next free number for building virtual entity attribute ID.
        /// </summary>
        /// <returns></returns>
        protected int GetNextEntityAttrId()
        {
            return ++_maxEntAttrId;
        }

        /// <summary>
        /// Gets the attribute by its ID.
        /// </summary>
        /// <param name="attrId">The attribute ID.</param>
        /// <param name="useNullAttr">if set to <c>true</c> NullAttribute will be returned if we can not find the attribute with specified ID.</param>
        /// <returns></returns>
        public virtual MetaEntityAttr GetAttributeById(string attrId, bool useNullAttr)
        {
            var result = EntityRoot.FindAttributeById(attrId);
            return result;
        }


        /// <summary>
        /// Find attribute either by its ID, expression or caption.
        /// </summary>
        /// <param name="attrDef">A string that represents attribute (either ID, expression or caption).</param>
        /// <returns></returns>
        public MetaEntityAttr FindEntityAttr(string attrDef)
        {
            var attr = EntityRoot.FindAttributeById(attrDef);
            if (attr == null)
                attr = EntityRoot.FindAttributeByExpression(attrDef);
            if (attr == null)
                attr = EntityRoot.FindAttributeByCaption(attrDef);

            return attr;
        }

        /// <summary>
        /// Finds an entity by its name.
        /// </summary>
        /// <param name="entityName">Name of the entity we are srearching for</param>
        /// <returns>
        /// An <see cref="MetaEntity"/> object with specified name or null if it can't be found.
        /// </returns>
        public MetaEntity FindEntity(string entityName)
        {
            return EntityRoot.FindSubEntity(entityName);
        }

        /// <summary>
        /// Adds a sub-entity to the current entity.
        /// </summary>
        /// <param name="entity">The parent entity.</param>
        /// <param name="entityName">The name of the new entity.</param>
        /// <returns>Entity.</returns>
        public MetaEntity AddEntity(MetaEntity entity, string entityName)
        {
            if (entity == null) {
                entity = EntityRoot;
            }

            var ent = CreateEntity(entity);
            ent.Id = DataUtils.ComposeKey(entity?.Id, entityName);
            ent.Name = entityName;
            entity.SubEntities.Add(ent);
            return ent;
        }


        /// <summary>
        /// Adds a new attribute to the model.
        /// </summary>
        /// <param name="desc">The descriptor.</param>
        /// <returns>EntityAttr.</returns>
        public virtual MetaEntityAttr AddEntityAttr(MetaEntityAttrDescriptor desc)
        {
            ValidateEntityAttrDesc(desc);

            var attr = CreateEntityAttr(desc);
            attr.Entity.Attributes.Add(attr);
            AssignEntityAttrID(attr);
            return attr;
        }

        /// <summary>
        /// Assigns the default ID for entity attribute.
        /// </summary>
        /// <param name="attr">The EntityAttr object.</param>
        public virtual void AssignEntityAttrID(MetaEntityAttr attr)
        {
            string id = "";
            if (attr.IsVirtual) {
                id = "VEA_" + GetNextEntityAttrId().ToString();
            }
            else {
                string baseID = attr.Expr.ToIdentifier();
                id = baseID;
                int N = 1;
                while (EntityRoot.FindAttributeById(id) != null) {
                    N++;
                    id = baseID + N.ToString();
                }
            }
            attr.Id = id;
        }

        #endregion //Entities and attributes

        private void CheckModelId()
        {
            if (string.IsNullOrEmpty(Id)) {
                Id = Guid.NewGuid().ToString();
            }
        }


        /// <summary>
        /// Inits the model loading.
        /// </summary>
        public virtual void InitModelLoading()
        {

        }

        protected BitOptions DefaultRWOptions = MetaDataReadWriteOptions.Defaults;

        #region JSON Serialization

        /// <summary>
        /// Saves the data model to a file in JSON format.
        /// </summary>
        /// <param name="filePath">The path to the result file</param>
        public void SaveToJsonFile(string filePath)
        {
            SaveToJsonFile(filePath, DefaultRWOptions);
        }


        /// <summary>
        /// Saves the data model to a file in JSON format.
        /// </summary>
        /// <param name="filePath">The path to the result file</param>
        /// <param name="options">Different read/write options</param>
        /// <returns></returns>
        public void SaveToJsonFile(string filePath, BitOptions options)
        {
            SaveToJsonFileAsync(filePath, options).ConfigureAwait(false)
                .GetAwaiter().GetResult();
        }

        /// <summary>
        /// Saves the data model to a file in JSON format (asynchronous way). 
        /// </summary>
        /// <param name="filePath">The path to the result file</param>
        /// <param name="ct">The cancellation token</param>
        /// <returns></returns>
        public async Task SaveToJsonFileAsync(string filePath, CancellationToken ct = default)
        {
            await SaveToJsonFileAsync(filePath, DefaultRWOptions, ct).ConfigureAwait(false);
        }

        /// <summary>
        /// Saves the data model to a file in JSON format (asynchronous way). 
        /// </summary> 
        /// <param name="filePath">The path to the result file</param>
        /// <param name="options">Different read/write options</param>
        /// <param name="ct">The cancellation token</param>
        /// <returns>Task</returns>
        public async Task SaveToJsonFileAsync(string filePath, BitOptions options, CancellationToken ct = default)
        {
            using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write,
                           FileShare.None, 4096, true))
            {
                await SaveToJsonStreamAsync(stream, options, ct).ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Saves the data model to a stream in JSON format.
        /// </summary>
        /// <param name="stream">The stream to save the model to</param>
        public void SaveToJsonStream(Stream stream)
        {
            SaveToJsonStream(stream, DefaultRWOptions);
        }

        /// <summary>
        /// Saves the data model to a stream in JSON format.
        /// </summary>
        /// <param name="stream">The stream to save the model to</param>
        /// <param name="options">Different read/write options</param>
        /// <returns></returns>
        public void SaveToJsonStream(Stream stream, BitOptions options)
        {
            SaveToJsonStreamAsync(stream, options).ConfigureAwait(false)
                .GetAwaiter().GetResult();
        }

        /// <summary>
        /// Saves the data model to a stream in JSON format (asynchronous way).
        /// </summary>
        /// <param name="stream">The stream to save the model to</param>
        /// <param name="ct">The cancellation token</param>
        /// <returns></returns>
        public async Task SaveToJsonStreamAsync(Stream stream, CancellationToken ct = default)
        {
            await SaveToJsonStreamAsync(stream, DefaultRWOptions, ct).ConfigureAwait(false);
        }


        /// <summary>
        /// Saves the data model to a stream in JSON format (asynchronous way).
        /// </summary>
        /// <param name="stream">The stream to save the model to</param>
        /// <param name="options">Different read/write options</param>
        /// <param name="ct">The cancellation token</param>
        /// <returns></returns>
        public async Task SaveToJsonStreamAsync(Stream stream, BitOptions options, CancellationToken ct = default)
        {
            using (var streamWriter = new StreamWriter(stream)) {
                using (JsonWriter jsonWriter = new JsonTextWriter(streamWriter)) {
                    await WriteToJsonAsync(jsonWriter, options, ct).ConfigureAwait(false);
                }
            }
        }

        /// <summary>
        /// Saves the model to a string in JSON format.
        /// </summary>
        /// <returns></returns>
        public string SaveToJsonString()
        {
            return SaveToJsonString(DefaultRWOptions);
        }

        /// <summary>
        /// Saves the model to a string in JSON format.
        /// </summary>
        /// <param name="options">Different read/write options.</param>
        /// <returns>System.String</returns>
        public string SaveToJsonString(BitOptions options)
        {
            return SaveToJsonStringAsync(options).ConfigureAwait(false)
                    .GetAwaiter().GetResult();
        }

        /// <summary>
        /// Saves the model to a string in JSON format (asynchronous way).
        /// </summary>
        /// <param name="ct">The cancellation token</param>
        /// <returns></returns>
        public async Task<string> SaveToJsonStringAsync(CancellationToken ct = default)
        {
            return await SaveToJsonStringAsync(DefaultRWOptions, ct).ConfigureAwait(false);
        }

        /// <summary>
        /// Saves the model to a string in JSON format (asynchronous way).
        /// </summary>
        /// <param name="options">Different read/write options.</param>
        /// <param name="ct">The cancellation token</param>
        /// <returns>Task&lt;System.String&gt;.</returns>
        public async Task<string> SaveToJsonStringAsync(BitOptions options, CancellationToken ct = default)
        {
            var result = new StringBuilder(1000);
            using (var textWriter = new StringWriter(result)) {
                using (var jsonWriter = new JsonTextWriter(textWriter)) {
                    await WriteToJsonAsync(jsonWriter, options, ct).ConfigureAwait(false);
                }
            }
            return result.ToString();
        }

        /// <summary>
        /// Loads data model from JSON stream.
        /// </summary>
        /// <param name="stream">A Stream object which contains data model definition.</param>
        public void LoadFromJsonStream(Stream stream)
        {
            LoadFromJsonStream(stream, DefaultRWOptions);
        }

        /// <summary>
        /// Loads data model from JSON stream.
        /// </summary>
        /// <param name="stream">A Stream object which contains data model definition.</param>
        /// <param name="options">Different read/write options. See <see cref="MetaDataReadWriterOptions"/> for details.</param>
        public void LoadFromJsonStream(Stream stream, BitOptions options)
        {
            LoadFromJsonStreamAsync(stream, options).ConfigureAwait(false)
                .GetAwaiter().GetResult();
        }

        /// <summary>
        /// Loads data model from JSON stream (asynchronous way).
        /// </summary>
        /// <param name="stream">>A Stream object which contains data model definition.</param>
        /// <param name="ct">The cancellation token</param>
        /// <returns></returns>
        public async Task LoadFromJsonStreamAsync(Stream stream, CancellationToken ct = default)
        {
            await LoadFromJsonStreamAsync(stream, DefaultRWOptions, ct).ConfigureAwait(false);
        }

        /// <summary>
        /// Loads data model from JSON stream (asynchronous way).
        /// </summary>
        /// <param name="stream">A Stream object which contains data model definition.</param>
        /// <param name="options">Different read/write options. See <see cref="MetaDataReadWriterOptions"/> for details.</param>
        /// <param name="ct">The cancellation token</param>
        /// <return>Task</return>
        public async Task LoadFromJsonStreamAsync(Stream stream, BitOptions options, CancellationToken ct = default)
        {
            using (var streamReader = new StreamReader(stream)) {
                using (var jsonReader = new JsonTextReader(streamReader)) {
                    await ReadFromJsonAsync(jsonReader, options, ct).ConfigureAwait(false);
                }
            }
        }

        /// <summary>
        ///  Saves the model to a JSON file.
        /// </summary>
        /// <param name="filePath"></param>
        public void LoadFromJsonFile(string filePath)
        {
            LoadFromJsonFile(filePath, DefaultRWOptions);
        }

        /// <summary>
        /// Loads the metadata from a JSON file.
        /// </summary>
        /// <param name="filePath"></param>
        /// <param name="options"></param>
        /// <returns></returns>
        public void LoadFromJsonFile(string filePath, BitOptions options)
        {
            LoadFromJsonFileAsync(filePath, options).ConfigureAwait(false)
                .GetAwaiter().GetResult();
        }

        /// <summary>
        /// Loads the metadata from a JSON file as an asynchronous operation.
        /// </summary>
        /// <param name="filePath">The file path.</param>
        /// <param name="ct">The cancellation token</param>
        public async Task LoadFromJsonFileAsync(string filePath, CancellationToken ct = default)
        {
            await LoadFromJsonFileAsync(filePath, DefaultRWOptions).ConfigureAwait(false);
        }

        /// <summary>
        /// Saves the model to a JSON file (asynchronous way).
        /// </summary>
        /// <param name="filePath"></param>
        /// <param name="options"></param>
        /// <param name="ct">The cancellation token</param>
        /// <returns>Task.</returns>
        public async Task LoadFromJsonFileAsync(string filePath, BitOptions options, CancellationToken ct = default)
        {
            FilePath = filePath;
            using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, 
                FileShare.Read, 4096, true)) {
                await LoadFromJsonStreamAsync(stream, options, ct).ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Loads the model from a string in JSON format.
        /// </summary>
        /// <param name="json">A string in JSON format.</param>
        public void LoadFromJsonString(string json)
        {
            LoadFromJsonString(json, DefaultRWOptions);
        }

        /// <summary>
        /// Loads the model from a string in JSON format.
        /// </summary>
        /// <param name="json">A string in JSON format.</param>
        /// <param name="options">Different read/write options.</param>
        public void LoadFromJsonString(string json, BitOptions options)
        {
            LoadFromJsonStringAsync(json, options).ConfigureAwait(false)
                .GetAwaiter().GetResult();
        }

        /// <summary>
        /// Loads the model from a string in JSON format (asynchronous way).
        /// </summary>
        /// <param name="json">>A string in JSON format.</param>
        /// <param name="ct">The cancellation token</param>
        /// <returns></returns>
        public async Task LoadFromJsonStringAsync(string json, CancellationToken ct = default)
        {
            await LoadFromJsonStringAsync(json, DefaultRWOptions, ct).ConfigureAwait(false);
        }

        /// <summary>
        /// Loads the model from a string in JSON format (asynchronous way).
        /// </summary>
        /// <param name="json">A string in JSON format.</param>
        /// <param name="options">Different read/write options.</param>
        /// <param name="ct">The cancellation token</param>
        /// <returns>Task.</returns>
        public async Task LoadFromJsonStringAsync(string json, BitOptions options, CancellationToken ct = default)
        {
            using (var textReader = new StringReader(json)) {
                using (var jsonReader = new JsonTextReader(textReader)) {
                    await ReadFromJsonAsync(jsonReader, options, ct).ConfigureAwait(false);
                }
            }
        }

        /// <summary>
        /// Writes the content of the data model to JSON using JsonWriter.
        /// </summary>
        /// <param name="writer">>An instance of JsonWriter class.</param>
        public void WriteToJson(JsonWriter writer)
        {
            WriteToJson(writer, DefaultRWOptions);
        }

        /// <summary>
        /// Writes the content of the data model to JSON using JsonWriter.
        /// </summary>
        /// <param name="writer">An instance of JsonWriter class.</param>
        /// <param name="options">Read-write options</param>
        public void WriteToJson(JsonWriter writer, BitOptions options)
        {
            WriteToJsonAsync(writer, options).ConfigureAwait(false)
                .GetAwaiter().GetResult();
        }

        /// <summary>
        /// Writes the content of the data model to JSON using JsonWriter (asynchronous way).
        /// </summary>
        /// <param name="writer">An instance of JsonWriter class.</param>
        /// <param name="ct">The cancellation token</param>
        /// <returns>Task.</returns>
        public async Task WriteToJsonAsync(JsonWriter writer, CancellationToken ct = default)
        {
            await WriteToJsonAsync(writer, DefaultRWOptions, ct).ConfigureAwait(false);
        }

        /// <summary>
        /// Writes the content of the data model to JSON using JsonWriter (asynchronous way).
        /// </summary>
        /// <param name="writer">An instance of JsonWriter class.</param>
        /// <param name="options">Read-write options</param>
        /// <param name="ct">The cancellation token</param>
        /// <returns>Task.</returns>
        public async Task WriteToJsonAsync(JsonWriter writer, BitOptions options, CancellationToken ct = default)
        {
            await writer.WriteStartObjectAsync(ct).ConfigureAwait(false); //root DataModel object
            await WriteModelPropsToJsonAsync(writer, options, ct).ConfigureAwait(false);
            await WriteContentToJsonAsync(writer, options, ct).ConfigureAwait(false);
            await writer.WriteEndObjectAsync(ct).ConfigureAwait(false); //close DataModel
        }

        /// <summary>
        ///  Writes properties of the model to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer"></param>
        /// <param name="options"></param>
        /// <param name="ct">The cancellation token</param>
        /// <returns></returns>
        protected virtual async Task WriteModelPropsToJsonAsync(JsonWriter writer, BitOptions options, CancellationToken ct)
        {
            await writer.WritePropertyNameAsync("fver", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(FormatVersionJson, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("mver", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(ModelVersion, ct).ConfigureAwait(false);

            CheckModelId();

            await writer.WritePropertyNameAsync("id", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(Id, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("name", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(Name, ct).ConfigureAwait(false);

            if (options.Contains(MetaDataReadWriteOptions.Description)) {
                await writer.WritePropertyNameAsync("desc", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(Description, ct).ConfigureAwait(false);
            }

            if (options.Contains(MetaDataReadWriteOptions.CustomInfo)) {
                await writer.WritePropertyNameAsync("cstinf", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(CustomInfo.ToString(), ct).ConfigureAwait(false);
            }          
        }

        /// <summary>
        /// Writes the main content of the model to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer.</param>
        /// <param name="rwOptions">The read/write options.</param>
        /// <param name="ct">The cancellation token</param>
        /// <returns>Task.</returns>
        protected virtual async Task WriteContentToJsonAsync(JsonWriter writer, BitOptions rwOptions, CancellationToken ct)
        {

            await writer.WritePropertyNameAsync("displayFormats", ct).ConfigureAwait(false);
            await WriteDisplayFormatsToJsonAsync(writer, ct).ConfigureAwait(false);

            // Editors must be saved before operators
            if (rwOptions.Contains(MetaDataReadWriteOptions.Editors)) {
                await writer.WritePropertyNameAsync("editors", ct).ConfigureAwait(false);
                await Editors.WriteToJsonAsync(writer, rwOptions, true, ct).ConfigureAwait(false);
            }

            if (rwOptions.Contains(MetaDataReadWriteOptions.Entities)) {
                await writer.WritePropertyNameAsync("maxAttrId", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(_maxEntAttrId, ct).ConfigureAwait(false);

                await writer.WritePropertyNameAsync("entroot", ct).ConfigureAwait(false);
                await EntityRoot.WriteToJsonAsync(writer, rwOptions, ct).ConfigureAwait(false);
            }
        }

        protected virtual async Task WriteDisplayFormatsToJsonAsync(JsonWriter writer, CancellationToken ct)
        {
            await writer.WriteStartObjectAsync(ct).ConfigureAwait(false);
            foreach (var typeFormats in DisplayFormats) {
                await writer.WritePropertyNameAsync(typeFormats.Key.ToString(), ct).ConfigureAwait(false);
                await writer.WriteStartArrayAsync(ct).ConfigureAwait(false);
                foreach (var format in typeFormats.Value) {
                    await writer.WriteStartObjectAsync(ct).ConfigureAwait(false);
                    await writer.WritePropertyNameAsync("name", ct).ConfigureAwait(false);
                    await writer.WriteValueAsync(format.Name, ct).ConfigureAwait(false);
                    await writer.WritePropertyNameAsync("format", ct).ConfigureAwait(false);
                    await writer.WriteValueAsync(format.Format, ct).ConfigureAwait(false);
                    if (format.IsDefault) {
                        await writer.WritePropertyNameAsync("isdef", ct).ConfigureAwait(false);
                        await writer.WriteValueAsync(format.IsDefault, ct).ConfigureAwait(false);
                    }
                    await writer.WriteEndObjectAsync(ct).ConfigureAwait(false);
                }
                await writer.WriteEndArrayAsync(ct).ConfigureAwait(false);
            }
            await writer.WriteEndObjectAsync(ct).ConfigureAwait(false);
        }

        /// <summary>
        /// Reads the content of the model from the specified JsonReader.
        /// </summary>
        /// <param name="reader">The reader</param>
        /// <param name="options">Some read/write options.</param>
        /// <exception cref="BadJsonFormatException"></exception>
        public void ReadFromJson(JsonReader reader, BitOptions options)
        {
            ReadFromJsonAsync(reader, options).ConfigureAwait(false)
                .GetAwaiter().GetResult();
        }

        /// <summary>
        /// Reads the content of the model from the specified JsonReader (asynchronous way).
        /// </summary>
        /// <param name="reader">The reader</param>
        /// <param name="options">Some read/write options.</param>
        /// <param name="ct">The cancellation token</param>
        /// <returns>Task.</returns>
        /// <exception cref="BadJsonFormatException"></exception>
        public async Task ReadFromJsonAsync(JsonReader reader, BitOptions options, CancellationToken ct = default)
        {
            if (!await reader.ReadAsync(ct).ConfigureAwait(false)
                || reader.TokenType != JsonToken.StartObject)
            {
                throw new BadJsonFormatException(reader.Path);
            }

            if (!options.Contains(MetaDataReadWriteOptions.KeepCurrent)) {
                Clear();
            }
           
            while (await reader.ReadAsync(ct)) {
                if (reader.TokenType == JsonToken.PropertyName) {
                    string propName = reader.Value.ToString();
                    await ReadOneModelPropFromJsonAsync(reader, propName, ct).ConfigureAwait(false);
                }
                else if (reader.TokenType == JsonToken.EndObject) {
                    break;
                }
            }
            OnModelLoaded();
        }

        private int _formatVersionReadJson = 0;

        /// <summary>
        /// Reads one model property from JSON (asynchronous way).
        /// </summary>
        /// <param name="reader">The reader.</param>
        /// <param name="propName">Name of the property.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task.</returns>
        protected virtual async Task ReadOneModelPropFromJsonAsync(JsonReader reader, string propName, CancellationToken ct)
        {
            switch (propName)
            {
                case "entroot":
                    await reader.ReadAsync(ct).ConfigureAwait(false); //readring start object
                    await EntityRoot.ReadFromJsonAsync(reader, ct).ConfigureAwait(false);
                    break;
                case "fver":
                    _formatVersionReadJson = (await reader.ReadAsInt32Async(ct).ConfigureAwait(false)).Value;
                    break;
                case "mver":
                    ModelVersion = (await reader.ReadAsInt32Async(ct).ConfigureAwait(false)).Value;
                    break;
                case "id":
                    Id = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "name":
                    Name = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "desc":
                    Description = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "cstinf":
                    CustomInfo = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "maxAttrId":
                    _maxEntAttrId = (await reader.ReadAsInt32Async(ct).ConfigureAwait(false)).Value;
                    break;
                case "editors":
                    await reader.ReadAsync(ct).ConfigureAwait(false); //reading StartArray token
                    await Editors.ReadFromJsonAsync(reader, ct).ConfigureAwait(false);
                    break;
                case "dataFormats":
                    await reader.ReadAsync(ct).ConfigureAwait(false); //reading StartObject token
                    await ReadDisplayFormatsFromJsonAsync(reader, ct).ConfigureAwait(false);
                    break;
                default:
                    await reader.SkipAsync(ct).ConfigureAwait(false);
                    break;
            }
        }

        protected async virtual Task ReadDisplayFormatsFromJsonAsync(JsonReader reader, CancellationToken ct)
        {
            DisplayFormats.Clear();
            if (reader.TokenType != JsonToken.StartObject) {
                throw new BadJsonFormatException(reader.Path);
            }

            while ((await reader.ReadAsync(ct).ConfigureAwait(false))
                && reader.TokenType != JsonToken.EndObject)
            {
                var formatType = reader.Value.ToString().StrToDataType();

                await reader.ReadAsync(ct).ConfigureAwait(false);
                if (reader.TokenType != JsonToken.StartArray) {
                    while ((await reader.ReadAsync(ct).ConfigureAwait(false))
                        && reader.TokenType != JsonToken.EndArray)
                    {
                        var fmtObj = await JObject.ReadFromAsync(reader, ct).ConfigureAwait(false);
                        var name = fmtObj.Value<string>("name");
                        var format = fmtObj.Value<string>("format");

                        var isdef = fmtObj.Value<bool?>("isdef");

                        var fmt = DisplayFormats.AddOrUpdate(formatType, name, format);
                        if (isdef.HasValue) {
                            fmt.IsDefault = isdef.Value;
                        }
                    }
                }
            }
        }
        #endregion
    }
}