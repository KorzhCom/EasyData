/** Represents the common types of the data. */
export enum DataType {
    /** Unknown type value*/
    Unknown = 0,
    /** String value*/
    String = 1,
    /** 8-bit integer value */
    Byte = 2,
    /** 16-bit integer value */
    Word = 3,
    /** 32-bit integer value */
    Int32 = 4,
    /** 64-bit integer value */
    Int64 = 5,
    /** Boolean value */
    Bool = 6,
    /** Floating-point numeric value */
    Float = 7,
    /** Money value */
    Currency = 8,
    /** Binary-coded decimal value */
    BCD = 9,
    /** Date value */
    Date = 10,
    /** Time value */
    Time = 11,
    /** Date and time value */
    DateTime = 12,
    /** Autoincrement 32-bit integer value */
    Autoinc = 13,
    /** MEMO value (text with unlimited length) */
    Memo = 14,
    /** BLOB value (any data with unlimited length) */
    Blob = 15,
    /** Fixed character value */
    FixedChar = 16,
    /** The unique identifier */
    Guid = 17,

    /*-------- Spatial data types ----------*/
    
    /** Any geometry data */
    Geometry = 18,
    /** Any data that represents some geography objects</summary> */
    Geography = 19
}
