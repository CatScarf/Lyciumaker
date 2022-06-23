<script setup lang="ts">

import { onMounted, Ref, ref, createApp, App } from 'vue'
import { Fragments } from './Fragment'
import { setCanvasSize, clearCanvas, drawAuxiliaryLines, drawText, drawCursorPosition } from './Draw'
import { Box, moveTransBox, drawTransBox } from './Move'

import EditCards from './EditCards.vue'

// 画布相关常量
const displayw: number = 492 //显示宽高
const width: number = 512  // 逻辑宽高
const margin: number = displayw * 0.05; // 基本边框

// 画布相关变量
let canvas: HTMLCanvasElement;  // 画布
let ctx: CanvasRenderingContext2D;  // 画布上下文
let logicSize: number[];  // canvas的逻辑大小
let displaySize: number[];  // canvas的绘制大小

// 所有字符片段
const refFragments = ref(new Fragments(width))

// 鼠标相关变量
let clientX: Ref<number> = ref(0)
let clientY: Ref<number> = ref(0)
let isMouseDown: Ref<boolean> = ref(false)
let relx: number = 0
let rely: number = 0

// 锚框相关变量
const box: Box = {
    anchorWidth: 5,
    moving: -1,
    startC: [0, 0],
    startSize: [0, 0],
    mvAnchors: [],
    mkAnchors: []
}


// 动画循环
function loop() {

    // 清空画布
    clearCanvas(ctx, logicSize)

    // 绘制辅助线
    drawAuxiliaryLines(ctx, width, margin)

    // 绘制文字
    for (let i = 0; i < refFragments.value.flist.length; i++) {
        const fgs = refFragments.value
        const fg = fgs.flist[i]
        drawText(ctx, fg, width, isMouseDown.value, margin)
    }

    // 绘制锚框
    for (let i = 0; i < refFragments.value.flist.length; i++) {
        const fg = refFragments.value.flist[i]
        const slst = fg.selectState()
        const isMv = slst == 1 ? true : false

        if (slst == 1 || slst == 2) {
            box.mvAnchors = drawTransBox(ctx, fg.size, width, margin, box.anchorWidth, true, 'blue', isMv)
            box.mkAnchors = drawTransBox(ctx, fg.mask, width, margin, box.anchorWidth, false, 'blue', !isMv)
            if (slst == 1) {
                fg.setSize(moveTransBox(box, fg.size, relx, rely, isMouseDown.value, true, width))
            } else if (slst == 2) {
                fg.setMask(moveTransBox(box, fg.mask, relx, rely, isMouseDown.value, false, width))
            }
        }
    }

    // 确定鼠标位置
    const rect = canvas.getBoundingClientRect();
    relx = (clientX.value - rect.left - margin) * ((width)/(displayw - margin * 2))
    rely = (clientY.value - rect.top - margin) * ((width)/(displayw - margin * 2))

    // 绘制参考信息
    drawCursorPosition(ctx, logicSize, relx, rely, isMouseDown.value, box)

    window.requestAnimationFrame(loop);
}

// 初始化canvas
function oninitCanvas() {
    canvas = document.getElementById('drawBoard') as HTMLCanvasElement;
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const widthWithMargin = width + margin * 2
    logicSize = [widthWithMargin, widthWithMargin]
    displaySize = [displayw, displayw]
    setCanvasSize(canvas, ctx, logicSize, displaySize)
    window.requestAnimationFrame(loop);
}

// 挂载时初始化canvas
onMounted(() => {
    oninitCanvas()
})

</script>

<template>

    <div class="board">
        <div class="card">
            <canvas id="drawBoard" 
                v-on:mousemove="clientX = $event.clientX; clientY = $event.clientY"
                v-on:mousedown="isMouseDown = true" 
                v-on:mouseup="isMouseDown = false" 
                v-on:touchstart="isMouseDown = true"
                v-on:touchend="isMouseDown = false"></canvas>
        </div>
        <EditCards :refFragments='refFragments'></EditCards>
    </div>

</template>

<style scoped>
@font-face {
    font-family: "JinMeiMaoCaoXing";
    src: url("../assets/font/JinMeiMaoCaoXing.ttf") format('truetype');
    font-display: swap;
}

.card {
    border-radius: 5px;
    box-shadow: 0px 0px 7px 0px rgb(167, 161, 161);

    padding: 10px;
    margin: 10px;

    width: fit-content;
}

.board {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

</style>
