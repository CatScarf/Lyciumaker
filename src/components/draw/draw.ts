import { Card } from "../maker/card";
import { Coord } from "../util/coord";
import { Power } from "../maker/card";
import { withCtx } from "vue";

import * as df from '../fonts/dynamicFont'
import { translate } from "../fonts/trainslate";
import { sets } from '../fonts/sets'
import { refChars } from '../puzzle/chars'
import { Fragments } from "../puzzle/fragment";

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

    skillBox = {
        'wei':  [100, 50,  200, 100],
        'shu':  [100, 150, 200, 100],
        'wu':   [100, 250, 200, 100],
        'qun':  [100, 350, 200, 100],
        'shen': [100, 450, 200, 100],
        'jin':  [100, 550, 200, 100],
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

    getSkillbox(power: string): number[] {
        return this.skillBox[power]
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

// 临时Canvas 
export function tempCanvas(logicSize: Coord, displaySize: Coord, superdpr: number = 1) {
    const canvasElement = document.createElement('canvas') as HTMLCanvasElement;
    const ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D;
    const cvs: Canvas = {
        canvas: canvasElement,
        ctx: ctx,
        logicSize: logicSize,
        displaySize: displaySize
    }
    setCanvasSize(cvs, superdpr)
    return cvs
}

// 设置画布大小
export function setCanvasSize(cvs: Canvas, superdpr: number = 1) {
    const dpr = window.devicePixelRatio * superdpr;
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
        x1: 104,                // 技能区最顶部的X坐标
        miny1: 435,             // 技能区最顶部的Y坐标不得低于此值
        y2: 510,                // 技能区最底部的Y坐标
        w: 228,                 // 技能区宽度
        indent: 0.5,            // 首字缩进为0.5个汉字宽度
        paragraphSpacing: 0.3,  // 段间距，实际段间距为此值 * yoff

        y1: 435,       // 技能区最顶部的Y坐标, 可更改
        fontSize: 12,  // 技能字号, 可更改

        maxHeight: 0,  // 技能区最大高度
        yoff: 0        // 行间距，当字体缩小时变为与字体大小相同
    }
    params.maxHeight = (params.y2 - params.y1) * 3
    params.yoff = params.fontSize * 1.2

    cvs.ctx.textAlign = 'left'
    cvs.ctx.textBaseline = 'bottom'

    // 获取技能高度
    function skillHeight(text: string, isDraw: boolean = false, y: number = 0) {
        let line = ''
        let height = 0
        let numline = 0

        cvs.ctx.fillStyle = 'black'
        cvs.ctx.font = params.fontSize + "px FangZhengZhunYuan"

        // 绘制一行
        function drawLine(lastLine: boolean) {
            const dx = params.x1 + xoff
            const dy = y + numline * params.yoff
            // 确保宽度对齐
            if (lastLine) {
                cvs.ctx.fillText(line, dx, dy)
            } else { 
                const size = new Coord(cvs.ctx.measureText(line).width, params.fontSize * 2)  // 加高，确保文字完整显示
                const tempCvs = tempCanvas(size, size, 1.5)  // 超分辨绘制，确保字体锐利
                tempCvs.ctx.font = params.fontSize + "px FangZhengZhunYuan"
                tempCvs.ctx.fillText(line, 0, params.fontSize)
                cvs.ctx.drawImage(tempCvs.canvas, dx, dy - params.fontSize, params.w - xoff, params.fontSize * 2)  // 加高，确保文字完整显示
            }
        }

        var xoff = 0  // 首行缩进
        for (let i = 0; i < text.length; i++) {
            xoff = (numline === 0) ? params.indent * params.fontSize : 0
            line = line + text[i]
            const textWidth = cvs.ctx.measureText(line).width
            if (textWidth >= params.w - xoff) {
                if(isDraw) {
                    drawLine(false)
                }
                numline ++
                line = ''
                height = height + params.yoff
            }
        }
        if(line != '') {
            height = height + params.yoff
            if (isDraw) {
                drawLine(true)
            }
        }
        return height
    }

    // 获取技能组高度
    function skillsHeight(card: Card, isDraw: boolean = false) {
        let heights = 0
        const skillsy: number[] = []  // 每个技能的起始y坐标
        for (let skill of card.skills) {
            let height = 0
            const spacing = heights > 0 ? params.paragraphSpacing * params.yoff : 0
            skillsy.push(params.y1 + heights + spacing + params.fontSize / 2)
            height = skillHeight(skill.text, isDraw, heights + params.y1 + spacing + params.yoff)
            heights = heights + spacing + height
        }
        return {
            height: heights,
            skillsy: skillsy
        }
    }

    // 确定字号和坐标
    let sh = skillsHeight(card)
    while(params.fontSize >= 2 && sh.height > params.maxHeight) {
        params.fontSize = params.fontSize - 1  // 缩小字体
        params.yoff = params.fontSize          // 缩小行间距
        sh = skillsHeight(card)
    }
    params.y1 = Math.min(params.y2 - sh.height, params.y1)  // 确定技能组顶端坐标
    
    // 绘制技能文本
    sh = skillsHeight(card, true)

    // 绘制技能名外框
    function drawSkillNameFrames() {
        const sb = miscellanous.getSkillbox(card.power)
        const img = miscellanous.getImg()
        const sxywh = {sx: sb[0], sy: sb[1], sw: sb[2], sh: sb[3]}
        const dw = 68  // 技能名外框宽度
        const xo = -69 // 技能名外框x偏移
        const yo = -13 // 技能名外框y偏移
        if (img) {
            for (let dy of sh.skillsy) {
                cvs.ctx.drawImage(img, sxywh.sx, sxywh.sy, sxywh.sw, sxywh.sh, params.x1 + xo, dy + yo, dw, dw / 2)
            }
        }
    }
    drawSkillNameFrames()


    // 绘制技能名
    function drawSkillNames() {
        const xo = -57       // 技能名x偏移
        const yo = 13.5      // 技能名y偏移
        const fontSize = 20  // 技能名字体大小
        const color = card.power === 'shen' ? "rgb(239, 227, 111)" : "rgb(0, 0, 0)"  // 技能名颜色

        for(let i = 0; i < card.skills.length; i++) {
            const dy = sh.skillsy[i]
            let text = card.skills[i].name
            const fontName = 'FangZhengLiShuJianTi'
            // console.log(i, text, df.fontsTexts.fangzhengTexts)
            df.fontsTexts.fangzhengTexts = df.contrastAddFont(df.fontsTexts.fangzhengTexts, text, fontName, `/fonts/${fontName}/${fontName}`)
            for (let j = 0; j < Math.min(text.length, 2); j++) {
                cvs.ctx.font = fontSize + "px FangZhengLiShuJianTi-" + text[j]
                cvs.ctx.fillStyle = color
                cvs.ctx.fillText(text[j], params.x1 + xo + j * fontSize, dy + yo)
            }
        }
    }
    drawSkillNames()

    return {
        topy: params.y1
    }
}

// 绘制武将名单字
function drawNameChar(cvs: Canvas, x: number, y: number, fontSize: number, char: string) {
    cvs.ctx.fillStyle = 'black'
    cvs.ctx.textAlign = 'center'
    cvs.ctx.textBaseline = 'middle'

    const charjson = refChars.value.hasjson(char)
    if (charjson) {
        const fgs = new Fragments().fromjson(charjson)
        const new_cvs = fgs.draw()
        const off = fontSize / 2
        cvs.ctx.drawImage(new_cvs.canvas, x - off, y - off, fontSize, fontSize)
    } else if (sets.jinmei.has(char)) {
        df.fontsTexts.jinmeiTexts = df.contrastAddFont(df.fontsTexts.jinmeiTexts, char)
        cvs.ctx.font = fontSize + "px JinMeiMaoCaoXing-" + char
        cvs.ctx.fillText(char, x, y)
    } else {
        cvs.ctx.font = fontSize + "px 'PingFang SC', SimHei, Monaco, Consolas, monospace"
        cvs.ctx.fillText(char, x, y)
    }


}

// 绘制武将称号与武将名
export function frawTitleName(cvs: Canvas, card: Card, bottomy: number) {
    const params = {
        ratio: card.name.length > 3 ? 0.35 : 0.5,  // 称号与武将名的比例
        x1: card.power === 'shen' ? 335 : 59,
        y1: 110,
        y2: 0,
        y3: bottomy,
        fontsizeMax: 57
    }
    params.y2 = params.y1 + (bottomy - 110) * params.ratio

    cvs.ctx.fillStyle = 'red'
    cvs.ctx.fillRect(params.x1, params.y1, 100, params.y2 - params.y1)
    // cvs.ctx.fillStyle = 'blue'
    // cvs.ctx.fillRect(params.x1, params.y2, 100, params.y3 - params.y2)

    // 绘制名字
    function drawName() {
        let yoff = (params.y3 - params.y2) / card.name.length
        const fontSize = Math.min(Math.ceil(yoff), params.fontsizeMax)
        if (fontSize < yoff) {
            yoff = fontSize
        }
        let text = card.name
        if (card.isTranslate) {
            text = translate(text)
        }
        for(let i = 0; i < text.length; i++) {
            
            const y = params.y2 + yoff / 2 + yoff * i
            const char = text[i]
            drawNameChar(cvs, params.x1, y, fontSize, char)
        }
    }
    drawName()
}