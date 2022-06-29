import { Fragment } from "./fragment";
import { Mouse, Box } from "./move";
import * as df from "../fonts/dynamicFont"


// 设置canvas大小
export function setCanvasSize(canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    logicSize: number[],
    displaySize: number[]) {
    const dpr = window.devicePixelRatio * 1;
    canvas.width = logicSize[0] * dpr;
    canvas.height = logicSize[1] * dpr;
    canvas.style.width = displaySize[0] + 'px';
    canvas.style.height = displaySize[1] + 'px';
    ctx.scale(dpr, dpr);
}

// 清空画布
export function clearCanvas(ctx: CanvasRenderingContext2D, logicSize: number[]) {
    ctx.clearRect(0, 0, logicSize[0], logicSize[1])
}

// 绘制虚线
function drawDashedLine(ctx: CanvasRenderingContext2D, c1: number[], c2: number[]) {
    ctx.strokeStyle = "gray"
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 4])
    ctx.beginPath();
    ctx.moveTo(c1[0], c1[1]);
    ctx.lineTo(c2[0], c2[1]);
    ctx.stroke();
    ctx.closePath();
}

// 绘制虚线方框
function drawDashRect(ctx: CanvasRenderingContext2D, c1: number[], c2: number[]) {
    const c3 = [c2[0], c1[1]]
    const c4 = [c1[0], c2[1]]
  
    drawDashedLine(ctx, c1, c3);
    drawDashedLine(ctx, c3, c2);
    drawDashedLine(ctx, c2, c4);
    drawDashedLine(ctx, c4, c1);
}

// 绘制辅助线
export function drawAuxiliaryLines(ctx: CanvasRenderingContext2D, width: number, margin: number) {
    const wm = width + margin
    const w2m = width / 2 + margin
    drawDashedLine(ctx, [w2m, margin], [w2m, wm])
    drawDashedLine(ctx, [margin, w2m], [wm, w2m])
    drawDashRect(ctx, [margin, margin], [wm, wm])
}

// 绘制文字
export function drawText(ctx: CanvasRenderingContext2D, fg: Fragment, width: number, isMouseDown: boolean, margin: number) {
    // 基本信息
    let text: string = fg.text[0][0]
    text = typeof (text) == 'undefined' ? '' : text[0]
    const size: number[] = fg.size
    const mask: number[] = fg.mask

    // 临时Canvas
    const tempCanvas = document.createElement('canvas') as HTMLCanvasElement;
    const tempCtx = tempCanvas.getContext('2d') as CanvasRenderingContext2D;
    setCanvasSize(tempCanvas, tempCtx, [width, width], [width, width]);
  
    // 绘制相关参数
    const dx = (Number(width) - Number(size[2])) / 2 + size[0] 
    const dy = (Number(width) - Number(size[3])) / 2 + size[1]
    const sx = (mask[0] - dx) / size[2] * width
    const sy = (mask[1] - dy) / size[3] * width
    const sw = (mask[2] - mask[0]) / size[2] * width
    const sh = (mask[3] - mask[1]) / size[3] * width
    tempCtx.textAlign = "center"
    tempCtx.textBaseline = "middle"

    // 获取字体
    df.fontsTexts.jinmeiTexts = df.contrastAddFont(df.fontsTexts.jinmeiTexts, text)
    tempCtx.font = width + "px JinMeiMaoCaoXing-" + text


    // 鼠标按下时绘制完整文字
    if (isMouseDown && fg.isSelect()) {
      tempCtx.fillStyle = "#00000022"
      tempCtx.fillText(text, width / 2, width / 2)
    }
  
    // 绘制蒙版
    tempCtx.rect(sx, sy, sw, sh);
    tempCtx.clip();
  
    // 绘制文字
    tempCtx.fillStyle = fg.isSelect() ? 'blue' : 'black'
    tempCtx.fillText(text, width / 2, width / 2)
  
    // 将临时Canv绘制到主Canvas上
    ctx.drawImage(tempCanvas, dx + Number(margin), dy + Number(margin), size[2], size[3])
}

// 绘制提示信息
export function drawCursorPosition(ctx: CanvasRenderingContext2D, logicSize: number[], mouse: Mouse, box: Box) {
    ctx.fillStyle = "gray"
    ctx.textBaseline = "bottom"
    const text = String('cur:(' + Math.round(mouse.relx)) +
      ',' + String(Math.round(mouse.rely)) +
      ') down:' + mouse.isMouseDown +
      ' moving:' + box.moving
    ctx.fillText(text, 0, logicSize[1] - 1)
  }