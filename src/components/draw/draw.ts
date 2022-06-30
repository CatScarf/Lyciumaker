import { misellaneous, Misellaneous } from "./misellaneous";
import { LazyImage } from './lazyimage'

import { sets } from '../fonts/sets'
import * as df from '../fonts/dynamicFont'
import { translate } from "../fonts/trainslate";

import { Skill, Card } from "../maker/card";
import { Power } from "../maker/card";

import { refChars } from '../puzzle/chars'
import { Fragments } from "../puzzle/fragment";
import { Coord, Rect } from "../util/coord";

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
        y2: 507,                // 技能区最底部的Y坐标
        w: 235,                 // 技能区宽度
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
    function skillHeight(skill: Skill, isDraw: boolean = false, y: number = 0) {
        let line = ''
        let height = 0
        let numline = 0
        const text = skill.text

        cvs.ctx.fillStyle = 'black'
        cvs.ctx.font = params.fontSize + "px FangZhengZhuYuan"

        // 绘制一行
        function drawLine(isItalic: boolean, lastLine: boolean, drawRatio = 0) {
            const dx = params.x1 + xoff
            const dy = y + numline * params.yoff
            let font = params.fontSize + "px FangZhengZhuYuan"
            if (isItalic) {
                font = 'italic ' + font
            }
            // 确保宽度对齐
            const w1 = cvs.ctx.measureText(line).width       // 实际宽度
            const size = new Coord(w1, params.fontSize * 2)  // 加高，确保文字完整显示
            const tempCvs = tempCanvas(size, size, 1.5)                                   // 超分辨绘制，确保字体锐利
            tempCvs.ctx.font = font
            tempCvs.ctx.fillText(line, 0, params.fontSize)
            // 绘制粗体
            if (line.length >= 3 && line[2] === '技') {
                let boldText = line.slice(0, 4)
                if (line.length >= 7 && line[6] === '技') {
                    boldText = boldText + line.slice(4, 7)
                }
                const clearWidth = tempCvs.ctx.measureText(boldText).width
                tempCvs.ctx.clearRect(0, 0, clearWidth, size.y)

                tempCvs.ctx.font = 'bold ' + font
                tempCvs.ctx.fillText(boldText, 0, params.fontSize)
            }
            // 确定宽度
            let w2 = params.w - xoff  // 绘制宽度
            if (lastLine) {
                w2 = w1
                if (drawRatio) {
                    w2 = w1 * drawRatio
                }
            }

            drawRatio = w2 / w1

            cvs.ctx.drawImage(tempCvs.canvas, dx, dy - params.yoff, w2, params.fontSize * 2)  // 加高，确保文字完整显示

            return drawRatio
        }

        var xoff = 0      // 首行缩进
        let drawRatio = 0 // 绘制单行时缩放的比例
        for (let i = 0; i < text.length; i++) {
            xoff = (numline === 0) ? params.indent * params.fontSize : 0
            line = line + text[i]
            const textWidth = cvs.ctx.measureText(line).width
            if (textWidth >= params.w - xoff) {
                // 确保标点符号不在第一位
                if (i+1 < text.length && [',', '，', '.', '。', ';', '；', ':', '：'].indexOf(text[i+1]) >= 0) {
                    i = i + 1
                    line = line + text[i]
                }
                if (isDraw) {
                    drawRatio = drawLine(skill.isItalic, false, drawRatio)
                }
                numline++
                line = ''
                height = height + params.yoff
            }
        }
        if (line != '') {
            height = height + params.yoff
            if (isDraw) {
                drawRatio = drawLine(skill.isItalic, true, drawRatio)
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
            height = skillHeight(skill, isDraw, heights + params.y1 + spacing + params.yoff)
            heights = heights + spacing + height
        }
        return {
            height: heights,
            skillsy: skillsy
        }
    }

    // 确定字号和坐标
    let sh = skillsHeight(card)
    while (params.fontSize >= 2 && sh.height > params.maxHeight) {
        params.fontSize = params.fontSize - 1  // 缩小字体
        params.yoff = params.fontSize          // 缩小行间距
        sh = skillsHeight(card)
    }
    params.y1 = Math.min(params.y2 - sh.height, params.y1)  // 确定技能组顶端坐标

    // 绘制技能背景
    function drawSkillBackground() {
        const alpha = 'cc' // 透明度
        const color = miscellanous.getColor(card.power) + alpha  // 颜色
        const corner = 10      // 外框线角落距离
        const margin = 3       // 内外框线间距
        const lineWidth = 2    // 线宽
        const widthScale = 20  // 宽度扩展
        const heightScale = 7  // 高度扩展

        // 四角坐标
        const h = params.y2 - params.y1
        const rect = new Rect(params.x1, params.y1, params.w, h).scaleWidth(widthScale).scaleHeight(heightScale)

        // 绘制样式
        cvs.ctx.fillStyle = color
        cvs.ctx.lineWidth = lineWidth
        cvs.ctx.strokeStyle = color

        // 绘制缺角矩形
        function drawCornerRect(rect: Rect, corner: number, isFill = false) {
            const line = [
                rect.c1.down(corner), rect.c1.down(corner).right(corner), rect.c1.right(corner),
                rect.c2.left(corner), rect.c2.down(corner).left(corner), rect.c2.down(corner),
                rect.c3.up(corner), rect.c3.up(corner).left(corner), rect.c3.left(corner),
                rect.c4.right(corner), rect.c4.right(corner).up(corner), rect.c4.up(corner),
                rect.c1.down(corner)
            ]
            cvs.ctx.beginPath()
            cvs.ctx.lineTo(line[0].x, line[0].y)
            for (let c of line.slice(1, line.length)) {
                cvs.ctx.lineTo(c.x, c.y)
            }
            isFill ? cvs.ctx.fill() : cvs.ctx.stroke()
            cvs.ctx.closePath()
        }

        // 绘制
        drawCornerRect(rect, corner, false)
        drawCornerRect(rect.scale(-margin), corner, true)
    }
    drawSkillBackground()

    // 绘制技能文本
    sh = skillsHeight(card, true)

    // 绘制技能名外框
    function drawSkillNameFrames() {
        const sb = miscellanous.getSkillbox(card.power)
        const img = miscellanous.getImg()
        const sxywh = { sx: sb[0], sy: sb[1], sw: sb[2], sh: sb[3] }
        const dw = 68  // 技能名外框宽度
        const xo = -69 // 技能名外框x偏移
        const yo = -16 // 技能名外框y偏移
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
        const yo = 1.5       // 技能名y偏移
        const fontSize = 20  // 技能名字体大小
        const color = card.power === 'shen' ? "rgb(239, 227, 111)" : "rgb(0, 0, 0)"  // 技能名颜色

        for (let i = 0; i < card.skills.length; i++) {
            const dy = sh.skillsy[i]
            let text = card.skills[i].name
            const fontName = 'FangZhengLiShuJianTi'
            df.fontsTexts.fangzhengTexts = df.contrastAddFont(df.fontsTexts.fangzhengTexts, text, fontName, `/fonts/${fontName}/${fontName}`)
            for (let j = 0; j < Math.min(text.length, 2); j++) {
                cvs.ctx.font = fontSize + "px FangZhengLiShuJianTi-" + text[j]
                cvs.ctx.textAlign = 'left'
                cvs.ctx.textBaseline = 'middle'
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
    cvs.ctx.fillStyle = 'white'
    cvs.ctx.textAlign = 'center'
    cvs.ctx.textBaseline = 'middle'

    const line1Width = 0.08;
    const line2Width = 0.07;

    const charjson = refChars.value.hasjson(char)
    if (charjson) {  // 从拼字器绘制
        const fgs = new Fragments().fromjson(charjson)
        const new_cvs = fgs.draw(line1Width, line2Width)
        const off = fontSize / 2
        cvs.ctx.drawImage(new_cvs.canvas, x - off, y - off, fontSize, fontSize)
    } else {  // 直接绘制
        if (sets.jinmei.has(char)) {
            df.fontsTexts.jinmeiTexts = df.contrastAddFont(df.fontsTexts.jinmeiTexts, char)
        }
        cvs.ctx.font = fontSize + "px JinMeiMaoCaoXing-" + char
        // 描边1
        cvs.ctx.strokeStyle = 'white'
        cvs.ctx.lineWidth = line1Width * fontSize
        cvs.ctx.strokeText(char, x, y);
        // 描边2
        cvs.ctx.strokeStyle = 'black'
        cvs.ctx.lineWidth = line2Width * fontSize
        cvs.ctx.strokeText(char, x, y);
        // 填充
        cvs.ctx.fillText(char, x, y)
    }
}

// 绘制称号单字
function drawTitleChar(cvs: Canvas, card: Card, x: number, y: number, fontSize: number, char: string) {
    cvs.ctx.fillStyle = 'black'
    cvs.ctx.textAlign = 'center'
    cvs.ctx.textBaseline = 'middle'
    const fontName = 'DFNewChuan'
    df.fontsTexts.newchuanTexts = df.contrastAddFont(df.fontsTexts.newchuanTexts, char, fontName, `/fonts/${fontName}/${fontName}`)

    cvs.ctx.strokeStyle = "rgb(0, 0, 0)";
    cvs.ctx.lineWidth = 2.5;
    cvs.ctx.fillStyle = misellaneous.getTitleColor(card.power, card.isLord)
    cvs.ctx.font = fontSize + "px DFNewChuan-" + char
    cvs.ctx.strokeText(char, x, y)
    cvs.ctx.fillText(char, x, y)
}

// 绘制武将称号与武将名
export function frawTitleName(cvs: Canvas, card: Card, bottomy: number) {
    const params = {
        ratio: card.name.length > 3 ? 0.35 : 0.5,  // 称号与武将名的比例
        x1: card.power === 'shen' ? 335 : 59,
        y1: 110,
        y2: 0,
        y3: bottomy,
        titleFontsizeMax: 24,
        nameFontsizeMax: 57
    }
    params.y2 = params.y1 + (bottomy - 110) * params.ratio

    // 绘制武将称号
    function drawTitle() {
        let yoff = (params.y2 - params.y1) / card.title.length
        let ytop = yoff / 2
        const fontSize = Math.min(Math.ceil(yoff), params.titleFontsizeMax)
        if (fontSize < yoff) {
            yoff = fontSize
            ytop = (params.y2 - params.y1 - yoff * (card.title.length - 1)) / 2
        }

        let text = card.title
        if (card.isTranslate) {
            text = translate(text)
        }

        for (let i = 0; i < text.length; i++) {
            const y = params.y1 + ytop + yoff * i
            const char = text[i]
            drawTitleChar(cvs, card, params.x1, y, fontSize, char)
        }
    }
    drawTitle()

    // 绘制武将名
    function drawName() {
        let yoff = (params.y3 - params.y2) / card.name.length
        const fontSize = Math.min(Math.ceil(yoff), params.nameFontsizeMax)
        if (fontSize < yoff) {
            yoff = fontSize
        }

        let text = card.name
        if (card.isTranslate) {
            text = translate(text)
        }

        for (let i = 0; i < text.length; i++) {
            const y = params.y2 + yoff / 2 + yoff * i
            const char = text[i]
            drawNameChar(cvs, params.x1, y, fontSize, char)
        }
    }
    drawName()
}

// 绘制底部信息
export function drawBottom(cvs: Canvas, card: Card) {
    const param = {
        font: "9px FangZhengZhuYuan",
        style: card.power == 'shen' ? '#ffffff' : '#000000',
        x1: card.power == 'shen' ? 150 : 85,
        x2: card.power == 'shen' ? 370 : 350,
        y1: 533
    }

    let msg = "";
    if(card.isProducer){
        msg += "™&@ " + card.producer
        msg += ".  "
    }
    if(card.isIllustrator){
        msg += "illustration: " + card.illastrator
    }
    cvs.ctx.textBaseline = 'middle'
    cvs.ctx.textAlign = 'left'
    cvs.ctx.font = param.font
    cvs.ctx.fillStyle = param.style
    cvs.ctx.fillText(msg, param.x1, param.y1)

    if(card.isCardNum){
        msg = "" + card.cardNum
        cvs.ctx.textAlign = 'right'
        cvs.ctx.fillText(msg, param.x2, param.y1);
    }
}

// 绘制版本信息
export function drawVersion(cvs: Canvas, version: string) {
    const param = {
        text: 'Lycium在线制卡器' + version,
        x: 18,
        y: 549
    }
    cvs.ctx.font = '9px FangZhengZhuYuan'
    cvs.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    cvs.ctx.textBaseline = 'middle'
    cvs.ctx.textAlign = 'left'

    cvs.ctx.fillText(param.text, param.x, param.y)
}