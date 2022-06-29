import { ref, Ref } from "vue"
import * as dw from '../draw/draw'
import * as df from '../fonts/dynamicFont'
import { Coord } from '../util/coord'

// 大写汉字
class UpperNumber {
    i: number = -1
    slist: string = '零一二三四五六七八九十'
    get() {
        this.i = (this.i + 1) % this.slist.length
        return String(this.slist[this.i])
    }
}
const upperNumber = new UpperNumber()

// 字符片
export class Fragment {
    selected: boolean[]
    text: string[]
    size: number[]
    mask: number[]
    width: number

    constructor(width: number=512, _fg: Fragment | undefined = undefined) {
        this.width = width
        this.selected = [false, false]
        if (typeof(_fg) === 'undefined') {
            this.text = [upperNumber.get()]
            this.size = [0, 0, width, width]
            this.mask = [0, 0, width, width]
        } else {
            const fg = _fg as Fragment
            this.text = [fg.text[0]]
            this.size = [fg.size[0], fg.size[1], fg.size[2], fg.size[3]]
            this.mask = [fg.mask[0], fg.mask[1], fg.mask[2], fg.mask[3]]
        }
        
    }

    unselect() {
        this.selected[0] = false
        this.selected[1] = false
    }

    selectOption(option: number) {
        this.selected[option] = true
    }

    selectState() {
        if (this.selected[0]) {
            return 1
        } else if (this.selected[1]) {
            return 2
        } else {
            return 0
        }
    }

    tojson() {
        return JSON.stringify({'text': this.text, 'size': this.size, 'mask': this.mask, 'select': this.selectState()})
    }

    setSize(size: number[]) {
        for (let i = 0; i < size.length; i++) {
            this.size[i] = size[i]
        }
    }

    setMask(mask: number[]) {
        for (let i = 0; i < mask.length; i++) {
            this.mask[i] = mask[i]
        }
    }

    isSelect() {
        return this.selected[0] === true || this.selected[1] === true
    }

    draw(mainctx: CanvasRenderingContext2D, margin: number = 0) {
        // 基本信息
        const width = this.width
        let text: string = this.text[0]
        text = typeof (text) == 'undefined' ? '' : text[0]
        const size: number[] = this.size
        const mask: number[] = this.mask

        // 临时Canvas
        const logicSize = new Coord(width, width)
        const cvs = dw.tempCanvas(logicSize, logicSize)
    
        // 绘制相关参数
        const dx = (Number(width) - Number(size[2])) / 2 + size[0] 
        const dy = (Number(width) - Number(size[3])) / 2 + size[1]
        const sx = (mask[0] - dx) / size[2] * width
        const sy = (mask[1] - dy) / size[3] * width
        const sw = (mask[2] - mask[0]) / size[2] * width
        const sh = (mask[3] - mask[1]) / size[3] * width
        cvs.ctx.textAlign = "center"
        cvs.ctx.textBaseline = "middle"

        // 获取字体
        df.fontsTexts.jinmeiTexts = df.contrastAddFont(df.fontsTexts.jinmeiTexts, text)
        cvs.ctx.font = width + "px JinMeiMaoCaoXing-" + text
    
        // 绘制蒙版
        cvs.ctx.rect(sx, sy, sw, sh);
        cvs.ctx.clip();
    
        // 绘制文字
        cvs.ctx.fillStyle = 'black'
        cvs.ctx.fillText(text, width / 2, width / 2)
    
        // 将临时Canvas绘制到主Canvas上
        mainctx.drawImage(cvs.canvas, dx + Number(margin), dy + Number(margin), size[2], size[3])
    }

}

// 支持的字体
export const puzzleFonts = {
    jinmeimaocaoxing: '金梅毛草行'
}

// 所有字符片
export class Fragments {
    sch = ''
    zch = ''
    describe = ''
    font = puzzleFonts.jinmeimaocaoxing

    flist: Fragment[] = []
    // valid: boolean[] = []
    width: number

    constructor(width: number=512) {
        this.width = width
    }

    add() {
        this.flist.push(new Fragment(this.width))
        // this.valid.push(true)
        return this.flist[this.flist.length - 1]
    }

    copy(i: number) {
        const fg = new Fragment(this.width, this.flist[i])
        this.flist.splice(i + 1, 0, fg)
        // this.valid.splice(i + 1, 0, true)
        return fg
    }

    remove(i: number) {
        this.flist.splice(i, 1)
        // this.valid[i] = false
    }

    length() {
        return this.flist.length
    }

    unselectall() {
        for(let i = 0; i < this.flist.length; i++) {
            this.flist[i].unselect()
        }
    }

    select(editor: number, option: number) {
        const isSelect = this.flist[editor].selected[option]
        this.unselectall()
        if (!isSelect) {
            this.flist[editor].selectOption(option)
        }
    }

    tojson() {
        const bodyJson: any[] = []
        for (let fg of this.flist) {
            bodyJson.push(JSON.parse(fg.tojson()))
        }
        const headJson = {
            'sch': this.sch,
            'zch': this.zch,
            'describe': this.describe,
            'font': this.font
        }

        return JSON.stringify({'head': headJson, 'body': bodyJson})
    }

    fromjson(json: string) {
        const parsed = JSON.parse(json)
        this.sch = parsed.head.sch
        this.zch = parsed.head.zch
        this.describe = parsed.head.describe
        this.font = parsed.head.font
        this.flist = []
        for(let fgjson of parsed.body) {
            const fg = new Fragment(this.width)
            fg.text = fgjson.text
            fg.size = fgjson.size
            fg.mask = fgjson.mask
            this.flist.push(fg)
        }

        return this
    }

    draw() {
        const size = new Coord(this.width, this.width)
        const maincvs = dw.tempCanvas(size, size)
        for (let i = 0; i < this.flist.length; i++) {
            const fg = this.flist[i]
            fg.draw(maincvs.ctx, 0)
        }
        return maincvs
    }
}

export let refFragments: Ref<Fragments> = ref(new Fragments())