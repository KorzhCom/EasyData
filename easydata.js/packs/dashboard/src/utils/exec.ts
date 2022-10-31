export const isFunc = f => {
    if (typeof f === 'function') return f
    if (typeof f === 'string') {
        let ns = f.split(".");
        let i, context = window;

        for(i = 0; i < ns.length; i++) {
            context = context[ns[i]];
        }

        if (typeof context === 'function') return context
    }
    return false
}

export const exec = (f, args, context) => {
    let result;
    if (f === undefined || f === null) {return false;}

    let func = isFunc(f);

    if (func === false) {
        func = new Function("a", f);
    }

    try {
        result = func.apply(context, args);
        return result;
    } catch (err) {
        throw err;
    }
}