import { Coord } from './Coord' 

// 正方形
export class Rect {
    c1: Coord  // c1-----c2
    c2: Coord  // |      |
    c3: Coord  // |      |
    c4: Coord  // c3-----c4

    // 构造正方形
    constructor (x: number, y: number, w: number, h: number) {
        this.c1 = new Coord(x, y)
        this.c2 = new Coord(x + w, y)
        this.c3 = new Coord(x + w, y + h)
        this.c4 = new Coord(x, y + h)
    }

    // 横向扩展
    scaleWidth(a: number) {
        const x = this.c1.x - a
        const w = this.c2.x - this.c1.x + a * 2
        return new Rect(x, this.c1.y, w, this.c3.y - this.c2.y)
    }

    // 纵向扩展
    scaleHeight(a: number) {
        const y = this.c1.y - a
        const h = this.c3.y - this.c2.y + a * 2
        return new Rect(this.c1.x, y, this.c2.x - this.c1.x, h)
    }

    // 整体扩展（
    scale(a: number) {
        const x = this.c1.x - a
        const y = this.c1.y - a
        const w = this.c2.x - this.c1.x + a * 2
        const h = this.c3.y - this.c2.y + a * 2
        return new Rect(x, y, w, h)
    }
}