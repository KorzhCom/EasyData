using System;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System.Xml;
using Newtonsoft.Json;

namespace EasyData
{
    /// <summary>
    /// Represents a storage of default values
    /// </summary>
    /// <remarks>
    /// </remarks>
    public interface IDefaultValuesStorage
    {
        /// <summary>
        /// Gets the list of default values
        /// </summary>
        ConstValueList DefaultValues
        {
            get;
        }
    }

    /// <summary>
    /// Represents the value editor for date and/or time.
    /// </summary>
    public class DateTimeValueEditor : ValueEditor, IDefaultValuesStorage
    {
        private DataType _subType = DataType.Date;

        /// <summary>
        /// Gets or sets the type of data (Date, Time or DateTime).
        /// </summary>
        /// <value></value>
        public DataType SubType {
            get { return _subType; }
            set {
                _subType = value;
                RecalcDefValue();
            }
        }

        private ConstValueList _defaultValues = new ConstValueList();
        /// <summary>
        /// Gets the list of default values
        /// </summary>
        /// <value></value>
		public ConstValueList DefaultValues
        {
            get { return _defaultValues; }
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="DateTimeValueEditor"/> class.
        /// </summary>
        public DateTimeValueEditor()
        {
            RecalcDefValue();
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="DateTimeValueEditor"/> class.
        /// </summary>
        /// <param name="id">The identifier.</param>
        /// <param name="subType">Sub-Type of the editor.</param>
        public DateTimeValueEditor(string id, DataType subType) : this()
        {
            this.Id = id;
            this.SubType = subType;
        }



        /// <summary>
        /// Gets the full name of the value editor class type.
        /// </summary>
        /// <value></value>
        new public static string STypeCaption
        {
            get { return "Date time value editor"; }
        }

        /// <summary>
        /// Gets the name of the value editor type.
        /// </summary>
        /// <value>The name of the value editor type.</value>
        public override string Tag
        {
            get { return EditorTags.DateTime; }
        }

        /// <summary>
        /// Gets the XML definition of value editor.
        /// </summary>
        /// <value>The XML definition of value editor.</value>
        /// <remarks>
        /// This definition can be used for creation necessary row element
        /// which represents current value editor in XListBox control.
        /// </remarks>
        public override string XmlDefinition
        {
            get {
                string subTypeName;
                switch (SubType)
                {
                    case DataType.Time:
                        subTypeName = "TIME";
                        break;
                    case DataType.Date:
                        subTypeName = "DATE";
                        break;
                    default:
                        subTypeName = "DATETIME";
                        break;
                }

                return "<DateTime value=\"" + DefaultValue + "\" subType=\"" + subTypeName + "\"/>";
            }
        }


        /// <summary>
        /// Reads one editor's property from JSON (asynchronous way).
        /// </summary>
        /// <param name="reader">The reader</param>
        /// <param name="propName">The name of the property which is read</param>
        /// <returns></returns>
        protected override async Task ReadOnePropFromJsonAsync(JsonReader reader, string propName)
        {
            if (propName == "subType") {
                SubType = (DataType)await reader.ReadAsInt32Async().ConfigureAwait(false);
            }
            else {
                await base.ReadOnePropFromJsonAsync(reader, propName).ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Writes the content of the date/time value editor to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer</param>
        /// <param name="rwOptions">Read/write options.</param>
        /// <returns>Task</returns>
        protected override async Task WritePropertiesToJsonAsync(JsonWriter writer, BitOptions rwOptions)
        {
            await base.WritePropertiesToJsonAsync(writer, rwOptions).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("subType").ConfigureAwait(false);
            await writer.WriteValueAsync(SubType).ConfigureAwait(false);
        }

        private string _defaultValue = "${{Today}}";

        private void RecalcDefValue()
        {
            _defaultValue = "${{Today}}";
            ResetDefaultText();
        }

        /// <summary>
        /// Gets or sets the default value.
        /// </summary>
        /// <value>The default value</value>
        public override string DefaultValue
        {
            get { return _defaultValue; }
            set {
                _defaultValue = value;
                ResetDefaultText();
            }
        }

        /// <summary>
        /// Gets or sets the default text.
        /// </summary>
        /// <value>The default text.</value>
        public override string DefaultText { get; set; } = "";

        private static Regex _macroRegex = new Regex("\\$\\{\\{(.*)\\}\\}");

        private void ResetDefaultText()
        {
            MatchCollection macroMatches = _macroRegex.Matches(_defaultValue);
            if (macroMatches.Count > 0) {
                DefaultText = macroMatches[0].Groups[1].Value;
            }
            else if (_defaultValue != "") {
                DateTime dt = DataUtils.InternalFormatToDateTime(_defaultValue, SubType);
                DefaultText = DataUtils.DateTimeToUserFormat(dt, SubType);
            }
            else {
                DefaultText = string.Empty;
            }
        }

    }
}
