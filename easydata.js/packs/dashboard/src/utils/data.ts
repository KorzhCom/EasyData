export const data = (elem: HTMLElement) => {
    const result = []
    if (elem.hasAttributes()) {
        // @ts-ignore
        for (const attr of elem.attributes) {
            if (attr.name.startsWith('data-')) {
                result.push({
                    name, 
                    value: attr.value
                })
            }
        }
    }
    return result
}