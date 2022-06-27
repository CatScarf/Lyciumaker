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
    }

    // 获取外框, 其中power为资源文件中的势力名
    get(power: string, isLord: boolean) {
        if (power == 'shen') {
            isLord = false
        }
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


// 杂项
class Misellaneous {
    img: LazyImage
    hearts: {[key: string]: number[]} = {}

    color = {
        wei: "#ccd5ec",
        shu: "#e9cfb2",
        wu: "#d6e3bf",
        qun: "#d2cbc8",
        shen: "#c2bd64",
        jin: "#e3b5f1"
    }

    constructor(url: string) {
        this.img = new LazyImage(url)
        const powers = 'wei,shu,wu,qun,shen,jin'.split(',')
        const sxs = [350, 450]
        const sys = [50, 150, 250, 355, 450, 550]
        for (let i = 0; i < powers.length; i++) {
            const name1 = `${powers[i]}HeartS`
            const value1 = [sxs[0], sys[i], 100, 100]
            const name2 = `${powers[i]}HeartLimitS`
            const value2 = [sxs[1], sys[i], 100, 100]
            this.hearts[name1] = value1
            this.hearts[name2] = value2
        }
    }

    getHeart(power: string, isLimit: boolean, isLord: boolean) {
        if (isLord) {
            power = 'shen'
        }
        const name = `${power}Heart${isLimit ? 'Limit' : ''}S`
        return this.hearts[name]
    }

    getImg() {
        return this.img.get()
    }

    getColor(power: string) {
        return this.color[power]
    }
}
export const misellaneous = new Misellaneous('/png/miscellaneous.png')

// 保存画布相关参数
export type Canvas = {
    canvas: HTMLCanvasElement      // 画布
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

// 绘制体力上限
export function drawHeartLimit(cvs: Canvas, card: Card, miscellanous: Misellaneous) {
    const params = {
        length: 40,
        dx: 100,
        dy: 15,
        heart: card.heart,
        heartLimit: card.isHreatLimit ? card.heartLimit : card.heart,
        offset: 20,
        maxn: 12
    }
    if (params.heartLimit >= params.maxn) {
        params.offset = params.offset * (params.maxn - 1) / (params.heartLimit - 1)
    }
    
    const s1 = miscellanous.getHeart(card.power, false, card.isLord)
    const s2 = miscellanous.getHeart(card.power, true, card.isLord)
    const img = miscellanous.getImg()

    if (img) {
        for (let i = 0; i < params.heart; i++) {
            cvs.ctx.drawImage(img, s1[0], s1[1], s1[2], s1[3], params.dx + params.offset * i, params.dy, params.length, params.length)
        }
        for (let i = params.heart; i < params.heartLimit; i++) {
            cvs.ctx.drawImage(img, s2[0], s2[1], s2[2], s2[3], params.dx + params.offset * i, params.dy, params.length, params.length)
        }
    }
}

// 绘制技能
export function drawSkill(cvs: Canvas, card: Card, miscellanous: Misellaneous) {
    const params = {
        x1: 104,     // 技能区最顶部的X坐标
        y1: 435,     // 技能区最顶部的Y坐标
        miny1: 435,  // 技能区最顶部的Y坐标不得低于此值
        y2: 510,     // 技能区最底部的Y坐标
        w: 228,      // 技能区宽度

        indent: 0.5,            // 首字缩进为0.5个汉字宽度
        paragraphSpacing: 0.3,  // 段间距，实际段间距为此值 * yoff
        fontSize: 12,           // 技能字号

        maxHeight: 0,  // 技能区最大高度
        yoff: 0        // 行间距，当字体缩小时变为与字体大小相同
    }
    params.maxHeight = (params.y2 - params.y1) * 3
    params.yoff = params.fontSize * 1.2

    // 技能高度
    function skillHeight(text: string, isDraw: boolean = false, y: number = 0) {
        let line = ''
        let height = 0
        let numline = 0

        cvs.ctx.fillStyle = 'black'
        cvs.ctx.font = params.fontSize + "px FangZhengZhunYuan"

        let xoff = 0
        for (let i = 0; i < text.length; i++) {
            xoff = (i == 0) ? params.indent * params.fontSize : 0
            line = line + text[i]
            if (cvs.ctx.measureText(line).width >= params.w - xoff) {
                if(isDraw) {
                    cvs.ctx.fillText(line, params.x1 + xoff, y + numline * params.yoff)
                }
                numline ++
                line = ''
                height = height + params.yoff
            }
        }
        if(line != '') {
            height = height + params.yoff
            if (isDraw) {
                cvs.ctx.fillText(line, params.x1 + xoff, y + numline * params.yoff)
            }
        }
        return height
    }

    // 技能组高度
    function skillsHeight(card: Card, isDraw: boolean = false) {
        let heights = 0
        for (let skill of card.skills) {
            let height = 0
            const spacing = heights > 0 ? params.paragraphSpacing * params.yoff : 0
            if (isDraw) {
                height = skillHeight(skill.text, true, heights + params.y1 + spacing + params.yoff)
            } else {
                height = skillHeight(skill.text)
            }
            heights = heights + spacing + height
        }
        return heights
    }

    // 确定字号
    let height = skillsHeight(card)
    while(params.fontSize >= 2 && height > params.maxHeight) {
        params.fontSize = params.fontSize - 1
        params.yoff = params.fontSize
        height = skillsHeight(card)
    }
    params.y1 = Math.min(params.y2 - height, params.y1)
    
    cvs.ctx.fillStyle = miscellanous.getColor(card.power)
    cvs.ctx.fillRect(params.x1, params.y1, params.w, params.y2 - params.y1)
    skillsHeight(card, true)

    // console.log(params.fontSize)



}