using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;

namespace EasyData
{
    public class DataUtils
    {
        public static string PrettifyName(string name)
        {

            name = name.Replace('_', ' ');
            name = ReplaceChar(name, char.ToUpper(name[0]), 0);

            var result = new StringBuilder();

            bool prevCharIsUpper = true;
            foreach (var ch in name) {

                if (ch == ' ') {
                    result.Append(' ');
                    prevCharIsUpper = true;
                    continue;
                }

                if (char.IsUpper(ch)) {
                    if (!prevCharIsUpper)
                        result.Append(' ');
                    prevCharIsUpper = true;
                }
                else {
                    prevCharIsUpper = false;
                }

                result.Append(ch);
            }

            return result.ToString();
        }

        ///<summary>
        /// Written to replace char in string 
        ///</summary>
        private static string ReplaceChar(string curString, char symb, int index)
        {

            var newString = curString.ToCharArray();

            if (index > -1 && index < newString.Length)
                newString[index] = symb;

            return new string(newString);
        }

        ///<summary>
        /// Change single to plural
        ///</summary>
        public static string MakePlural(string name)
        {

            if (name.EndsWith("y")) {
                name = name.Remove(name.Length - 1);
                name += "ies";
            }
            else if (name.EndsWith("s")
                || name.EndsWith("x")
                || name.EndsWith("o")
                || name.EndsWith("ss")
                || name.EndsWith("sh")
                || name.EndsWith("ch"))
            {
                name += "es";
            }
            else if (name.EndsWith("fe")) {
                name = name.Remove(name.Length - 2);
                name += "ves";

            }
            else if (name.EndsWith("f")) {
                name = name.Remove(name.Length - 1);
                name += "ves";
            }
            else {
                name += "s";
            }
             

            return name;
        }
           
        public static string ComposeKey(string parent, string child)
        {
            if (string.IsNullOrEmpty(parent) && string.IsNullOrEmpty(child))
                throw new ArgumentNullException("parent & child");
            if (string.IsNullOrEmpty(child))
                return parent;
            if (string.IsNullOrEmpty(parent))
                return child;
            return string.Format("{0}.{1}", parent, child);
        }

        /// <summary>
        /// Gets the type of the data type by system type.
        /// </summary>
        /// <param name="systemType">Type of the system type.</param>
        /// <returns></returns>
        public static DataType GetDataTypeBySystemType(Type systemType)
        {
            if (systemType.IsEnum)
                return GetDataTypeBySystemType(systemType.GetEnumUnderlyingType());
            if (systemType == typeof(bool) || systemType == typeof(bool?))
                return DataType.Bool;
            if (systemType == typeof(byte[]))
                return DataType.Blob;
            if (systemType == typeof(Guid) || systemType == typeof(Guid?))
                return DataType.Guid;
            if (systemType == typeof(byte) || systemType == typeof(char) || systemType == typeof(sbyte) 
                || systemType == typeof(byte?) || systemType == typeof(char?) || systemType == typeof(sbyte?))
                return DataType.Byte;
            if (systemType == typeof(DateTime) || systemType == typeof(DateTime?)
                     || systemType == typeof(DateTimeOffset) || systemType == typeof(DateTimeOffset?))
                return DataType.DateTime;
            if (systemType == typeof(TimeSpan) || systemType == typeof(TimeSpan?))
                return DataType.Time;
            if (systemType == typeof(decimal) || systemType == typeof(decimal?))
                return DataType.Currency;
            if (systemType == typeof(double) || systemType == typeof(float) 
                || systemType == typeof(double?) || systemType == typeof(float?))
                return DataType.Float;
            if (systemType == typeof(short) || systemType == typeof(ushort) 
                || systemType == typeof(short?) || systemType == typeof(ushort?))
                return DataType.Word;
            if (systemType == typeof(int) || systemType == typeof(uint) 
                || systemType == typeof(int?) || systemType == typeof(uint?))
                return DataType.Int32;
            if (systemType == typeof(long) || systemType == typeof(ulong) 
                || systemType == typeof(long?) || systemType == typeof(ulong?))
                return DataType.Int64;
            if (systemType == typeof(string))
                return DataType.String;

#if NET6_0
            if (systemType == typeof(DateOnly) || systemType == typeof(DateOnly?))
                return DataType.Date;
            if (systemType == typeof(TimeOnly) || systemType == typeof(TimeOnly?))
                return DataType.Time;
#endif

            return DataType.Unknown;
        }

