using System.Threading;
using System.Threading.Tasks;
using System.Xml;
using System.IO;
using System.Collections.Generic;
using System.Collections.ObjectModel;

using Newtonsoft.Json;

namespace EasyData
{
    /// <summary>
    /// Represents base abstract type of list value editors.
    /// </summary>
    public abstract class ListValueEditor : ValueEditor
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="ListValueEditor"/> class.
        /// </summary>
        public ListValueEditor() : base()
        { }

        /// <summary>
        /// Initializes a new instance of the <see cref="ListValueEditor"/> class.
        /// </summary>
        /// <param name="id">ID of the list value editor</param>
        public ListValueEditor(string id) : base(id)
        { }


        /// <summary>
        /// Gets or sets the type of list control (MENU, LISTBOX, etc).
        /// </summary>
        /// <value></value>
        public string ControlType { get; set; } = "MENU";

        /// <summary>
        /// Gets or sets a value indicating whether this <see cref="ListValueEditor"/> allows to select several items.
        /// </summary>
        /// <value>
        ///   <c>true</c> if multiselect; otherwise, <c>false</c>.
        /// </value>
        public bool Multiselect { get; set; } = false;

        /// <summary>
        /// Gets ExtraParams for this <see cref="ListValueEditor"/>.
        /// </summary>
        public Dictionary<string, string> ExtraParams { get; private set; } = new Dictionary<string, string>();


        /// <summary>
        /// Writes the content of the custom value editor to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer</param>
        /// <param name="rwOptions">Read/write options.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task</returns>
        protected override async Task WritePropertiesToJsonAsync(JsonWriter writer, BitOptions rwOptions, CancellationToken ct = default)
        {
            await base.WritePropertiesToJsonAsync(writer, rwOptions, ct).ConfigureAwait(false);

            if (ExtraParams.Count > 0) {

                await writer.WritePropertyNameAsync("extraParams", ct).ConfigureAwait(false);
                await writer.WriteStartObjectAsync(ct).ConfigureAwait(false);

                foreach (var kv in ExtraParams) {
                    await writer.WritePropertyNameAsync(kv.Key, ct).ConfigureAwait(false);
                    await writer.WriteValueAsync(kv.Value, ct).ConfigureAwait(false);
                }

                await writer.WriteEndObjectAsync(ct).ConfigureAwait(false);
            }
        }


