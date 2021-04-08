using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Newtonsoft.Json;

namespace EasyData
{
    public class MetaEntityAttrDescriptor
    {
        public MetaEntityAttrDescriptor(MetaEntity parent): this(parent, "")
        {        
        }

        public MetaEntityAttrDescriptor(MetaEntity parent, string expr)
        {
            if (parent == null)
                throw new ArgumentNullException(nameof(parent));

            Parent = parent;
            Expression = expr;
            Caption = expr?.GetSecondPart('.');
            Kind = EntityAttrKind.Data;
            DataType = DataType.Unknown;
            Size = 100;
        }

        public MetaEntityAttrDescriptor(MetaEntity parent, EntityAttrKind kind, string expr = ""): this(parent, expr)
        {
            Kind = kind;
        }

        public MetaEntity Parent { get; private set; }

        public string Caption { get; set; }

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
            if (desc == null)
                throw new ArgumentNullException(nameof(desc));

            var attr = CreateEntityAttrCore(desc.Parent, desc.Kind);
            if (!string.IsNullOrEmpty(desc.Expression))
                attr.Id = DataUtils.ComposeKey(desc.Parent?.Id, desc.Expression);
            attr.Expr = desc.Expression;
            attr.Caption = desc.Caption;
            attr.DataType = desc.DataType;
            attr.Size = desc.Size;

            return attr;
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
        /// <returns></returns>
        public async Task SaveToJsonFileAsync(string filePath)
        {
            await SaveToJsonFileAsync(filePath, DefaultRWOptions).ConfigureAwait(false);
        }

