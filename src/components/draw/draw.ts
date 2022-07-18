import { Miscellaneous } from "./miscellaneous";
import { LazyImage } from './lazyimage'

import { sets } from '../fonts/sets'
import * as df from '../fonts/dynamicFont'
import { translate } from "../fonts/trainslate";

import { Card } from "../maker/card";
import { Power } from "../maker/card";

import { refChars } from '../puzzle/chars'
import { Fragments } from "../puzzle/fragment";
import { Vector } from "../entity/Vector";

import { Config } from '../config/config'
import { applyText } from './textstyle'
import { CanvasTool } from "../entity/CanvasTool";

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

// 清空画布
export function clearCanvas(cvt: CanvasTool) {
    cvt.ctx.clearRect(0, 0, cvt.logicSize.x, cvt.logicSize.y)
}

// 绘制插画
export function drawIllatration(canvas: CanvasTool, card: Card) {
    if (card.illastration.isLoad) {
        const dx = canvas.logicSize.x / 2 + card.x - card.w / 2
        const dy = canvas.logicSize.y / 2 + card.y - card.h / 2
        canvas.ctx.drawImage(card.illastration.img, dx, dy, card.w, card.h)
    }
}

// 绘制外框
export function drawOutFrame(cvt: CanvasTool, card: Card, outFrame: OutFrame) {
    const img = outFrame.get(card.power, card.isLord)
    if (img) {
        cvt.ctx.drawImage(img, 0, 0, cvt.logicSize.x, cvt.logicSize.y)
    }
}

// 绘制体力与体力上限
export function drawHeartLimit(cf: Config, cvt: CanvasTool, card: Card, miscellanous: Miscellaneous) {
    // 基本参数
    const heart = card.heart
    const heartLimit = card.isHreatLimit ? card.heartLimit : card.heart
    let xoff = cf.heart.xoff
    if (heartLimit >= cf.heart.nmax) {
        xoff = xoff * (cf.heart.nmax - 1) / (heartLimit - 1)
    }

    // 图片素材
    const s1 = miscellanous.getHeart(card.power, false, card.isLord)
    const s2 = miscellanous.getHeart(card.power, true, card.isLord)
    const img = miscellanous.getImg()

    // 绘制
    if (img) {
        for (let i = 0; i < Math.max(heart, heartLimit); i++) {
            const s = i < heart ? s1: s2
            const d = [cf.heart.dx + xoff * i, cf.heart.dy, cf.heart.w, cf.heart.h]
            cvt.ctx.drawImage(img, s[0], s[1], s[2], s[3], d[0], d[1], d[2], d[3])
        }
    }
}

// 绘制称号单字
function drawTitleChar(cvt: CanvasTool, card: Card, miscellaneous: Miscellaneous, x: number, y: number, fontSize: number, char: string) {
    cvt.ctx.fillStyle = 'black'
    cvt.ctx.textAlign = 'center'
    cvt.ctx.textBaseline = 'middle'
    const fontName = 'DFNewChuan'
    df.fontsTexts.newchuanTexts = df.contrastAddFont(df.fontsTexts.newchuanTexts, char, fontName, `/fonts/${fontName}/${fontName}`)

    cvt.ctx.strokeStyle = "rgb(0, 0, 0)";
    cvt.ctx.lineWidth = 2.5;
    cvt.ctx.fillStyle = miscellaneous.getTitleColor(card.power, card.isLord)
    cvt.ctx.font = fontSize + "px DFNewChuan-" + char
    cvt.ctx.strokeText(char, x, y)
    cvt.ctx.fillText(char, x, y)
}

// 绘制武将称号
function drawTitle(cf: Config, cvt: CanvasTool, card: Card, miscellaneous: Miscellaneous, y1: number, y2: number) {
    // 确定绘制参数
    const x1 = card.power === 'shen' ? cf.titleName.shenx1 : cf.titleName.x1
    let yoff = (y2 - y1) / card.title.length
    let ytop = yoff / 2
    const fontSize = Math.min(Math.ceil(yoff), cf.titleName.maxTitle)
    if (fontSize < yoff) {
        yoff = fontSize
        ytop = (y2 - y1 - yoff * (card.title.length - 1)) / 2
    }

    // 逐字绘制
    const text = card.isTranslate ? translate(card.title) : card.title
    for (let i = 0; i < text.length; i++) {
        const yi = y1 + ytop + yoff * i
        const char = text[i]
        drawTitleChar(cvt, card, miscellaneous, x1, yi, fontSize, char)
    }
}

