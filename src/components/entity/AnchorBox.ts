import { Mouse } from "../controller/Mouse";
import { CanvasTool } from "./CanvasTool";
import { Rect } from "./Rect";
import { Vector } from "./Vector";

type Moving = 'r1' | 'r2' | 'r3' | 'r4' | 'r5' | 'r6' | 'r7' | 'r8' | 'r9' | 'all' | 'none'

// 锚框
export class AnchorBox {
    private cvt: CanvasTool
    private mouse: Mouse
    private offset: number
    private anchorWidth: number

    private size: Rect
    private mask: Rect

    private moving: Moving = 'none'
    private startSize: Rect
    private startMask: Rect
    private startC: Vector


    constructor(cvt: CanvasTool, mouse: Mouse, offset = 0, anchorWidth = 15) {
        this.cvt = cvt
        this.mouse = mouse
        this.offset = offset
        this.anchorWidth = anchorWidth
        this.size = new Rect(0, 0, 0, 0)
        this.mask = new Rect(0, 0, 0, 0)
    }

    // 修改锚框位置
    resize(size: Rect, mask: Rect) {
        this.size = size
        this.mask = mask
    }

    // 移动锚框
    move(select: 'mask' | 'size') {
        let newSize: Rect = this.size.clone()
        let newMask: Rect = this.mask.clone()

        // 开始或停止移动
        if(this.moving === 'none' && this.mouse.isDown()) {
            this.startSize = this.size.clone()
            this.startMask = this.mask.clone()
            this.moving = this.isInPoints(select == 'size' ? this.startSize : this.startMask)
            this.startC = this.mouse.getPos()
        } else if (this.moving != 'none' && !this.mouse.isDown()) {
            this.moving = 'none'
        }

        // 移动
        if (this.moving != 'none') {
            const pos = this.mouse.getPos()
            if (select == 'size') {
                newSize = this.startSize.move(pos.x - this.startC.x, pos.y - this.startC.y, this.moving)
                // 字符移动时蒙版同时移动
                if (this.moving == 'all') {
                    newMask = this.startMask.move(pos.x - this.startC.x, pos.y - this.startC.y, this.moving)
                }
            } else {
                newMask = this.startMask.move(pos.x - this.startC.x, pos.y - this.startC.y, this.moving)
            }
        }

        return {
            size: newSize,
            mask: newMask
        }
    }
    
    // 绘制锚框
    draw(select: 'none' | 'size' | 'mask', color='darkgreen') {
        const ctx = this.cvt.ctx
        ctx.strokeStyle = color
        ctx.fillStyle = color
        ctx.setLineDash([])
        ctx.strokeRect(this.size.x + this.offset, this.size.y + this.offset, this.size.w, this.size.h)
        ctx.strokeRect(this.mask.x + this.offset, this.mask.y + this.offset, this.mask.w, this.mask.h)
        const anchorPoints = select == 'size' ? this.getAnchorPoints(this.size) : this.getAnchorPoints(this.mask)
        for (let key in anchorPoints) {
            const box = select == 'size' ? this.size : this.mask
            const r = anchorPoints[key] as Rect
            if (this.isInPoints(box) == key) {
                ctx.fillRect(r.x, r.y, r.w, r.h)
            } else {
                ctx.strokeRect(r.x, r.y, r.w, r.h)
            }
            
        }
    }

    // 获取以八个锚点中心的矩形
    private getAnchorPoints(rect: Rect) {
        const x1 = rect.x + this.offset
        const x2 = x1 + rect.w / 2
        const x3 = x1 + rect.w
        const y3 = rect.y + this.offset
        const y4 = y3 + rect.h / 2
        const y5 = y3 + rect.h

        const anchorWidth = this.anchorWidth
        function r(x: number, y: number) {
            return new Vector(x, y).getRect(anchorWidth, anchorWidth)
        }

        return {
            r1: r(x1, y3), r2: r(x2, y3), r3: r(x3, y3), r4: r(x3, y4),
            r5: r(x3, y5), r6: r(x2, y5), r7: r(x1, y5), r8: r(x1, y4)
        }
    }

    // 判断鼠标是否在矩形内
    private isInPoints(box: Rect) {
        const anchorPoints = this.getAnchorPoints(box)
        for (let key in anchorPoints) {
            if (this.mouse.isInRect(anchorPoints[key])) {
                return key as Moving
            }
        }
        return this.mouse.isInRect(box) ? 'all' : 'none'
    }

}