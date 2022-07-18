import { Rect } from "./Rect"

// 二维坐标
export class Vector {
    x: number
    y: number

    // 构造二维坐标
    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    // 复制坐标
    like (c: Vector) {
        this.x = c.x
        this.y = c.y
        return this
    }

    // 向量相加
    add (c: Vector) {
        return new Vector(this.x + c.x, this.y + c.y)
    }

    // 标量乘法
    mul (a: number) {
        return new Vector(this.x * a, this.y * a)
    }

    // 向左移动
    left (a: number) {
        return new Vector(this.x - a, this.y)
    }

    // 向上移动
    up (a: number) {
        return new Vector(this.x, this.y - a)
    }

    // 向右移动
    right (a: number) {
        return new Vector(this.x + a, this.y)
    }

    // 向上移动
    down (a: number) {
        return new Vector(this.x, this.y + a)
    }

    // 获取以此坐标为中心的矩形
    getRect (w: number, h: number) {
        return new Rect(this.x - w / 2, this.y - h / 2, w, h)
    }
}

