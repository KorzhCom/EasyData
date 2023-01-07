export const getContainer = (container: HTMLElement | string): HTMLElement => {
    let _container: HTMLElement

    if (!container) {
        throw 'Container is undefined';
    }

    if (typeof container === 'string') {
        if (container.length){
            if (container[0] === '.') {
                const result = document.getElementsByClassName(container.substring(1));
                if (result.length)
                    _container = result[0] as HTMLElement;
            }
            else {
                if (container[0] === '#') {
                    container = container.substring(1);
                }
                _container = document.getElementById(container);
            }
            if (!_container) {
                throw Error('Unrecognized `container` parameter: ' + container + '\n'
                    + 'It must be an element ID, a class name (starting with .) or an HTMLElement object itself.');
            }
        }
    }
    else {
        _container = container;
    }

    return _container
}

export const setContainer = (elem: HTMLElement, container: HTMLElement | string): HTMLElement => {
    return getContainer(container).appendChild(elem)
}