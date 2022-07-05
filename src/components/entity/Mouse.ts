import { Canvas } from "./Canvas"

export class Mouse {
    clientX: number = 0
    clientY: number = 0
    relx: number = 0
    rely: number = 0
    isDown: boolean = false
    isTouch: boolean = false

    constructor() {

    }

    // 从触摸事件获取鼠标位置
    touch2rel(e: TouchEvent) {
        this.clientX = e.changedTouches[0].clientX
        this.clientY = e.changedTouches[0].clientY
    }

    // 屏幕坐标转Canvas坐标
    // 此处的margin并非CSS中的margin，而是手动定义的margin，一般情况下取0即可
    client2rel(cvs: Canvas, margin: number = 0) {
        const rect = cvs.canvas.getBoundingClientRect();
        const scale = cvs.logicSize.x / (cvs.displaySize.x + margin * 2);
        this.relx = (this.clientX - rect.left - margin) * scale
        this.rely = (this.clientY - rect.top - margin) * scale
    }

    // 鼠标是否在安全区域内
    isInSafe(cvs: Canvas, edge: number = 0.5) {
        const w = cvs.logicSize.x
        const h = cvs.logicSize.y
        return this.relx >= w * edge && this.relx <= w * (1 - edge) && this.rely >= h * edge && this.rely <= h * (1 - edge)
    }
}