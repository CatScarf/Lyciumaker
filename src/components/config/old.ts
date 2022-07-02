import { Config } from './config'

// 旧模板配置
export const oldConfig: Config = {
    game: 'sanguosha',
    template: 'old',
    heart: {
        w: 40,
        h: 40,
        dx: 100,
        dy: 15,
        xoff: 20,
        nmax: 12
    },
    skText: {
        x1: 104,
        y2: 507,
        maxy1: 430,
        w: 235,
        maxHeight: 3,

        indent: 0.5,
        spacing: 0.3,
        maxFont: 12,

        textStyle: {
            align: 'left',
            baseline: 'middle',
            fillStyle: 'black'
        }
    },
    skBg: {
        alpha: 0.6,
        corner: 10,
        margin: 3,
        lineWidth: 2,
        wScale: 20,
        hScale: 7
    },
    skFrame: {
        w: 68,
        h: 34,
        xoff: -68,
        yoff: -16,
    },
    skName: {
        xoff: -57,
        yoff: 1.5,
        fontSize: 20,
        textStyle: {
            align: 'left',
            baseline: 'middle',
            fillStyle: 'black'
        },
        shenTextStyle: {
            align: 'left',
            baseline: 'middle',
            fillStyle: 'rgb(239, 227, 111)'
        }
    },
    titleName: {
        x1: 59,
        shenx1: 335,
        y1: 110,
        y3off: -10,
        maxTitle: 24,
        maxName: 57
    },
    bottom: {
        font: '9px FangZhengZhuYuan',
        x1: 85,
        shenx1: 150,
        x2: 350,
        shenx2: 370,
        y1: 533,
        textStyle: {
            align: 'left',
            baseline: 'middle',
            fillStyle: '#000000'
        },
        shenTextStyle: {
            align: 'left',
            baseline: 'middle',
            fillStyle: 'ffffff'
        }
    }
}