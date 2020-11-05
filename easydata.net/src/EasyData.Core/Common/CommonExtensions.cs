using System;

namespace EasyData
{
    /// <summary>
    /// Useful extension methods for EasyQuery's types
    /// </summary>
    public static class CommonExtensions
    {
        /// <summary>
        /// Returns DataType by its numeric representation.
        /// </summary>
        /// <param name="value">An integer value.</param>
        /// <returns>DataType.</returns>
        public static DataType IntToDataType(this int value)
        {
            return (DataType)value;
        }

        /// <summary>
        /// Returns a numeric representation of a DataType value.
        /// </summary>
        /// <param name="dt">A DataType value.</param>
        /// <returns>Int32.</returns>
        public static int ToInt(this DataType dt)
        {
            return (int)dt;
        }

        /// <summary>
        /// Returns DataType value by its string representation 
        /// </summary>
        /// <param name="typeName"></param>
        public static DataType StrToDataType(this string typeName)
        {
            try {
                typeName = typeName.Trim();
                if (typeName == "WideString") {
                    return DataType.String;
                }
                else if (typeName == "Int") {
                    return DataType.Int32;
                }
                else {
                    return (DataType)Enum.Parse(typeof(DataType), typeName, true);
                }
            }
            catch {
                return DataType.Unknown;
            }
        }
    }
}
