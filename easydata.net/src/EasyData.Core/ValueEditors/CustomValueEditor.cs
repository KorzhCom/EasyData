using System;
using System.Threading;
using System.Threading.Tasks;

using Newtonsoft.Json;

namespace EasyData
{
    /// <summary>
    /// Represents custom (user defined) value editor.
    /// </summary>
    public class CustomValueEditor : ValueEditor
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CustomValueEditor"/> class.
        /// </summary>
        public CustomValueEditor() : this("")
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="CustomValueEditor"/> class.
        /// </summary>
        /// <param name="tag">The custom tag of this value editor.</param>
        public CustomValueEditor(string tag) : base()
        {
            _tag = tag;
        }

        internal string _tag = "";

        /// <summary>
        /// Gets the name of the value editor type.
        /// </summary>
        /// <value>The name of the value editor type.</value>
        public override string Tag => _tag;
        
        /// <summary>
        /// Gets the full name of the value editor class type.
        /// </summary>
        /// <value></value>
        new public static string STypeCaption => "Custom editor";

        /// <summary>
        /// Gets the XML definition of value editor.
        /// </summary>
        /// <value>The XML definition of value editor.</value>
        /// <remarks>
        /// This defenition can be used for creation necessary row element
        /// which represents current value editor in XListBox control.
        /// </remarks>
        public override string XmlDefinition =>
            "<Label editorType=\"" + Tag + "\" value=\"" + DefaultValue + "\" action=\"ValueRequest\" data=\"" + Data + "\" />";

        /// <summary>
        /// Gets or sets the default value.
        /// </summary>
        /// <value>The default value</value>
        public override string DefaultValue
        {
            get { return ""; }
            set { }
        }

        /// <summary>
        /// Gets or sets the default text.
        /// </summary>
        /// <value>The default text.</value>
        public override string DefaultText
        {
            get { return ""; }
            set { }
        }

        /// <summary>
        /// Reads one editor's property from JSON (asynchronous way).
        /// </summary>
        /// <param name="reader">The reader</param>
        /// <param name="propName">The name of the property which is read</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task</returns>
        protected override async Task ReadOnePropFromJsonAsync(JsonReader reader, string propName, CancellationToken ct)
        {
            switch (propName)
            {
                case "data":
                    Data = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                case "type":
                    _tag = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                    break;
                default:
                    await base.ReadOnePropFromJsonAsync(reader, propName, ct).ConfigureAwait(false);
                    break;
            }
        }

        /// <summary>
        /// Writes the content of the "CUSTOM" value editor to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer</param>
        /// <param name="rwOptions">Read/write options.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task</returns>
        protected override async Task WritePropertiesToJsonAsync(JsonWriter writer, BitOptions rwOptions, CancellationToken ct)
        {
            await base.WritePropertiesToJsonAsync(writer, rwOptions, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("data", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(Data, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("type", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(_tag, ct).ConfigureAwait(false);
        }

        /// <summary>
        /// Gets or sets the data assigned with the editor.
        /// </summary>
        /// <value>Any data assigned with the editor.</value>
        public string Data { get; set; }

    }
}
