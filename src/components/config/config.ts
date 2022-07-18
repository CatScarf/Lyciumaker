import { TextStyle } from '../draw/textstyle'

// 体力与体力上限配置
interface Heart {
    w: number
    h: number
    dx: number
    dy: number
    xoff: number
    nmax: number
}

// 技能文本配置
interface SkText {
    x1: number          // 顶部横坐标
    y2: number,         // 底部纵坐标
    maxy1: number,      // 顶部纵坐标最大值
    w: number,          // 宽度
    maxHeight: number,  // 最大高度, miny1 = (y2 - maxy1) * minHeight

    indent: number,     // 首行缩进宽度
    epsilon: number,    // 拉伸偏移，此值越大文字越宽
    spacing: number,    // 段间距, 实际段间距为spacing * yoff
    rowSpacing: number, // 行间距, 实际行间距为rowSpacing * yoff
    maxFont: number,    // 最大字体

    textStyle: TextStyle,  // 技能文字样式
}

// 技能底框配置
interface SkBg {
    alpha: number,      // 透明度
    corner: number,     // 外框线角落距离
    margin: number,     // 内外框线间距
    lineWidth: number,  // 线宽
    wScale: number,     // 宽度扩展
    hScale: number      // 高度扩展
}

// 技能名外框
interface SkFrame {
    w: number,
    h: number,
    xoff: number,
    yoff: number
}


// 技能名
interface SkName {
    xoff: number,
    yoff: number,
    fontSize: number,
    textStyle: TextStyle,
    shenTextStyle: TextStyle
}

// 武将称号与武将名
interface TitleName {
    x1: number,
    shenx1: number,
    y1: number,
    y3off: number,     // 武将名底部与技能框顶部的间距
    ratio: number,     // 武将称号长度占比
    maxTitle: number,  // 称号字体最大值
    maxName2: number   // 武将名字体最大值(2字以内)
    maxName3: number   // 武将名字体最大值(3字以上)
}

// 底部信息
interface Bottom {
    font: string,
    x1: number,
    shenx1: number,
    x2: number,
    shenx2: number,
    y1: number,
    textStyle: TextStyle,
    shenTextStyle: TextStyle
}

// 版本信息
interface Version {
    font: string,
    x: number,
    y: number,
    textStyle: TextStyle
}

// 配置
export interface Config {
    game: string
    template: string
    heart: Heart
    skText: SkText                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    skBg: SkBg
    skFrame: SkFrame
    skName: SkName
    titleName: TitleName
    bottom: Bottom
    version: Version
}