        /// <summary>
        /// Builds sequence display format for enum.
        /// </summary>
        /// <param name="enumType">Type of the enum.</param>
        /// <returns></returns>
        public static string ComposeDisplayFormatForEnum(Type enumType)
        {
            if (!enumType.IsEnum)
                return "";

            var result = string.Join("|", enumType.GetFields()
                .Where(f => f.Name != "value__")
                .Select(f => $"{f.Name}={f.GetRawConstantValue()}"));
           
            return "{0:S" + result + "}";
        }

   

        /// <summary>
        /// Convert string representation in internal format to DateTime value.
        /// </summary>
        /// <param name="val">The val.</param>
        /// <param name="dataType">Type of the data. Can be Date, DateTime or Time.</param>
        /// <returns></returns>
        public static DateTime InternalFormatToDateTime(string val, DataType dataType)
        {
            if (string.IsNullOrEmpty(val))
                return DateTime.Now;
            string format = GetDateTimeInternalFormat(dataType);
            DateTime result;
            if (!DateTime.TryParseExact(val, format, DateTimeFormatInfo.InvariantInfo, DateTimeStyles.AllowWhiteSpaces, out result))
            {
                format = GetDateTimeInternalFormat(DataType.Date);
                if (!DateTime.TryParseExact(val, format, DateTimeFormatInfo.InvariantInfo, DateTimeStyles.AllowWhiteSpaces, out result))
                {
                    format = GetDateTimeInternalFormat(DataType.DateTime, true);
                    if (!DateTime.TryParseExact(val, format, DateTimeFormatInfo.InvariantInfo, DateTimeStyles.AllowWhiteSpaces, out result))
                        throw new ArgumentException("Wrong date/time format: " + val);
                }
            }

            return result;
        }

        /// <summary>
        /// Converts DateTime value to its string representation in internal format (yyyy-MM-dd).
        /// </summary>
        /// <param name="dt">A DateTime value.</param>
        /// <param name="dataType">Type of the data. Can be Date, DateTime or Time.</param>
        /// <returns></returns>
		public static string DateTimeToInternalFormat(DateTime dt, DataType dataType)
        {
            string format = GetDateTimeInternalFormat(dataType);
            return dt.ToString(format);
        }

        /// <summary>
        /// Gets the format used for internal textual representation of date/time values.
        /// EasyQuery uses "yyyy-MM-dd" format.
        /// </summary>
        /// <param name="dataType">Type of the data. Can be Date, DateTime or Time.</param>
        /// <param name="shortTime">if set to <c>true</c> then we need short version of time part.</param>
        /// <returns>System.String.</returns>
        /// <value></value>
        public static string GetDateTimeInternalFormat(DataType dataType, bool shortTime = false)
        {
            switch (dataType)
            {
                case DataType.Date: 
                    return internalDateFormat;
                case DataType.Time: 
                    return internalTimeFormat;
                default: 
                    return $"{internalDateFormat} {(shortTime ? internalShortTimeFormat : internalTimeFormat)}";
            }

        }

        private static IFormatProvider _internalFormatProvider = null;

        /// <summary>
        /// Gets the internal format provider.
        /// This provider defines the format used to store date/time and numeric values internally and it saved queries
        /// </summary>
        /// <value>The internal format provider.</value>
        public static IFormatProvider GetInternalFormatProvider()
        {
            if (_internalFormatProvider == null)
            {
                var ci = new CultureInfo("en-US");
                ci.DateTimeFormat.LongDatePattern = internalDateFormat;
                ci.DateTimeFormat.LongTimePattern = internalTimeFormat;
                _internalFormatProvider = ci;
            }
            return _internalFormatProvider;
        }

        private static string internalDateFormat = "yyyy'-'MM'-'dd";
        private static string internalTimeFormat = "HH':'mm':'ss";
        private static string internalShortTimeFormat = "HH':'mm";

        /// <summary>
        /// Gets the internal date format (yyyy-MM-dd).
        /// </summary>
        /// <value>The internal date format.</value>
		public static string InternalDateFormat => internalDateFormat;

        /// <summary>
        /// Gets the internal time format (HH:mm:ss).
        /// </summary>
        /// <value>The internal time format.</value>
		public static string InternalTimeFormat => internalTimeFormat;
      

        /// <summary>
        /// Converts DateTime value to its string representation in current system format.
        /// </summary>
        /// <param name="dt">A DateTime value.</param>
        /// <param name="dataType">Type of the data. Can be Date, DateTime or Time.</param>
        /// <returns></returns>
		public static string DateTimeToUserFormat(DateTime dt, DataType dataType)
        {
            string format;
            switch (dataType)
            {
                case DataType.Date: format = "d"; break;
                case DataType.Time: format = "T"; break;
                default: format = "G"; break;
            }
            return dt.ToString(format, System.Globalization.DateTimeFormatInfo.CurrentInfo);
        }
    }
}
