import { Card } from "../maker/card";
import { Coord } from "../util/coord";
import { Power } from "../maker/card";

// 懒加载图片
export class LazyImage {
    url: string

    loading: boolean = false
    isLoad: boolean = false
    img: HTMLImageElement = new Image()

    constructor(url: string) {
        this.url = url;
    }

    get() {
        if (this.isLoad) {          // 已加载
            return this.img
        } else if (this.loading) {  // 正在加载
            return null
        } else {                    // 加载
            this.loading = true
            this.img.src = this.url
            this.img.onload = () => {
                this.loading = false
                this.isLoad = true
            }
            return null
        }
    }
}

// 外框
class OutFrame {
    frameName: string[] = []
    frame: LazyImage[] = []

    constructor() {
        for (let key in Power) {
            for (let isLord of [false, true]) {
                const name = `old1_${Power[key]}${isLord ? '_zhu' : ''}`
                const url = `/png/${name}.png`
                this.frameName.push(name)
                this.frame.push(new LazyImage(url))
            }
        }
        console.log(this.frameName)
    }

    // 获取外框, 其中power为资源文件中的势力名
    get(power: string, isLord: boolean) {
        const name = `old1_${power}${isLord ? '_zhu' : ''}`
        for (let i = 0; i < this.frameName.length; i++) {
            if (this.frameName[i] == name) {
                return this.frame[i].get()
            }
        }
        throw Error(`[draw.ts/OutFrame] 没有找到外框${name}`)
    }
}
export const outFrame = new OutFrame()


// 保存画布相关参数
export type Canvas = {
    canvas: HTMLCanvasElement      //画布
    ctx: CanvasRenderingContext2D  // 画布上下文
    logicSize: Coord               // 画布逻辑大小
    displaySize: Coord             // 画布显示大小
}

// 设置画布大小
export function setCanvasSize(cvs: Canvas) {
    const dpr = window.devicePixelRatio * 1;
    cvs.canvas.width = cvs.logicSize.x * dpr;
    cvs.canvas.height = cvs.logicSize.y * dpr;
    cvs.canvas.style.width = cvs.displaySize.x + 'px';
    cvs.canvas.style.height = cvs.displaySize.y + 'px';
    cvs.ctx.scale(dpr, dpr);
}

// 清空画布
export function clearCanvas(cvs: Canvas) {
    cvs.ctx.clearRect(0, 0, cvs.logicSize.x, cvs.logicSize.y)
}

// 绘制插画
export function drawIllatration(canvas: Canvas, card: Card) {
    if (card.illastration.isLoad) {
        const dx = canvas.logicSize.x / 2 + card.x - card.w / 2
        const dy = canvas.logicSize.y / 2 + card.y - card.h / 2
        canvas.ctx.drawImage(card.illastration.img, dx, dy, card.w, card.h)
    }
}

// 绘制外框
export function drawOutFrame(cvs: Canvas, card: Card, outFrame: OutFrame) {
    const img = outFrame.get(card.power, card.isLord)
    if (img) {
        cvs.ctx.drawImage(img, 0, 0, cvs.logicSize.x, cvs.logicSize.y)
    }
}