// 颜色转换
export function transColor (x: number | string) {
    if (typeof(x) == 'number') {
        if (x < 0 || x > 1) {
            throw Error(`x(${x}) must be in [0, 1]`)
        } else {
            return Math.round(x * 255).toString(16)
        }
    } else {
        // TODO
        throw Error('Although the function can accept arguments of type string, this function is not yet complete.')
    }
}