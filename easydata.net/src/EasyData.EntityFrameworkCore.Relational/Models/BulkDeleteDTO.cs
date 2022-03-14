using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace EasyData.EntityFrameworkCore.Models
{
    /// <summary>
    /// Store information used for deletion in bulk.
    /// </summary>
    public class BulkDeleteDTO
    {
        /// <summary>
        /// Gets or sets Primary Keys of the Records.
        /// </summary>
        [JsonProperty("pks")]
        public JObject[] PrimaryKeys { get; set; }
    }
}
