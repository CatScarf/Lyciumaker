import { Coord } from './Coord' 

// 正方形
export class Rect {
    x: number
    y: number
    w: number
    h: number

    // 构造正方形
    constructor (x: number, y: number, w: number, h: number) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    // 获得四角坐标
    getQuadCoord () {
        return {
            c1: new Coord(this.x, this.y),
            c2: new Coord(this.x + this.w, this.y),
            c3: new Coord(this.x + this.w, this.y + this.h),
            c4: new Coord(this.x, this.y + this.h)
        }
    }

    // 获得缺角矩形外框线坐标
    getCornerOutline (corner: number) {
        const qc = this.getQuadCoord()
        const line = [
            qc.c1.down(corner), qc.c1.down(corner).right(corner), qc.c1.right(corner),
            qc.c2.left(corner), qc.c2.down(corner).left(corner), qc.c2.down(corner),
            qc.c3.up(corner), qc.c3.up(corner).left(corner), qc.c3.left(corner),
            qc.c4.right(corner), qc.c4.up(corner).right(corner), qc.c4.up(corner),
            qc.c1.down(corner)
        ]
        return line
    }

    // 横向扩展
    scaleWidth(a: number) {
        const x = this.x - a
        const w = this.w + a * 2
        return new Rect(x, this.y, w, this.h)
    }

    // 纵向扩展
    scaleHeight(a: number) {
        const y = this.y - a
        const h = this.h + a * 2
        return new Rect(this.x, y, this.w, h)
    }

    // 整体扩展（
    scale(a: number) {
        const x = this.x - a
        const y = this.y - a
        const w = this.w + a * 2
        const h = this.h + a * 2
        return new Rect(x, y, w, h)
    }

}