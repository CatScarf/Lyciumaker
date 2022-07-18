import { CanvasTool } from "../entity/CanvasTool"
import { Rect } from "../entity/Rect"
import { Vector } from "../entity/Vector"

// Canvas相关的鼠标（触摸）参数
export class Mouse {
    private cvt: CanvasTool
    private x: number = 0
    private y: number = 0
    private rx: number = 0
    private ry: number = 0
    private _isDown: boolean = false
    private safeRatio: number = 1.0

    private startX: number = 0
    private startY: number = 0

    constructor(cvt: CanvasTool, safeRatio: number = 1.0) {
        this.cvt = cvt
        this.safeRatio = safeRatio
        const addel = cvt.canvas.addEventListener

        // Canvas监听鼠标事件
        addel('mousemove', (e) => {
            this.x = e.clientX
            this.y = e.clientY
            this.client2rel()
        })

        addel('mousedown', (e) => {
            const pos = this.getPos()
            if (this.cvt.isVisible() && this.mouseInCanvas()) {
                this._isDown = true
                this.startX = pos.x
                this.startY = pos.y
            }
        })

        addel('mouseup', (e) => {
            this._isDown = false
        })

        // Canvas监听触摸事件
        addel('touchmove', (e) => {
            this.x = e.touches[0].clientX
            this.y = e.touches[0].clientY
        })

        addel('touchstart', (e) => {
            this.x = e.touches[0].clientX
            this.y = e.touches[0].clientY
            if (this.cvt.isVisible() && this.mouseInCanvas() && this.mouseInSafeArea()) {
                e.preventDefault()
                const pos = this.getPos()
                console.log(`touchstart: ${pos.x}, ${pos.y}`)
                this._isDown = true
                this.startX = pos.x
                this.startY = pos.y
            }
        }, {passive: false})

        addel('touchend', (e) => {
            this._isDown = false
        })
    }

    // 将鼠标坐标转换为相对于Canvas的坐标
    private client2rel() {
        const rect = this.cvt.canvas.getBoundingClientRect()
        const xscale = this.cvt.logicSize.x / this.cvt.displaySize.x
        const yscale = this.cvt.logicSize.y / this.cvt.displaySize.y

        this.rx = (this.x - rect.left) * xscale
        this.ry = (this.y - rect.top) * yscale
    }

    // 获取鼠标相对于Canvas的坐标
    getPos() {
        this.client2rel()
        return new Vector(this.rx, this.ry)
    }

    // 判断鼠标是否被按下
    isDown() {
        return this._isDown
    }

    // 判断鼠标是否在特定的Rect内
    isInRect(rect: Rect) {
        const pos = this.getPos()
        const x = Math.min(rect.x + rect.w, rect.x)
        const y = Math.min(rect.y + rect.h, rect.y)
        const w = Math.abs(rect.w)
        const h = Math.abs(rect.h)
        return pos.x >= x && pos.x <= x + w && pos.y >= y && pos.y <= y + h
    }

    // 判断鼠标是否在Canvas内
    private mouseInCanvas() {
        const pos = this.getPos()
        return pos.x >= 0 && pos.x <= this.cvt.logicSize.x && pos.y >= 0 && pos.y <= this.cvt.logicSize.y
    }

    // 获取安全区域的四角坐标
    private getSafePos() {
        const x1 = this.cvt.logicSize.x * (1 - this.safeRatio) / 2
        const x2 = this.cvt.logicSize.x - x1
        const y1 = this.cvt.logicSize.y * (1 - this.safeRatio) / 2
        const y2 = this.cvt.logicSize.y - y1
        return {x1: x1, x2: x2, y1: y1, y2: y2}
    }

    // 判断触摸点是否在安全区域内
    private mouseInSafeArea() {
        const pos = this.getPos()
        const sagePos = this.getSafePos()
        return pos.x >= sagePos.x1 && pos.x <= sagePos.x2 && pos.y >= sagePos.y1 && pos.y <= sagePos.y2
    }

    // 可视化拖拽行为
    visible() {
        if (this.isDown()) {
            const ctx = this.cvt.ctx
            const pos = this.getPos()
            const radius = 20
            const alpha = '99'

            ctx.fillStyle = '#000000' + alpha

            ctx.beginPath()
            ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2)
            ctx.fill()

            ctx.beginPath()
            ctx.arc(pos.x, pos.y, radius * 0.8, 0, Math.PI * 2)
            ctx.fill()

            ctx.beginPath()
            ctx.moveTo(this.startX, this.startY)
            ctx.lineTo(pos.x, pos.y)
            ctx.lineWidth = 3
            ctx.setLineDash([5, 5])
            ctx.stroke()
            ctx.setLineDash([])

            // ctx.beginPath()
            // const safePos = this.getSafePos()
            // ctx.strokeStyle = '#ff0000'
            // ctx.rect(safePos.x1, safePos.y1, safePos.x2 - safePos.x1, safePos.y2 - safePos.y1)
            // ctx.stroke()
        }
    }
}