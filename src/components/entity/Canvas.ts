import { Coord } from "./Coord"

// 保存画布相关参数
export class Canvas {
    canvas: HTMLCanvasElement      // 画布
    ctx: CanvasRenderingContext2D  // 画布上下文
    logicSize: Coord               // 画布逻辑大小
    displaySize: Coord             // 画布显示大小
}