        /// <summary>
        /// Saves the data model to a file in JSON format (asynchronous way). 
        /// </summary> 
        /// <param name="filePath">The path to the result file</param>
        /// <param name="options">Different read/write options</param>
        /// <returns>Task</returns>
        public async Task SaveToJsonFileAsync(string filePath, BitOptions options)
        {
            using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write,
                           FileShare.None, 4096, true))
            {
                await LoadFromJsonStreamAsync(stream, options).ConfigureAwait(false);
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
        /// <returns></returns>
        public async Task SaveToJsonStreamAsync(Stream stream)
        {
            await SaveToJsonStreamAsync(stream, DefaultRWOptions).ConfigureAwait(false);
        }


        /// <summary>
        /// Saves the data model to a stream in JSON format (asynchronous way).
        /// </summary>
        /// <param name="stream">The stream to save the model to</param>
        /// <param name="options">Different read/write options</param>
        /// <returns></returns>
        public async Task SaveToJsonStreamAsync(Stream stream, BitOptions options)
        {
            using (var streamWriter = new StreamWriter(stream)) {
                using (JsonWriter jsonWriter = new JsonTextWriter(streamWriter)) {
                    await WriteToJsonAsync(jsonWriter, options).ConfigureAwait(false);
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
        /// <returns></returns>
        public async Task<string> SaveToJsonStringAsync()
        {
            return await SaveToJsonStringAsync(DefaultRWOptions).ConfigureAwait(false);
        }

        /// <summary>
        /// Saves the model to a string in JSON format (asynchronous way).
        /// </summary>
        /// <param name="options">Different read/write options.</param>
        /// <returns>Task&lt;System.String&gt;.</returns>
        public async Task<string> SaveToJsonStringAsync(BitOptions options)
        {
            var result = new StringBuilder(1000);
            using (var textWriter = new StringWriter(result)) {
                using (var jsonWriter = new JsonTextWriter(textWriter)) {
                    await WriteToJsonAsync(jsonWriter, options).ConfigureAwait(false);
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
        /// <returns></returns>
        public async Task LoadFromJsonStreamAsync(Stream stream)
        {
            await LoadFromJsonStreamAsync(stream, DefaultRWOptions).ConfigureAwait(false);
        }

        /// <summary>
        /// Loads data model from JSON stream (asynchronous way).
        /// </summary>
        /// <param name="stream">A Stream object which contains data model definition.</param>
        /// <param name="options">Different read/write options. See <see cref="MetaDataReadWriterOptions"/> for details.</param>
        /// <return>Task</return>
        public async Task LoadFromJsonStreamAsync(Stream stream, BitOptions options)
        {
            using (var streamReader = new StreamReader(stream)) {
                using (var jsonReader = new JsonTextReader(streamReader)) {
                    await ReadFromJsonAsync(jsonReader, options).ConfigureAwait(false);
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
        public async Task LoadFromJsonFileAsync(string filePath)
        {
            await LoadFromJsonFileAsync(filePath, DefaultRWOptions).ConfigureAwait(false);
        }

        /// <summary>
        /// Saves the model to a JSON file (asynchronous way).
        /// </summary>
        /// <param name="filePath"></param>
        /// <param name="options"></param>
        /// <returns>Task.</returns>
        public async Task LoadFromJsonFileAsync(string filePath, BitOptions options)
        {
            FilePath = filePath;
            using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, 
                FileShare.Read, 4096, true)) {
                await LoadFromJsonStreamAsync(stream, options).ConfigureAwait(false);
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
        /// <returns></returns>
        public async Task LoadFromJsonStringAsync(string json)
        {
            await LoadFromJsonStringAsync(json, DefaultRWOptions).ConfigureAwait(false);
        }

        /// <summary>
        /// Loads the model from a string in JSON format (asynchronous way).
        /// </summary>
        /// <param name="json">A string in JSON format.</param>
        /// <param name="options">Different read/write options.</param>
        /// <returns>Task.</returns>
        public async Task LoadFromJsonStringAsync(string json, BitOptions options)
        {
            using (var textReader = new StringReader(json)) {
                using (var jsonReader = new JsonTextReader(textReader)) {
                    await ReadFromJsonAsync(jsonReader, options).ConfigureAwait(false);
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
        /// <returns>Task.</returns>
        public async Task WriteToJsonAsync(JsonWriter writer)
        {
            await WriteToJsonAsync(writer, DefaultRWOptions).ConfigureAwait(false);
        }

        /// <summary>
        /// Writes the content of the data model to JSON using JsonWriter (asynchronous way).
        /// </summary>
        /// <param name="writer">An instance of JsonWriter class.</param>
        /// <param name="options">Read-write options</param>
        /// <returns>Task.</returns>
        public async Task WriteToJsonAsync(JsonWriter writer, BitOptions options)
        {
            await writer.WriteStartObjectAsync().ConfigureAwait(false); //root DataModel object
            await WriteModelPropsToJsonAsync(writer, options).ConfigureAwait(false);
            await WriteContentToJsonAsync(writer, options).ConfigureAwait(false);
            await writer.WriteEndObjectAsync().ConfigureAwait(false); //close DataModel
        }

        /// <summary>
        ///  Writes properties of the model to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer"></param>
        /// <param name="options"></param>
        /// <returns></returns>
        protected virtual async Task WriteModelPropsToJsonAsync(JsonWriter writer, BitOptions options)
        {
            await writer.WritePropertyNameAsync("fver").ConfigureAwait(false);
            await writer.WriteValueAsync(FormatVersionJson).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("mver").ConfigureAwait(false);
            await writer.WriteValueAsync(ModelVersion).ConfigureAwait(false);

            CheckModelId();

            await writer.WritePropertyNameAsync("id").ConfigureAwait(false);
            await writer.WriteValueAsync(Id).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("name").ConfigureAwait(false);
            await writer.WriteValueAsync(Name).ConfigureAwait(false);

            if (options.Contains(MetaDataReadWriteOptions.Description)) {
                await writer.WritePropertyNameAsync("desc").ConfigureAwait(false);
                await writer.WriteValueAsync(Description).ConfigureAwait(false);
            }

            if (options.Contains(MetaDataReadWriteOptions.CustomInfo)) {
                await writer.WritePropertyNameAsync("cstinf").ConfigureAwait(false);
                await writer.WriteValueAsync(CustomInfo.ToString()).ConfigureAwait(false);
            }          
        }

        /// <summary>
        /// Writes the main content of the model to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer.</param>
        /// <param name="rwOptions">The read/write options.</param>
        /// <returns>Task.</returns>
        protected virtual async Task WriteContentToJsonAsync(JsonWriter writer, BitOptions rwOptions)
        {

            // Editors must be saved before operators
            if (rwOptions.Contains(MetaDataReadWriteOptions.Editors)) {
                await writer.WritePropertyNameAsync("editors").ConfigureAwait(false);
                await Editors.WriteToJsonAsync(writer, rwOptions, true).ConfigureAwait(false);
            }

            if (rwOptions.Contains(MetaDataReadWriteOptions.Entities)) {
                await writer.WritePropertyNameAsync("maxAttrId").ConfigureAwait(false);
                await writer.WriteValueAsync(_maxEntAttrId).ConfigureAwait(false);

                await writer.WritePropertyNameAsync("entroot").ConfigureAwait(false);
                await EntityRoot.WriteToJsonAsync(writer, rwOptions).ConfigureAwait(false);
            }
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
        /// <returns>Task.</returns>
        /// <exception cref="BadJsonFormatException"></exception>
        public async Task ReadFromJsonAsync(JsonReader reader, BitOptions options)
        {
            if (!await reader.ReadAsync().ConfigureAwait(false)
                || reader.TokenType != JsonToken.StartObject)
            {
                throw new BadJsonFormatException(reader.Path);
            }

            if (!options.Contains(MetaDataReadWriteOptions.KeepCurrent)) {
                Clear();
            }
           
            while (await reader.ReadAsync()) {
                if (reader.TokenType == JsonToken.PropertyName) {
                    string propName = reader.Value.ToString();
                    await ReadOneModelPropFromJsonAsync(reader, propName).ConfigureAwait(false);
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
        /// <returns>Task.</returns>
        protected virtual async Task ReadOneModelPropFromJsonAsync(JsonReader reader, string propName)
        {
            switch (propName)
            {
                case "entroot":
                    await reader.ReadAsync().ConfigureAwait(false); //readring start object
                    await EntityRoot.ReadFromJsonAsync(reader).ConfigureAwait(false);
                    break;
                case "fver":
                    _formatVersionReadJson = (await reader.ReadAsInt32Async().ConfigureAwait(false)).Value;
                    break;
                case "mver":
                    ModelVersion = (await reader.ReadAsInt32Async().ConfigureAwait(false)).Value;
                    break;
                case "id":
                    Id = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                case "name":
                    Name = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                case "desc":
                    Description = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                case "cstinf":
                    CustomInfo = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                case "maxAttrId":
                    _maxEntAttrId = (await reader.ReadAsInt32Async().ConfigureAwait(false)).Value;
                    break;
                case "editors":
                    await reader.ReadAsync().ConfigureAwait(false); //reading StartArray token
                    await Editors.ReadFromJsonAsync(reader).ConfigureAwait(false);
                    break;
                default:
                    await reader.SkipAsync().ConfigureAwait(false);
                    break;
            }
        }
        #endregion
    }
}