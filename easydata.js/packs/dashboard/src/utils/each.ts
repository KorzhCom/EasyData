import {isArrayLike} from "./is-array-like"

export const each = (ctx, cb) => {
    let index = 0
    if (isArrayLike(ctx)) {
        [].forEach.call(ctx, function(val, key) {
            cb.apply(val, [key, val, index++]);
        })
    } else {
        for(let key in ctx) {
            if (ctx.hasOwnProperty(key))
                cb.apply(ctx[key], [key, ctx[key], index++]);
        }
    }

    return ctx
}