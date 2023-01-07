export const capitalize = str => str.substring(0, 1).toUpperCase() + str.substring(1)
export const stripDash = str => str.replace(/\-/g, "").toLowerCase()