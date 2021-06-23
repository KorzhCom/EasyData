using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Newtonsoft.Json;

namespace EasyData
{
    public class FileValueEditor : ValueEditor
    {
        public override string Tag => EditorTags.File;


        public FileValueEditor(string editorId): base(editorId)
        { 
            
        }

        public string Accept { get; set; } = "*.*";

        public override string DefaultValue { get; set; }
        public override string DefaultText { get; set; }

        /// Writes the content of the custom value editor to JSON (asynchronous way).
        /// </summary>
        /// <param name="writer">The writer</param>
        /// <param name="rwOptions">Read/write options.</param>
        /// <param name="ct">The cancellation token.</param>
        /// <returns>Task</returns>
        protected override async Task WritePropertiesToJsonAsync(JsonWriter writer, BitOptions rwOptions, CancellationToken ct)
        {
            await base.WritePropertiesToJsonAsync(writer, rwOptions, ct).ConfigureAwait(false);

            await writer.WritePropertyNameAsync("accept", ct).ConfigureAwait(false);
            await writer.WriteValueAsync(Accept, ct).ConfigureAwait(false);
        }


        /// <summary>
        /// Reads one editor's property from JSON (asynchronous way).
        /// </summary>
        /// <param name="reader">The reader</param>
        /// <param name="propName">The name of the property which is read</param>
        /// <param name="ct">The cancelleation token.</param>
        /// <returns>Task</returns>
        protected override async Task ReadOnePropFromJsonAsync(JsonReader reader, string propName, CancellationToken ct)
        {
            if (propName == "accept") {
                Accept = await reader.ReadAsStringAsync(ct);
            }
            else {
                await base.ReadOnePropFromJsonAsync(reader, propName, ct).ConfigureAwait(false);
            }
        }
    }
}
