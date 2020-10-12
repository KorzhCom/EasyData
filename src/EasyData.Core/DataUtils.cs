using System;
using System.Collections.Generic;
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
        /// Change plural to single
        ///</summary>
        public static string MakeSingle(string name)
        {
            if (name[name.Length - 1] == 's') {
                //Rule for ending -y 
                if (name.Substring(name.Length - 3) == "ies"){
                    name = name.Remove(name.Length - 3);
                    name += 'y';
                }
                else if (name.Substring(name.Length - 2) == "es") {
                    //Rule for endings -s, -ss, -sh, -ch, -x
                    if (name[name.Length - 3] == 'x' || name[name.Length - 3] == 's' ||
                    (name[name.Length - 3] == 'h' && (name[name.Length - 4] == 's' || name[name.Length - 4] == 'c'))) {
                        name = name.Remove(name.Length - 2);
                    } //Rule for ending -o
                    else if (name[name.Length - 3] == 'o') {
                        name = name.Remove(name.Length - 2);
                        //Rule for ending -f, -fe
                    }
                    else if (name[name.Length - 3] == 'v') {
                        name = name.Remove(name.Length - 3);
                        name += 'f';
                    }
                    else {
                        name = name.Remove(name.Length - 1);
                    }

                }
                else {
                    name = name.Remove(name.Length - 1);
                }

            }
            else {
                // write here code for child - childrem, man - men etc.
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
            if (systemType == typeof(bool) || systemType == typeof(bool?))
                return DataType.Bool;
            else if (systemType == typeof(Guid))
                return DataType.Guid;
            else if (systemType == typeof(byte) || systemType == typeof(char) || systemType == typeof(sbyte) || systemType == typeof(byte?) || systemType == typeof(char?) || systemType == typeof(sbyte?))
                return DataType.Byte;
            else if (systemType == typeof(DateTime) || systemType == typeof(DateTime?)
                     || systemType == typeof(DateTimeOffset) || systemType == typeof(DateTimeOffset?))
                return DataType.DateTime;
            else if (systemType == typeof(TimeSpan) || systemType == typeof(TimeSpan?))
                return DataType.Time;
            else if (systemType == typeof(decimal) || systemType == typeof(decimal?))
                return DataType.Currency;
            else if (systemType == typeof(double) || systemType == typeof(Single) || systemType == typeof(float) || systemType == typeof(double?) || systemType == typeof(Single?) || systemType == typeof(float?))
                return DataType.Float;
            else if (systemType == typeof(short) || systemType == typeof(ushort) || systemType == typeof(short?) || systemType == typeof(ushort?))
                return DataType.Word;
            else if (systemType == typeof(int) || systemType == typeof(uint) || systemType == typeof(int?) || systemType == typeof(uint?))
                return DataType.Int32;
            else if (systemType == typeof(long) || systemType == typeof(ulong) || systemType == typeof(long?) || systemType == typeof(ulong?))
                return DataType.Int64;
            else if (systemType == typeof(string))
                return DataType.String;
            else
                return DataType.Unknown;
        }

    }
}
