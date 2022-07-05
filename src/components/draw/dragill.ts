import { Canvas } from "../entity/Canvas"
import { Mouse } from "../entity/Mouse"
import { Rect } from "../entity/Rect"
import { Card } from "../maker/card"


// 拖拽插画
export class IllDrager {
    cvs: Canvas
    card: Card
    mouse: Mouse

    startX: number = 0
    startY: number = 0
    startRect: Rect = new Rect(0, 0, 0, 0)
    isDragging: boolean = false

    constructor(cvs: Canvas, card: Card, mouse: Mouse) {
        this.cvs = cvs
        this.card = card
        this.mouse = mouse

        // 触摸时获取坐标
        cvs.canvas.addEventListener('touchmove', (e) => { 
            this.mouse.touch2rel(e)
        }, { passive: false })

        // 触摸时开始滚动
        cvs.canvas.addEventListener('touchstart', (e) => {
            this.mouse.touch2rel(e)
            if (this.mouse.isInSafe(cvs, 0.1)) {
                e.preventDefault()
                this.mouse.isTouch = true
            }
        }, { passive: false })

        // 停止触摸时结束滚动
        cvs.canvas.addEventListener('touchend', (e) => {
            this.mouse.isTouch = false
        }, { passive: false })
    }

    // 绘制摇杆
    drawRocker() {
        const radius = 20
        const alpha = '99'
        this.cvs.ctx.beginPath()
        this.cvs.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2)
        this.cvs.ctx.fillStyle = '#000000' + alpha
        this.cvs.ctx.fill()

        this.cvs.ctx.beginPath()
        this.cvs.ctx.arc(this.mouse.relx, this.mouse.rely, radius * 0.8, 0, Math.PI * 2)
        this.cvs.ctx.fillStyle = '#000000' + alpha
        this.cvs.ctx.fill()

        this.cvs.ctx.beginPath()
        this.cvs.ctx.moveTo(this.startX, this.startY)
        this.cvs.ctx.lineTo(this.mouse.relx, this.mouse.rely)
        this.cvs.ctx.lineWidth = 3
        this.cvs.ctx.setLineDash([5, 5])
        this.cvs.ctx.stroke()
        this.cvs.ctx.setLineDash([])
    }

    // 开始拖拽
    start() {
        this.startX = this.mouse.relx
        this.startY = this.mouse.rely
        this.isDragging = true
        this.startRect = new Rect(this.card.x, this.card.y, this.card.w, this.card.h)
    }

    // 结束拖拽
    end() {
        this.isDragging = false
    }

    // 拖动插画
    drag() {
        this.mouse.client2rel(this.cvs, 0)

        if(!this.isDragging && (this.mouse.isDown || this.mouse.isTouch)) {
            this.start()
        } else if (this.isDragging && (!this.mouse.isDown && !this.mouse.isTouch)) {
            this.end()
        }
        
        if (this.isDragging) {
            this.drawRocker()
            const newRect = this.startRect.move(this.mouse.relx - this.startX, this.mouse.rely - this.startY)
            this.card.x = newRect.x
            this.card.y = newRect.y
            this.card.w = newRect.w
            this.card.h = newRect.h
        }
    }
}