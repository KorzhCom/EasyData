type ObserverOptions = {
    childList: boolean,
    attributes: boolean,
    subtree: boolean
}

const roleAttribute = `data-role`

export const ComponentsObserver = (
    root: HTMLElement | string,
    options: ObserverOptions = {
        childList: true,
        attributes: true,
        subtree: true
    }) => {
    let rootNode: HTMLElement

    const observerCallback = function(mutations){
        mutations.map(function(mutation){
            const elem = mutation.target

            if (mutation.type === 'attributes') {
                const attr = mutation.attributeName
                const newValue = elem.getAttribute(attr), oldValue = mutation.oldValue

                // Update attributes
            } else if (mutation.type === 'childList'){
                if (mutation.addedNodes.length) {
                    const nodes = mutation.addedNodes

                    if (nodes.length) {
                        for(let node of nodes) {
                            if (node.hasAttribute(roleAttribute)) {
                                // Create component
                            }
                        }
                    }
                }
            }
        })
    }

    if (typeof root === 'string') {
        rootNode = document.querySelector(root)
    } else if (root instanceof HTMLElement) {
        rootNode = root
    } else {
        rootNode = document.querySelector("html")
    }

    const observer = new MutationObserver(observerCallback);
    observer.observe(rootNode, options);
}