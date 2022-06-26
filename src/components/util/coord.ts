// 二维坐标
export class Coord {
    x: number
    y: number

    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    like (c: Coord) {
        this.x = c.x
        this.y = c.y
        return this
    }

    add (c: Coord) {
        this.x += c.x
        this.y += c.y
        return this
    }

    mul(a: number) {
        this.x *= a
        this.y *= a
        return this
    }
}