// 绘制武将名单字
function drawNameChar(cvt: CanvasTool, x: number, y: number, fontSize: number, char: string) {
    cvt.ctx.fillStyle = 'white'
    cvt.ctx.textAlign = 'center'
    cvt.ctx.textBaseline = 'middle'

    const line1Width = 0.08;
    const line2Width = 0.07;

    const charjson = refChars.value.hasjson(char)
    if (charjson) {  // 从拼字器绘制
        const fgs = new Fragments().fromjson(charjson)
        const new_cvt = fgs.draw(line1Width, line2Width)
        const off = fontSize / 2
        cvt.ctx.drawImage(new_cvt.canvas, x - off, y - off, fontSize, fontSize)
    } else {  // 直接绘制
        if (sets.jinmei.has(char)) {
            df.fontsTexts.jinmeiTexts = df.contrastAddFont(df.fontsTexts.jinmeiTexts, char)
        }
        cvt.ctx.font = fontSize + "px JinMeiMaoCaoXing-" + char
        // 描边1
        cvt.ctx.strokeStyle = 'white'
        cvt.ctx.lineWidth = line1Width * fontSize
        cvt.ctx.strokeText(char, x, y);
        // 描边2
        cvt.ctx.strokeStyle = 'black'
        cvt.ctx.lineWidth = line2Width * fontSize
        cvt.ctx.strokeText(char, x, y);
        // 填充
        cvt.ctx.fillText(char, x, y)
    }
}

// 绘制武将名
function drawName(cf: Config, cvt: CanvasTool, card: Card, y2: number, y3: number) {
    // 确定绘制参数
    const x1 = card.power === 'shen' ? cf.titleName.shenx1 : cf.titleName.x1
    let yoff = (y3 - y2) / card.name.length
    let ytop = yoff / 2
    const maxFontSize = card.name.length <= 2 ? cf.titleName.maxName2 : cf.titleName.maxName3
    const fontSize = Math.min(Math.ceil(yoff), maxFontSize)
    if (fontSize < yoff) {
        yoff = fontSize
        // ytop = (y3 - y2 - yoff * (card.name.length - 1)) / 2
    }

    // 逐字绘制
    const text = card.isTranslate ? translate(card.name) : card.title
    for (let i = 0; i < text.length; i++) {
        const y = y2 + ytop + yoff * i
        const char = text[i]
        drawNameChar(cvt, x1, y, fontSize, char)
    }
}

// 绘制武将称号与武将名
export function drawTitleName(cf: Config, cvt: CanvasTool, card: Card, miscellaneous: Miscellaneous, bottomy: number) {
    const y1 = cf.titleName.y1
    const y3 = bottomy + cf.titleName.y3off
    const y2 = y1 + (y3 - y1) * cf.titleName.ratio
    
    // 绘制武将称号
    drawTitle(cf, cvt, card, miscellaneous, y1, y2)

    // 绘制武将名
    drawName(cf, cvt, card, y2, y3)
}

// 绘制底部信息
export function drawBottom(cf: Config, cvt: CanvasTool, card: Card) {
    // 基本参数
    const isShen = (card.power === 'shen')
    const x1 = isShen ? cf.bottom.shenx1 : cf.bottom.x1
    const x2 = isShen ? cf.bottom.shenx2 : cf.bottom.x2
    const y1 = cf.bottom.y1
    const style = isShen ? cf.bottom.shenTextStyle : cf.bottom.textStyle
    applyText(cvt.ctx, style)
    cvt.ctx.font = cf.bottom.font

    // 文本
    let msg = '';
    msg += card.isProducer ? `™&@ ${card.producer}. ` : ''
    msg += card.isIllustrator ? `illustration: ${card.illastrator}`: ''

    // 绘制
    cvt.ctx.fillText(msg, x1, y1)
    if(card.isCardNum){
        msg = String(card.cardNum)
        cvt.ctx.textAlign = 'right'
        cvt.ctx.fillText(msg, x2, y1);
    }
}

// 绘制版本信息
export function drawVersion(cf: Config, cvt: CanvasTool, version: string) {
    const text = 'Lycium在线制卡器' + version
    cvt.ctx.font = cf.version.font
    applyText(cvt.ctx, cf.version.textStyle)
    cvt.ctx.fillText(text, cf.version.x, cf.version.y)
}