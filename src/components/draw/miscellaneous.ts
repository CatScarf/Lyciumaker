import { LazyImage } from './lazyimage'

// 杂项
export class Miscellaneous {
    img: LazyImage
    hearts: {[key: string]: number[]} = {}

    color = {
        'wei': "#ccd5ec",
        'shu': "#e9cfb2",
        'wu': "#d6e3bf",
        'qun': "#d2cbc8",
        'shen': "#c2bd64",
        'jin': "#e3b5f1"
    }

    titleLordColor = {
        'wei': 'rgb(41,88,155)',
        'shu': 'rgb(175,98,36)',
        'wu': 'rgb(62,109,31)',
        'qun': 'rgb(118,118,118)',
        'shen': "rgb(255, 255, 0)",
        'jin': 'rgb(104,19,129)'  // 待修改
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

    getSkillbox(power: string) {
        const s = this.skillBox[power]
        return {x: s[0], y: s[1], w: s[2], h: s[3]}
    }

    getImg() {
        return this.img.get()
    }

    getColor(power: string) {
        return this.color[power]
    }

    getTitleColor(power: string, isLord: boolean) {
        if (isLord) {
            return this.titleLordColor[power]
        } else {
            return "rgb(255, 255, 0)"
        }
    }
}
export const miscellaneous = new Miscellaneous('/png/miscellaneous.png')