        /// <summary>
        /// Reads one editor's property from JSON (asynchronous way).
        /// </summary>
        /// <param name="reader">The reader</param>
        /// <param name="propName">The name of the property which is read</param>
        /// <param name="ct">The cancelleation token.</param>
        /// <returns>Task</returns>
        protected override async Task ReadOnePropFromJsonAsync(JsonReader reader, string propName, CancellationToken ct = default)
        {
            if (propName == "extraParams") {
                await reader.ReadAsync(ct).ConfigureAwait(false);
                if (reader.TokenType != JsonToken.StartObject) {
                    throw new BadJsonFormatException(reader.Path);
                }

                while ((await reader.ReadAsync(ct).ConfigureAwait(false))
                    && reader.TokenType != JsonToken.EndObject) {
                    var paramName = reader.Value.ToString();
                    ExtraParams.Add(paramName, await reader.ReadAsStringAsync(ct).ConfigureAwait(false));
                }
            }
            else {
                await base.ReadOnePropFromJsonAsync(reader, propName, ct).ConfigureAwait(false);
            }
        }
    }

    /// <summary>
    /// Represents custom (user-defined) list value editor
    /// </summary>
    public class CustomListValueEditor : ListValueEditor
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="CustomListValueEditor"/> class.
        /// </summary>
        internal CustomListValueEditor() : base()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="CustomListValueEditor"/> class.
        /// </summary>
        /// <param name="id">The ID of the custom value editor</param>
        /// <param name="listName">Name of the list.</param>
        /// <param name="controlType">Type of the control.</param>
        public CustomListValueEditor(string id, string listName, string controlType = "MENU") : base(id)
        {
            ListName = listName ?? "";
            ControlType = controlType;
        }

        /// <summary>
        /// Gets or sets the default value.
        /// </summary>
        /// <value>The default value</value>
        public override string DefaultValue { get; set; }


        /// <summary>
        /// Gets or sets the default text.
        /// </summary>
        /// <value>The default text.</value>
        public override string DefaultText { get; set; }

        /// <summary>
        /// Gets or sets the name of the list.
        /// </summary>
        /// <value>The name of the list.</value>
        public string ListName { get; set; } = "";

        /// <summary>
        /// Gets the full name of the value editor class type.
        /// </summary>
        /// <value></value>
        new public static string STypeCaption => "Custom list value editor";

        /// <summary>
        /// Gets the base part of identifier.
        /// </summary>
        /// <value>The identifier base.</value>
        public override string IdBase => "CLVE";

        /// <summary>
        /// Gets the value editor's tag.
        /// </summary>
        /// <value>The tag of the value editor.</value>
        public override string Tag => EditorTags.CustomList;

        /// <summary>
        /// Gets the XML definition of value editor.
        /// </summary>
        /// <value>The XML definition of value editor.</value>
        /// <remarks>
        /// This defenition can be used for creation necessary row element
        /// which represents current value editor in XListBox control.
        /// </remarks>
        public override string XmlDefinition => 
            "<List id=\"" + Id + "\" listName=\"" + ListName + "\" controlType=\"" + ControlType + "\" multiselect=\"" + Multiselect.ToString() + "\"   />\r\n";

        /// <summary>
        /// Gets or sets the data type of edited values
        /// </summary>
        /// <value>
        /// The data type of edited values.
        /// </value>
        public override DataType ResultType { get; set; }


        /// <summary>
        /// Writes the content of the custom value editor to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer</param>
        /// <param name="rwOptions">Read/write options.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task</returns>
        protected override async Task WritePropertiesToJsonAsync(JsonWriter writer, BitOptions rwOptions, CancellationToken ct)
        {
            await base.WritePropertiesToJsonAsync(writer, rwOptions, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("name", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(ListName, ct).ConfigureAwait(false);
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
            if (propName == "name") {
                ListName = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
            }
            else {
                await base.ReadOnePropFromJsonAsync(reader, propName, ct).ConfigureAwait(false);
            }
        }
    }

    /// <summary>
    /// Represents one item in the list of available values for LIST value editor.
    /// </summary>
    public class ConstValueItem
    {
        /// <summary>
        /// Gets or sets the value.
        /// </summary>
        /// <value></value>
        public virtual string Id { get; set; }

        /// <summary>
        /// Gets or sets the caption.
        /// </summary>
        /// <value></value>
        public virtual string Text { get; set; }
    }

    /// <summary>
    /// Represents list of availalbe values. 
    /// Each item contain the value itself and some caption representing this value.
    /// </summary>
    public class ConstValueList : Collection<ConstValueItem>
    {
        /// <summary>
        /// Adds new item with the specified value and caption into the list.
        /// </summary>
        /// <param name="id">Value ID.</param>
        /// <param name="text">Value text.</param>
        /// <returns>The index of new item in list.</returns>
        public int Add(string id, string text)
        {
            ConstValueItem item = new ConstValueItem();
            item.Id = id;
            item.Text = text;
            base.Add(item);
            return Count - 1;
        }

    }

    /// <summary>
    /// Represents the constant list value editor.
    /// </summary>
    public class ConstListValueEditor : ListValueEditor
    {
        /// <summary>
        /// Gets the full name of the value editor class type.
        /// </summary>
        /// <value></value>
        new public static string STypeCaption => "Constant list value editor";

        /// <summary>
        /// Gets the name of the value editor type.
        /// </summary>
        /// <value>The name of the value editor type.</value>
        public override string Tag => EditorTags.ConstList;

        /// <summary>
        /// Gets the XML definition of value editor.
        /// </summary>
        /// <value>The XML definition of value editor.</value>
        /// <remarks>
        /// This defenition can be used for creation necessary row element
        /// which represents current value editor in XListBox control.
        /// </remarks>
        public override string XmlDefinition
        {
            get {
                string defID = "", defText = "";

                XmlWriterSettings settings = new XmlWriterSettings();
                settings.Encoding = System.Text.Encoding.UTF8;
                settings.OmitXmlDeclaration = true;
                settings.ConformanceLevel = ConformanceLevel.Fragment;
                settings.CloseOutput = true;

                StringWriter sw = new StringWriter();
                using (XmlWriter writer = XmlWriter.Create(sw, settings)) {

                    writer.WriteStartElement("List");
                    writer.WriteAttributeString("value", defID);
                    writer.WriteAttributeString("text", defText);
                    writer.WriteAttributeString("controlType", ControlType);
                    writer.WriteAttributeString("multiselect", Multiselect.ToString());

                    foreach (ConstValueItem item in Values) {
                        writer.WriteStartElement("Item");
                        writer.WriteAttributeString("value", item.Id);
                        writer.WriteAttributeString("text", item.Text);
                        writer.WriteEndElement();
                    }

                    writer.WriteEndElement();

                    writer.Flush();
                }

                return sw.ToString();
            }
        }

        private ConstValueList _values;
        /// <summary>
        /// Gets the list of available values.
        /// </summary>
        /// <value>The list of available values.</value>
        public virtual ConstValueList Values
        {
            get { return _values; }
        }


        /// <summary>
        /// Initializes a new instance of the <see cref="ConstListValueEditor"/> class.
        /// </summary>
        /// <param name="id">Value editor's ID</param>
        public ConstListValueEditor(string id) : base(id)
        {
            _values = CreateValueList();
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ConstListValueEditor"/> class.
        /// </summary>
        internal ConstListValueEditor() : base()
        {
            _values = CreateValueList();
        }

        /// <summary>
        /// Creates the value list.
        /// </summary>
        /// <returns>The created ConstValueList object.</returns>
        protected virtual ConstValueList CreateValueList()
        {
            return new ConstValueList();
        }

        /// <summary>
        /// Gets or sets the default value.
        /// </summary>
        /// <value>The default value</value>
        public override string DefaultValue
        {
            get {
                if (Values.Count > 0)
                    return Values[0].Id;
                else
                    return "";
            }
            set { }
        }

        /// <summary>
        /// Gets or sets the default text.
        /// </summary>
        /// <value>The default text.</value>
        public override string DefaultText
        {
            get {
                if (Values.Count > 0)
                    return Values[0].Text;
                else
                    return "";
            }
            set { }
        }

        /// <summary>
        /// Writes the content of the "CONST LIST" value editor to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer</param>
        /// <param name="rwOptions">Different read/write options.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task</returns>
        protected override async Task WritePropertiesToJsonAsync(JsonWriter writer, BitOptions rwOptions, CancellationToken ct)
        {
            await base.WritePropertiesToJsonAsync(writer, rwOptions, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("values", ct).ConfigureAwait(false);
            await writer.WriteStartArrayAsync(ct).ConfigureAwait(false);

            foreach (var value in Values) {
                await writer.WriteStartObjectAsync(ct).ConfigureAwait(false);

                await writer.WritePropertyNameAsync("id", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(value.Id, ct).ConfigureAwait(false);

                await writer.WritePropertyNameAsync("text", ct).ConfigureAwait(false);
                await writer.WriteValueAsync(value.Text, ct).ConfigureAwait(false);

                await writer.WriteEndObjectAsync(ct).ConfigureAwait(false);
            }

            await writer.WriteEndArrayAsync(ct).ConfigureAwait(false);
        }

        /// <summary>
        /// Reads one editor's property from JSON.
        /// </summary>
        /// <param name="reader">The reader</param>
        /// <param name="propName">The name of the property which is read now</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task</returns>
        protected override async Task ReadOnePropFromJsonAsync(JsonReader reader, string propName, CancellationToken ct)
        {
            if (propName == "values") {
                await reader.ReadAsync(ct).ConfigureAwait(false);
                if (reader.TokenType != JsonToken.StartArray) {
                    throw new BadJsonFormatException(reader.Path);
                }

                while (await reader.ReadAsync(ct).ConfigureAwait(false)
                    && reader.TokenType != JsonToken.EndArray) {

                    if (reader.TokenType == JsonToken.StartObject) {

                        var value = new ConstValueItem();
                        while (await reader.ReadAsync(ct).ConfigureAwait(false)
                            && reader.TokenType != JsonToken.EndObject) {

                            var valuePropName = reader.Value.ToString();
                            if (valuePropName == "id") {
                                value.Id = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                            }
                            else if (valuePropName == "text") {
                                value.Text = await reader.ReadAsStringAsync(ct).ConfigureAwait(false);
                            }
                            else {
                                await reader.SkipAsync(ct).ConfigureAwait(false);
                            }
                        }

                        Values.Add(value);

                    }
                    else {
                        throw new BadJsonFormatException(reader.Path);
                    }
                }
            }
            else {
                await base.ReadOnePropFromJsonAsync(reader, propName, ct).ConfigureAwait(false);
            }
        }
    }
}
