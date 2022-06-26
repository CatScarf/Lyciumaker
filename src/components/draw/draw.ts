import { Coord } from "../util/coord";

// 保存画布相关参数
export type Canvas = {
    canvas: HTMLCanvasElement  //画布
    ctx: CanvasRenderingContext2D  // 画布上下文
    logicSize: Coord  // 画布逻辑大小
    displaySize: Coord  // 画布显示大小
}

// 设置画布大小
export function setCanvasSize(cvs: Canvas) {
    const dpr = window.devicePixelRatio * 1;
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