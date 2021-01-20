using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace EasyData
{
    /// <summary>
	/// Represents the common types of the data. 
	/// </summary>
	public enum DataType
    {
        /// <summary>Unknown type value</summary>
        Unknown = 0,
        /// <summary>String value</summary>
        String = 1,
        /// <summary>8-bit integer value</summary>
        Byte = 2,
        /// <summary>16-bit integer value</summary>
        Word = 3,
        /// <summary>32-bit integer value</summary>
        Int32 = 4,
        /// <summary>64-bit integer value</summary>
        Int64 = 5,
        /// <summary>Boolean value</summary>
        Bool = 6,
        /// <summary>Floating-point numeric value</summary>
        Float = 7,
        /// <summary>Money value</summary>
        Currency = 8,
        /// <summary>Binary-coded decimal value</summary>
        BCD = 9,
        /// <summary>Date value</summary>
        Date = 10,
        /// <summary>Time value</summary>
        Time = 11,
        /// <summary>Date and time value</summary>
        DateTime = 12,
        /// <summary>Autoincrement 32-bit integer value</summary>
        Autoinc = 13,
        /// <summary>MEMO value (text with unlimited length)</summary>
        Memo = 14,
        /// <summary>BLOB value (any data with unlimited length)</summary>
        Blob = 15,
        /// <summary>Fixed character value</summary>
        FixedChar = 16,

        /// <summary> The unique identifier</summary>
        Guid = 17,

        //-------- Spatial data types ----------
        /// <summary>Any geometry data</summary>
        Geometry = 18,

        /// <summary>Any data that represents some geography objects</summary>
        Geography = 19
    }



    /// <summary>
    /// Represents a list of DataType values.
    /// </summary>
    public class DataTypeList : Collection<DataType>
    {
        /// <summary>
        /// Inserts an element into the <see cref="T:System.Collections.ObjectModel.Collection`1"/> at the specified index.
        /// </summary>
        /// <param name="index">The zero-based index at which <paramref name="item"/> should be inserted.</param>
        /// <param name="item">The object to insert. The value can be null for reference types.</param>
        /// <exception cref="T:System.ArgumentOutOfRangeException">
        /// 	<paramref name="index"/> is less than zero.
        /// -or-
        /// <paramref name="index"/> is greater than <see cref="P:System.Collections.ObjectModel.Collection`1.Count"/>.
        /// </exception>
        protected override void InsertItem(int index, DataType item)
        {
            if (Contains(item)) return; //add new data type only if it does not exist in list yet.
            base.InsertItem(index, item);
        }

        /// <summary>
        /// Adds the type stored in an IEnumerable to the end of the list. 
        /// </summary>
        /// <param name="types">The list of types to add.</param>
        public void AddRange(IEnumerable<DataType> types)
        {
            foreach (DataType type in types)
                Add(type);
        }

        /// <summary>
        /// Inserts the types stored in an IEnumerable object into the list starting from specified index. 
        /// </summary>
        /// <param name="index">The index.</param>
        /// <param name="types">The list of types to add.</param>
        public void InsertRange(int index, IEnumerable<DataType> types)
        {
            foreach (DataType type in types)
            {
                Insert(index, type);
                index++;
            }
        }

        /// <summary>
        /// Gets or sets the text representation of type list delimited with the comma.
        /// </summary>
        /// <value>The text representation of type list delimited with the comma.</value>
        public string CommaText
        {
            get {
                string result = "";
                foreach (DataType type in this)
                {
                    if (result != "") result += ", ";
                    result += type.ToString();
                }
                return result;
            }

            set {
                Clear();
                if (value != null)
                {
                    char[] delimiterChars = { ',' };
                    string[] list = value.Split(delimiterChars);
                    foreach (string s in list) {
                        Add(s.StrToDataType());
                    }
                }
            }
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="T:DataTypeList"/> class.
        /// </summary>
        /// <param name="typeList">The array which the list initialized by.</param>
        public DataTypeList(DataType[] typeList) : base()
        {
            foreach (DataType type in typeList)
                Add(type);
        }


        /// <summary>
        /// Initializes a new instance of the <see cref="T:DataTypeList"/> class.
        /// </summary>
        /// <param name="listStr">The list values represented by comma-separated string.</param>
        public DataTypeList(string listStr) : base()
        {
            if (listStr != null && listStr != string.Empty)
                CommaText = listStr;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="T:DataTypeList"/> class.
        /// </summary>
        public DataTypeList() : base()
        {
        }


        /// <summary>
        /// The list which represents the most common data types
        /// </summary>
        static public readonly DataTypeList CommonDataTypes = new DataTypeList(new DataType[] {
            DataType.String,
            DataType.Byte,
            DataType.Word,
            DataType.Int32,
            DataType.Int64,
            DataType.Bool,
            DataType.Float,
            DataType.Currency,
            DataType.BCD,
            DataType.Date,
            DataType.Time,
            DataType.DateTime,
            DataType.Autoinc,
            DataType.Memo,
            DataType.FixedChar
        });

        /// <summary>
        /// The list which represents all ranged data types (numeric and boolean)
        /// </summary>
        static public readonly DataTypeList RangeDataTypes = new DataTypeList(new DataType[] {
            DataType.Byte,
            DataType.Word,
            DataType.Int32,
            DataType.Int64,
            DataType.Float,
            DataType.Currency,
            DataType.BCD,
            DataType.Autoinc
        });

        /// <summary>
        /// The list which represents all integer-like data types (numeric and boolean)
        /// </summary>
        static public readonly DataTypeList IntegerDataTypes = new DataTypeList(new DataType[] {
            DataType.Byte,
            DataType.Word,
            DataType.Int32,
            DataType.Int64,
            DataType.Bool,
            DataType.Autoinc
        });


        /// <summary>
        /// The list which represents all string data types (numeric and boolean)
        /// </summary>
        static public readonly DataTypeList StringDataTypes = new DataTypeList(new DataType[] {
            DataType.String,
            DataType.Memo,
            DataType.FixedChar
        });

        /// <summary>
        /// The list which represents all string data types (numeric and boolean)
        /// </summary>
        static public readonly DataTypeList TimeDataTypes = new DataTypeList(new DataType[] {
            DataType.Date,
            DataType.Time,
            DataType.DateTime
        });

        /// <summary>
        /// The list which represents the most common data types
        /// </summary>
        static public readonly DataTypeList BoolDataTypes = new DataTypeList(new DataType[] {
            DataType.Bool
        });

    }

}
