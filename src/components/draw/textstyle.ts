// 文本样式
export interface TextStyle { 
    align: CanvasTextAlign, 
    baseline: CanvasTextBaseline, 
    fillStyle: string
}

// 应用文本样式
export function applyText(ctx: CanvasRenderingContext2D, tl: TextStyle) {
    ctx.textAlign = tl.align
    ctx.textBaseline = tl.baseline
    ctx.fillStyle  = tl.fillStyle
}