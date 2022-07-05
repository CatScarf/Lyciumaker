import { sum } from "./util"

// 数组保留小数
function listToFixed(list: number[], fractionDigits: number = 2){
    return list.map(x => x.toFixed(fractionDigits))
}

export class StopWatch {
    private startTime: number = 0
    private avgLapTime: number[] = []
    private avgTime: number = 0
    private lapTime: number[] = []
    private ratio: number = 0.99  // 移动平均的比例

    str: string = ''

    // 开始新一轮计时
    restart() {
        this.startTime = Date.now()
        if (this.avgLapTime.length > this.lapTime.length) {
            this.avgLapTime = []
        }
        while (this.avgLapTime.length < this.lapTime.length) {
            this.avgLapTime.push(this.lapTime[this.avgLapTime.length])
        }
        for (let i = 0; i < this.lapTime.length; i++) {
            this.avgLapTime[i] = this.avgLapTime[i] * this.ratio + this.lapTime[i] * (1 - this.ratio)
        }
        this.lapTime = []
        this.lap()
    }

    // 进行一次计时
    lap() {
        const time = Date.now() - this.startTime
        this.lapTime.push(time)
    }

    // 转换为字符串
    toString(isAvgOnly: boolean = true) {
        if (this.avgTime === 0) {
            this.avgTime = sum(this.avgLapTime)
        } else {
            this.avgTime = this.avgTime * this.ratio + sum(this.avgLapTime) * (1 - this.ratio)
        }

        const avg = `(${this.avgTime.toFixed(2)}ms)${listToFixed(this.avgLapTime)}`
        const lap = `(${sum(this.lapTime).toFixed(2)}ms)${listToFixed(this.lapTime)}`
        if (isAvgOnly) {
            this.str = avg
        } else {
            this.str = `avg:${avg}\nlap:${lap}`
        }
        return this.str
    }

    // 打印计时结果
    print(isAvgOnly: boolean = true) {
        console.log(this.toString(isAvgOnly))
    }

    // 获得平均时间
    getAvgTime() {
        return this.avgTime
    }

}