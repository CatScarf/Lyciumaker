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
        return new Coord(this.x + c.x, this.y + c.y)
    }

    mul (a: number) {
        return new Coord(this.x * a, this.y * a)
    }

    left (a: number) {
        return new Coord(this.x - a, this.y)
    }

    up (a: number) {
        return new Coord(this.x, this.y - a)
    }

    right (a: number) {
        return new Coord(this.x + a, this.y)
    }

    down (a: number) {
        return new Coord(this.x, this.y + a)
    }
}

export class Rect {
    c1: Coord  // c1-----c2
    c2: Coord  // |      |
    c3: Coord  // |      |
    c4: Coord  // c3-----c4

    constructor (x: number, y: number, w: number, h: number) {
        this.c1 = new Coord(x, y)
        this.c2 = new Coord(x + w, y)
        this.c3 = new Coord(x + w, y + h)
        this.c4 = new Coord(x, y + h)
    }

    scaleWidth(a: number) {
        const x = this.c1.x - a
        const w = this.c2.x - this.c1.x + a * 2
        return new Rect(x, this.c1.y, w, this.c3.y - this.c2.y)
    }

    scaleHeight(a: number) {
        const y = this.c1.y - a
        const h = this.c3.y - this.c2.y + a * 2
        return new Rect(this.c1.x, y, this.c2.x - this.c1.x, h)
    }

    scale(a: number) {
        const x = this.c1.x - a
        const y = this.c1.y - a
        const w = this.c2.x - this.c1.x + a * 2
        const h = this.c3.y - this.c2.y + a * 2
        return new Rect(x, y, w, h)
    }
}