import { Vector } from './Vector' 

type MoveFrom = 'r1' | 'r2' | 'r3' | 'r4' | 'r5' | 'r6' | 'r7' | 'r8' | 'r9' | 'all'

// 正方形
export class Rect {
    x: number
    y: number
    w: number
    h: number

    // 构造正方形
    constructor(x: number, y: number, w: number, h: number) {
            this.x = x
            this.y = y
            this.w = w
            this.h = h
    }

    // 从中心坐标构建
    static fromCenterCoord(x: number, y: number, w: number, h: number) {
        return new Rect(x - w / 2, y - h / 2, w, h)
    }

    // 从对角坐标构建
    static fromQuadCoord(x1: number, y1: number, x2: number, y2: number) {
        const x = Math.min(x1, x2)
        const y = Math.min(y1, y2)
        const w = Math.abs(x1 - x2)
        const h = Math.abs(y1 - y2)
        return new Rect(x, y, w, h)
    }

    // 转换为字符串
    toString() {
        return `${this.x},${this.y},${this.w},${this.h}`
    }

    // 转换为中心坐标
    toCenterCoord() {
        return {
            x: this.x + this.w / 2,
            y: this.y + this.h / 2,
            w: this.w,
            h: this.h
        }
    }

    // 获得四角坐标
    getQuadCoord () {
        return {
            c1: new Vector(this.x, this.y),
            c2: new Vector(this.x + this.w, this.y),
            c3: new Vector(this.x + this.w, this.y + this.h),
            c4: new Vector(this.x, this.y + this.h)
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

    // 克隆
    clone() {
        return new Rect(this.x, this.y, this.w, this.h)
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

    // 移动
    move(x: number, y: number, moving: MoveFrom = 'all', keepRatio = true) {
        const e = 0.0000000001
        const ratio = Math.abs(this.w) / Math.abs(this.h + e)
        const x2 = x
        const y2 = keepRatio ? x / ratio : this.y
        switch (moving) {
            case 'r1':
                return new Rect(this.x + x2, this.y + y2, this.w - x2, this.h - y2)
            case 'r2':
                return new Rect(this.x, this.y + y, this.w, this.h - y)
            case 'r3':
                return new Rect(this.x, this.y - y2, this.w + x2, this.h + y2)
            case 'r4':
                return new Rect(this.x, this.y, this.w + x, this.h)
            case 'r5':
                return new Rect(this.x, this.y, this.w + x2, this.h + y2)
            case 'r6':
                return new Rect(this.x, this.y, this.w, this.h + y)
            case 'r7':
                return new Rect(this.x + x2, this.y, this.w - x2, this.h - y2)
            case 'r8':
                return new Rect(this.x + x, this.y, this.w - x, this.h)
            case 'all':
                return new Rect(this.x + x, this.y + y, this.w, this.h)
        }
        return new Rect(this.x + x, this.y + y, this.w, this.h)
    }
}