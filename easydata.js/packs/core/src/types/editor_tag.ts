
export const EditorTag = {
    /** Unknown tag value */
    Unknown: "Unknown",
    /** Edit tag value */
    Edit: "EDIT",
    /** DateTime tag value  */
    DateTime: "DATETIME",
    /** List tag value */
    List: "LIST",
    /** CustomList tag value */
    CustomList: "CUSTOMLIST",
    /** File tag value */
    File: "FILE"
}

export type EditorTag = (typeof EditorTag)[keyof typeof EditorTag];