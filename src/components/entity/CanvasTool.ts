import { Vector } from "./Vector"

// 保存画布相关参数
export class CanvasTool {
    canvas: HTMLCanvasElement      // 画布
    ctx: CanvasRenderingContext2D  // 画布上下文
    logicSize: Vector              // 画布逻辑大小
    displaySize: Vector            // 画布显示大小

    // 构造函数
    constructor(canvas: HTMLCanvasElement, logicSize: Vector, displaySize: Vector, superdpr: number = 1) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        this.logicSize = logicSize
        this.displaySize = displaySize
        this.setCanvasSize(superdpr)
    }

    // 设置Canvas大小
    setCanvasSize(superdpr: number = 1) {
        const canvas = this.canvas
        const dpr = Math.max(2, window.devicePixelRatio) * superdpr
        canvas.width = this.logicSize.x * dpr
        canvas.height = this.logicSize.y * dpr
        canvas.style.width = this.displaySize.x + 'px'
        canvas.style.height = this.displaySize.y + 'px'
        this.ctx.scale(dpr, dpr)
    }

    // 清空Canvas
    clear() {
        this.ctx.clearRect(0, 0, this.logicSize.x, this.logicSize.y)
    }

    // 判断Canvas是否可见
    isVisible() {
        return this.canvas.offsetParent !== null
    }
}

// 生成临时Canvas 
export function tempCanvas(logicSize: Vector, displaySize: Vector, superdpr: number = 1) {
    const canvasElement = document.createElement('canvas') as HTMLCanvasElement
    return new CanvasTool(canvasElement, logicSize, displaySize, superdpr)
}