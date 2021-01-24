using System;
using System.Collections.ObjectModel;
using System.Collections.Generic;
using System.Threading.Tasks;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace EasyData
{

    /// <summary>
    /// Defines the constants for value editors' tags.
    /// </summary>
    public static class EditorTags
    {
        /// <summary>Represents a simple text editor</summary>
        public const string Text = "EDIT";

        /// <summary>Represents a date/time editor</summary>
        public const string DateTime = "DATETIME";

        /// <summary>Represents a date editor</summary>
        public const string Date = "DATE";

        /// <summary>Represents a time editor</summary>
        public const string Time = "TIME";

        /// <summary>Represents a custom list value editor</summary>
        public const string CustomList = "CUSTOMLIST";

        /// <summary>Represents a constant list value editor</summary>
        public const string ConstList = "LIST";

        /// <summary>Represents a list value editor which uses a list box control to show the values</summary>
        public const string ConstListBox = "LISTBOX";

        /// <summary>Represents a list value editor which allows to select several values at once</summary>
        public const string ConstListMulty = "MULTILIST";

        /// <summary>Represents a custom value editor</summary>
        public const string Custom = "CUSTOM";
    }

    /// <summary>
    /// Internal interface used for definition new (custom) types of value editors
    /// </summary>
    public interface IValueEditorCreator
    {
        /// <summary>
        /// Creates an instance of ValueEditor.
        /// </summary>
        /// <returns>ValueEditor object.</returns>
        ValueEditor Create(string tag);
    }


    internal class BasicValueEditorsCreator : IValueEditorCreator
    {
        public ValueEditor Create(string tag)
        {
            switch (tag)
            {
                case EditorTags.Text:
                    return new TextValueEditor();

                case EditorTags.DateTime:
                    return new DateTimeValueEditor();

                case EditorTags.Date:
                    var dateEditor = new DateTimeValueEditor();
                    dateEditor.SubType = DataType.Date;
                    return dateEditor;

                case EditorTags.Time:
                    var timeEditor = new DateTimeValueEditor();
                    timeEditor.SubType = DataType.Time;
                    return timeEditor;

                case EditorTags.CustomList:
                    return new CustomListValueEditor();

                case EditorTags.ConstList:
                    return new ConstListValueEditor();

                case EditorTags.ConstListBox:
                    var listBoxEditor = new ConstListValueEditor();
                    listBoxEditor.ControlType = "LISTBOX";
                    return listBoxEditor;

                case EditorTags.ConstListMulty:
                    var multiListEditor = new ConstListValueEditor();
                    multiListEditor.ControlType = "MULTILIST";
                    return multiListEditor;

                case EditorTags.Custom:
                    return new CustomValueEditor();

                default:
                    return null;
            }
        }
    }

    /// <summary>
    /// Represents an abstract value editor. 
    /// </summary>
    /// <remarks>
    /// Value editor defines the way how user input the constant values in query panel.
    /// The simplest type of value editor is "EDIT" which represents one edit field where user can type necessary value.
    /// Other type of value editor is "LIST" - it allows to select necessary value from some list of available values.
    /// </remarks>
    public class ValueEditor
    {
        internal static IList<IValueEditorCreator> Creators = new List<IValueEditorCreator>();
        /// <summary>
        /// Registers new type of value editor. 
        /// </summary>
        /// <param name="creator">An object that implementats IValueEditorCeator iterface.</param>
        /// <returns>Returns true if registration succeed. Otherwise - false.</returns>
        static public bool RegisterCreator(IValueEditorCreator creator)
        {
            Creators.Add(creator);
            return true;
        }


        private static int maxID = 0;
        /// <summary>
        /// Gets the next value editor identifier.
        /// </summary>
        /// <returns>System.Int32.</returns>
        protected static int GetNextID()
        {
            return ++maxID;
        }

        /// <summary>
        /// Creates a value editor instance of the specified type.
        /// </summary>
        /// <param name="tag">The tag which represents the editor.</param>
        /// <returns>New created ValueEditor object if type is recognized. Otherwise - null.</returns>
        public static ValueEditor Create(string tag)
        {
            //running backwards to process newer creators first
            for (var i = Creators.Count - 1; i >= 0; i--)
            {
                var editor = Creators[i].Create(tag);
                if (editor != null)
                {
                    return editor;
                }
            }
            return new CustomValueEditor(tag); //return custom value editor if nothing has been found
        }


        /// <summary>
        /// Initializes a new instance of the <see cref="ValueEditor"/> class.
        /// </summary>
        public ValueEditor() : this(null)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ValueEditor"/> class.
        /// </summary>
        /// <param name="id">Value Editor ID.</param>
        public ValueEditor(string id)
        {
            if (string.IsNullOrEmpty(id)) {
                Id = IdBase + GetNextID();
            }
            else {
                this.Id = id;
            }
        }

        /// <summary>
        /// Gets or sets the ID of this value editor instance.
        /// </summary>
        /// <value>
        /// The ID.
        /// </value>
        public string Id { get; set; }


        /// <summary>
        /// Gets or sets a value indicating whether this editor is one of the default ones.
        /// </summary>
        /// <value><c>true</c> if this instance is default; otherwise, <c>false</c>.</value>
        public bool IsDefault { get; internal protected set; } = false;

        /// <summary>
        /// Gets the base part of identifier.
        /// </summary>
        /// <value>The identifier base.</value>
        public virtual string IdBase
        {
            get {
                return this.GetType().Name;
            }
        }

        /// <summary>
        /// Gets the full name of the value editor class type.
        /// </summary>
        /// <value></value>
        public static string STypeCaption
        {
            get { return ""; }
        }

        /// <summary>
        /// Gets the name of the value editor type.
        /// </summary>
        /// <value>The name of the value editor type.</value>
        public virtual string Tag
        {
            get { return ""; }
        }

        /// <summary>
        /// Gets the XML definition of value editor.
        /// </summary>
        /// <value>The XML definition of value editor.</value>
        /// <remarks> 
        /// This defenition can be used for creation necessary row element 
        /// which represents current value editor in XListBox control.
        /// </remarks>
        public virtual string XmlDefinition
        {
            get { return ""; }
        }

        /// <summary>
        /// Gets or sets the default value.
        /// </summary>
        /// <value>The default value</value>
        public virtual string DefaultValue
        {
            get { return ""; }
            set { }
        }

        /// <summary>
        /// Gets or sets the default text.
        /// </summary>
        /// <value>The default text.</value>
        public virtual string DefaultText
        {
            get { return ""; }
            set { }
        }

        private DataType resultType = DataType.Unknown;

        /// <summary>
        /// Gets or sets the data type of edited values
        /// </summary>
        /// <value>The data type of edited values.</value>
        public virtual DataType ResultType
        {
            get {
                return resultType;
            }
            set {
                resultType = value;
            }
        }

        /// <summary>
        /// Check current editor in model and adds it into Editors list if necessary.
        /// </summary>
        /// <param name="model">The model.</param>
        public void CheckInModel(MetaData model)
        {
            if (model.Editors.IndexById(this.Id) < 0) {
                model.Editors.Add(this);
            }
        }

        /// <summary>
        /// Gets the model which this editor belongs to
        /// </summary>
        public MetaData Model { get; internal set; }

        #region JSON serialization

        /// <summary>
        /// Creates a value editor based on the value of "tag" property and reads the content of the newly created editor from JSON (asynchronous way).
        /// </summary>
        /// <param name="reader">The reader.</param>
        /// <returns>Task&lt;ValueEditor&gt;.</returns>
        /// <exception cref="BadJsonFormatException">
        /// </exception>
        public static async Task<ValueEditor> ReadFromJsonAsync(JsonReader reader)
        {
            if (reader.TokenType != JsonToken.StartObject)
            {
                throw new BadJsonFormatException(reader.Path);
            }

            var jObject = await JObject.LoadAsync(reader).ConfigureAwait(false);
            if (!jObject.TryGetValue("tag", out var tagToken))
            {
                throw new BadJsonFormatException(jObject.Path);
            }

            var editor = ValueEditor.Create(tagToken.ToString());
            var editorReader = jObject.CreateReader();
            await editorReader.ReadAsync().ConfigureAwait(false);
            await editor.ReadContentFromJsonAsync(editorReader).ConfigureAwait(false);

            return editor;
        }

        /// <summary>
        /// Writes the value editor to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer</param>
        /// <param name="rwOptions">Read/write options.</param>
        /// <returns>Task</returns>
        public async Task WriteToJsonAsync(JsonWriter writer, BitOptions rwOptions)
        {
            await writer.WriteStartObjectAsync().ConfigureAwait(false);
            await writer.WritePropertyNameAsync("tag").ConfigureAwait(false);
            await writer.WriteValueAsync(Tag).ConfigureAwait(false);
            await WritePropertiesToJsonAsync(writer, rwOptions).ConfigureAwait(false);
            await writer.WriteEndObjectAsync().ConfigureAwait(false);
        }

        /// <summary>
        /// Writes the content of the value editor to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer.</param>
        /// <param name="rwOptions">Read/write options.</param>
        /// <returns>Task.</returns>
        protected virtual async Task WritePropertiesToJsonAsync(JsonWriter writer, BitOptions rwOptions)
        {
            await writer.WritePropertyNameAsync("id").ConfigureAwait(false);
            await writer.WriteValueAsync(Id).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("rtype").ConfigureAwait(false);
            await writer.WriteValueAsync(ResultType).ConfigureAwait(false);
        }

        /// <summary>
        /// Reads the content of the value editor from JSON (asynchronous way).
        /// </summary>
        /// <param name="reader">The reader</param>
        /// <returns></returns>
        public async Task ReadContentFromJsonAsync(JsonReader reader)
        {

            if (reader.TokenType != JsonToken.StartObject)
            {
                throw new BadJsonFormatException(reader.Path);
            }

            while (await reader.ReadAsync().ConfigureAwait(false)
                && reader.TokenType != JsonToken.EndObject)
            {

                var propertyName = reader.Value.ToString();
                await ReadOnePropFromJsonAsync(reader, propertyName).ConfigureAwait(false);
            }

        }


        /// <summary>
        /// Reads one editor's property from JSON (asynchronous way).
        /// </summary>
        /// <param name="reader">The reader</param>
        /// <param name="propName">The name of the property to read</param>
        /// <returns></returns>
        protected virtual async Task ReadOnePropFromJsonAsync(JsonReader reader, string propName)
        {
            switch (propName)
            {
                case "id":
                    Id = await reader.ReadAsStringAsync().ConfigureAwait(false);
                    break;
                case "rtype":
                    ResultType = (DataType)await reader.ReadAsInt32Async().ConfigureAwait(false);
                    break;
                default:
                    await reader.SkipAsync().ConfigureAwait(false);
                    break;
            }
        }

        #endregion //New JSON format serialization
    }

    /// <summary>
    /// Represents list of value editors
    /// </summary>
    public class ValueEditorList : Collection<ValueEditor>
    {
        /// <summary>
        /// Find valueeditor index by ID.
        /// </summary>
        /// <param name="editorId">ID of operator.</param>
        /// <returns>Operator index in the list or -1 if operator with specified ID was not found</returns>
        public int IndexById(string editorId)
        {
            for (int result = 0; result < Count; result++)
                if (this[result].Id == editorId)
                    return result;
            return -1;
        }

        /// <summary>
        /// Finds the valueeditor by ID.
        /// </summary>
        /// <param name="editorId">ID of operator.</param>
        /// <returns>Operator object or null if operator with specified ID was not found.</returns>
        public ValueEditor FindById(string editorId)
        {
            int index = IndexById(editorId);
            if (index >= 0)
                return this[index];
            return null;
        }

        internal string NormalizeId(string id)
        {
            int num = 1;
            string baseId = "";
            if (id == "CustomList value editor")
                baseId = "CLVE";
            else if (id == "SqlList value editor")
                baseId = "SLVE";
            else if (id == "DateTime value editor")
                baseId = "DTVE";
            else if (id == "Text value editor")
                baseId = "TxtVE";
            else
                baseId = id;

            string result = baseId + num.ToString("D2");

            while (IndexById(result) >= 0)
            {
                num++;
                result = baseId + num.ToString("D2");
            }

            return result;
        }


        #region JSON serialization

        /// <summary>
        /// Writes the list of the value editors to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer.</param>
        /// <param name="rwOptions">Read/write options.</param>
        /// <param name="includeDefaults">if set to <c>true</c> then the default editors must be saved as well.</param>
        /// <returns>Task.</returns>
        public async Task WriteToJsonAsync(JsonWriter writer, BitOptions rwOptions, bool includeDefaults = false)
        {
            await writer.WriteStartArrayAsync().ConfigureAwait(false);
            foreach (ValueEditor editor in this)
            {
                if (editor != null && (includeDefaults || !editor.IsDefault))
                {
                    await editor.WriteToJsonAsync(writer, rwOptions).ConfigureAwait(false);
                }
            }
            await writer.WriteEndArrayAsync().ConfigureAwait(false);
        }

        /// <summary>
        /// Reads the list of value editors from JSON (asynchronous way).
        /// </summary>
        /// <param name="reader">The reader</param>
        /// <returns></returns>
        public async Task ReadFromJsonAsync(JsonReader reader)
        {
            if (reader.TokenType != JsonToken.StartArray)
            {
                throw new BadJsonFormatException(reader.Path);
            }

            while (await reader.ReadAsync().ConfigureAwait(false)
                && reader.TokenType != JsonToken.EndArray)
            {

                var editor = await ValueEditor.ReadFromJsonAsync(reader)
                    .ConfigureAwait(false);

                if (this.FindById(editor.Id) == null)
                {
                    this.Add(editor);
                }
            }
        }

        #endregion //New JSON format serialization
    }


    /// <summary>
    /// Represents the list of value editors which belongs to some DataModel object.
    /// Implements the <see cref="EasyData.ValueEditorList" />
    /// </summary>
    /// <seealso cref="EasyData.ValueEditorList" />
    public class ValueEditorStore : ValueEditorList
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ValueEditorStore"/> class.
        /// </summary>
        /// <param name="model">The model.</param>
        public ValueEditorStore(MetaData model)
        {
            Model = model;
        }

        /// <summary>
        /// Gets the model.
        /// </summary>
        /// <value>The model.</value>
        public MetaData Model { get; private set; }

        /// <summary>
        /// Inserts an element into the <see cref="T:System.Collections.ObjectModel.Collection`1"></see> at the specified index.
        /// </summary>
        /// <param name="index">The zero-based index at which item should be inserted.</param>
        /// <param name="item">The object to insert. The value can be null for reference types.</param>
        protected override void InsertItem(int index, ValueEditor item)
        {
            base.InsertItem(index, item);
            item.Model = Model;
        }

        /// <summary>
        /// Removes the element at the specified index of the <see cref="T:System.Collections.ObjectModel.Collection`1"></see>.
        /// </summary>
        /// <param name="index">The zero-based index of the element to remove.</param>
        protected override void RemoveItem(int index)
        {
            this[index].Model = null;
            base.RemoveItem(index);
        }

        /// <summary>
        /// Removes all elements from the <see cref="T:System.Collections.ObjectModel.Collection`1"></see>.
        /// </summary>
        protected override void ClearItems()
        {
            foreach (var item in this)
            {
                item.Model = null;
            }
            base.ClearItems();
        }
    }



    /// <summary>
    /// Represents errors that occur during some operation with a value editor.
    /// Implements the <see cref="System.Exception" />
    /// </summary>
    /// <seealso cref="System.Exception" />
    public class ValueEditorException : Exception
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ValueEditorException"/> class.
        /// </summary>
        public ValueEditorException()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ValueEditorException"/> class.
        /// </summary>
        /// <param name="message">The message that describes the error.</param>
        public ValueEditorException(string message) : base(message)
        {
        }
    }
}
