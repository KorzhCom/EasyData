using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Data.Common;
using System.Globalization;
using System.Linq;


namespace EasyData
{
    /// <summary>
    /// The result set.
    /// </summary>
    public class EasyDbResultSet : EasyDataResultSet, IDisposable
    {
        /// <summary>
        /// The data reader
        /// </summary>
        protected IDataReader DataReader;

        /// <summary>
        /// Initializes a new instance of the <see cref="EasyDbResultSet" /> class.
        /// </summary>
        /// <param name="dataReader">The data reader.</param>
        /// <param name="options">The options.</param>
        public EasyDbResultSet(IDataReader dataReader, EasyResultSetOptions options) : base(options)
        {
            DataReader = dataReader;

            if (dataReader != null) {
                var schema = dataReader.GetSchemaTable();

                // fill columns
                for (int i = 0; i < schema.Rows.Count; i++) {
                    var colInfo = schema.Rows[i];

                    string colName = (string)colInfo[SchemaTableColumn.ColumnName];

                    var fieldType = (Type)colInfo[SchemaTableColumn.DataType];


                    var columnId = Guid.NewGuid().ToString();
                    var columnType = DataUtils.GetDataTypeBySystemType(fieldType);
                    var displayFormat = "";

                    var column = new EasyDataCol(new EasyDataColDesc {
                        Id = columnId,
                        Label = colName,
                        DisplayFormat = displayFormat,
                        DataType = columnType,
                        Index = i,
                        IsAggr = false
                    });;

                    Cols.Add(column);
                }

                //define GetRows function (with deferred execution)
                IEnumerable<EasyDataRow> GetRows()
                {
                    while (dataReader.Read()) {
                        var row = CreateRow(dataReader);
                        yield return row;

                    }

                    yield break;
                };

                Rows = GetRows();
            }
        }

        private bool IsAllowedType(Type type)
        {
            return !type.IsArray;
        }

        /// <summary>
        /// Creates a new row and fills its content from the data reader.
        /// </summary>
        /// <param name="dataReader">The data reader.</param>
        public virtual EasyDataRow CreateRow(IDataReader dataReader)
        {
            var row = new EasyDataRow();
       
            for (int i = 0; i < dataReader.FieldCount; i++) {
                var col = Cols[i];
                var colIndex = col.Index;
                var fieldType = dataReader.GetFieldType(colIndex);
                if (IsAllowedType(fieldType)) {
                    var value = dataReader.GetValue(colIndex);

                    // Fix for Sqlite problem with decimal fields
                    // We suppose that datareader gives us the strings representation of decimal in Invariant culture (with decimal point)
                    // Otherwise, the default behaviour applied (strings instead decimals)
                    if (fieldType == typeof(String) && col.DataType == DataType.Currency) 
                        try {
                            value = Decimal.Parse(value.ToString(), CultureInfo.InvariantCulture);
                        }
                        catch (Exception) { }

                    if (Options != null && Options.UseTimezoneOffset && (col.DataType == DataType.DateTime
                        || col.DataType == DataType.Time)) {
                            if (value is DateTime dt) {
                                value = dt.AddMinutes(Options.TimezoneOffset);
                            }
                            else if (value is DateTimeOffset dto) {
                                value = dto.AddMinutes(Options.TimezoneOffset);
                            }
                        }
                    row.Add(value);
                }
                else {
                    row.Add("");
                }
            }

            for (var i = dataReader.FieldCount; i < Cols.Count; i++) {
                row.Add("");
            }

            return row;
        }


        /// <summary>
        /// Performs application-defined tasks associated with freeing, releasing, or resetting unmanaged resources.
        /// </summary>
        public void Dispose()
        {
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }

        private bool _disposed;

        /// <summary>
        /// Releases unmanaged and - optionally - managed resources.
        /// </summary>
        /// <param name="disposing"><c>true</c> to release both managed and unmanaged resources; <c>false</c> to release only unmanaged resources.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed) {
                if (disposing) {
                    DataReader?.Dispose();
                }

                _disposed = true;
            }
        }
    }
}
