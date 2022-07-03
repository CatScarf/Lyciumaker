// 二维坐标
export class Coord {
    x: number
    y: number

    // 构造二维坐标
    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    // 复制坐标
    like (c: Coord) {
        this.x = c.x
        this.y = c.y
        return this
    }

    // 向量相加
    add (c: Coord) {
        return new Coord(this.x + c.x, this.y + c.y)
    }

    // 标量乘法
    mul (a: number) {
        return new Coord(this.x * a, this.y * a)
    }

    // 向左移动
    left (a: number) {
        return new Coord(this.x - a, this.y)
    }

    // 向上移动
    up (a: number) {
        return new Coord(this.x, this.y - a)
    }

    // 向右移动
    right (a: number) {
        return new Coord(this.x + a, this.y)
    }

    // 向上移动
    down (a: number) {
        return new Coord(this.x, this.y + a)
    }
}

