using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace EasyData.Services
{
    // Do final data model processing.
    static class ModelProcessor
    {
        // Do model processing.
        public static void Process(this Metadata model)
        {
            // Process blob attributes.
            foreach (var entity in model.EntityRoot.SubEntities) {
                entity.Attributes
                    .Where(attr => attr.DataType == DataType.Blob)
                    .ToList()
                    .ForEach(ProcessBlob);
            }
        }

        /// <summary>
        /// Process blob type attributes.
        /// </summary>
        /// <param name="attribute">Entity attribute metadata.</param>
        public static void ProcessBlob(MetaEntityAttr attribute)
        {
            // Hide blob types.
            attribute.ShowOnCreate = false;
            attribute.ShowOnEdit = false;
            attribute.ShowOnView = false;
        }
    }
}
