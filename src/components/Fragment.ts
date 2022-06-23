import { FRAGMENT } from "_@vue_compiler-core@3.2.37@@vue/compiler-core"

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

    constructor(width: number=512, _fg: Fragment | undefined = undefined) {
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

}

// 所有字符片
export class Fragments {
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
        const json: any[] = []
        for (let fg of this.flist) {
            json.push(JSON.parse(fg.tojson()))
        }
        return JSON.stringify(json)
    }
}