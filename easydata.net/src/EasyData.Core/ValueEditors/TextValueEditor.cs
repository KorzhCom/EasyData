using System.Threading.Tasks;

using Newtonsoft.Json;

namespace EasyData
{
    /// <summary>
    /// Represents the simpliest value editor.
    /// </summary>
    public class TextValueEditor : ValueEditor
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="TextValueEditor"/> class.
        /// </summary>
        internal TextValueEditor()
            : this("TVE" + GetNextID(), DataType.String)
        {
        }

        /// <summary>
        /// Gets the base part of identifier.
        /// </summary>
        /// <value>The identifier base.</value>
        public override string IDBase => "TVE";


        /// <summary>
        /// Initializes a new instance of the <see cref="TextValueEditor"/> class.
        /// </summary>
        /// <param name="id">The identifier.</param>
        /// <param name="type">The type.</param>
        public TextValueEditor(string id, DataType type = DataType.String)
        {
            Id = id;
            resultType = type;
        }

        /// <summary>
        /// Gets the tag of the value editor.
        /// </summary>
        /// <value>The name of the value editor type.</value>
        public override string Tag => EditorTags.Text;

        /// <summary>
        /// Gets the full name of the value editor class type.
        /// </summary>
        /// <value></value>
        new public static string STypeCaption => "Text value editor";

        /// <summary>
        /// Gets the XML definition of value editor.
        /// </summary>
        /// <value>The XML definition of value editor.</value>
        /// <remarks>
        /// This defenition can be used for creation necessary row element
        /// which represents current value editor in XListBox control.
        /// </remarks>
        public override string XmlDefinition => "<Edit value=\"" + DefaultValue + "\" multiline=\"" + Multiline.ToString() + "\" />";

        private string defaultValue = "";
        /// <summary>
        /// Gets or sets the default value.
        /// </summary>
        /// <value>The default value</value>
        public override string DefaultValue
        {
            get { return defaultValue; }
            set { defaultValue = value; }
        }

        /// <summary>
        /// Gets or sets the default text.
        /// </summary>
        /// <value>The default text.</value>
        public override string DefaultText
        {
            get { return defaultValue; }
            set { }
        }

        private DataType resultType = DataType.String;

        /// <summary>
        /// Gets or sets the data type of edited values
        /// </summary>
        /// <value>
        /// The data type of edited values.
        /// </value>
        public override DataType ResultType
        {
            get {
                return resultType;
            }
            set {
                resultType = value;
            }
        }

        /// <summary>
        /// Gets or sets a value indicating whether text editor should be multiline.
        /// </summary>
        /// <value><c>true</c> if text editor must be multiline; otherwise, <c>false</c>.</value>
        public bool Multiline { get; set; } = false;

        /// <summary>
        /// Reads one editor's property from JSON (asynchronous way).
        /// </summary>
        /// <param name="reader">The reader</param>
        /// <param name="propName">The name of the property which is read</param>
        /// <returns></returns>
        protected override async Task ReadOnePropFromJsonAsync(JsonReader reader, string propName)
        {
            if (propName == "defval") {
                defaultValue = await reader.ReadAsStringAsync().ConfigureAwait(false);
            }
            else {
                await base.ReadOnePropFromJsonAsync(reader, propName).ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Writes the content of the text value editor to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer</param>
        /// <param name="rwOptions">Read/write options.</param>
        /// <returns>Task</returns>
        protected override async Task WritePropertiesToJsonAsync(JsonWriter writer, BitOptions rwOptions)
        {
            await base.WritePropertiesToJsonAsync(writer, rwOptions).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("defval").ConfigureAwait(false);
            await writer.WriteValueAsync(defaultValue).ConfigureAwait(false);
        }
    }
}
