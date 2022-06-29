<script setup lang="ts">

import { onMounted, Ref, ref } from 'vue'
import { Fragments, refFragments } from './fragment'
import { setCanvasSize, clearCanvas, drawAuxiliaryLines, drawText, drawCursorPosition } from './draw'
import { Mouse, Box, moveTransBox, drawTransBox } from './move'

import EditCards from './EditCards.vue'
import { downloadJson } from './util'
import { refChars } from './chars'

// 画布相关常量
const displayw: number = 400 //显示宽高
const width: number = 512  // 逻辑宽高
const margin: number = displayw * 0.05; // 基本边框

// 画布相关变量
let canvas: HTMLCanvasElement;  // 画布
let ctx: CanvasRenderingContext2D;  // 画布上下文
let logicSize: number[];  // canvas的逻辑大小
let displaySize: number[];  // canvas的绘制大小

// 所有字符片段
refFragments.value.width = width

// 鼠标相关变量
let clientX: Ref<number> = ref(0)
let clientY: Ref<number> = ref(0)
const mouse: Ref<Mouse> = ref({
    isMouseDown: false,
    relx: 0,
    rely: 0,
})


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
        drawText(ctx, fg, width, mouse.value.isMouseDown, margin)
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
                fg.setSize(moveTransBox(box, fg.size, mouse.value, true, width))
            } else if (slst == 2) {
                fg.setMask(moveTransBox(box, fg.mask, mouse.value, false, width))
            }
        }
    }

    // 确定鼠标位置
    const rect = canvas.getBoundingClientRect();
    mouse.value.relx = (clientX.value - rect.left - margin) * ((width) / (displayw - margin * 2))
    mouse.value.rely = (clientY.value - rect.top - margin) * ((width) / (displayw - margin * 2))

    // 绘制参考信息
    drawCursorPosition(ctx, logicSize, mouse.value, box)

    window.requestAnimationFrame(loop);
}

// 初始化canvas
function oninitCanvas() {
    canvas = document.getElementById('drawBoard') as HTMLCanvasElement;
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const widthWithMargin = width + margin * 2
    logicSize = [widthWithMargin, widthWithMargin]
    displaySize = [displayw, displayw]
    // 设置画布大小
    setCanvasSize(canvas, ctx, logicSize, displaySize)
    window.requestAnimationFrame(loop);
}

// 挂载时初始化canvas
onMounted(() => {
    oninitCanvas()
})

// 判断是否已经输入简体和繁体汉字
function titleGuard(sc: string, tc: string) {
    if (sc.length > 0 && tc.length > 0) {
        return true
    } else if (sc.length < 1 && tc.length < 1) {
        alert('请输入简体和繁体汉字')
    } else if (sc.length < 1) {
        alert('请输入简体汉字')
    } else if (tc.length < 1) {
        alert('请输入繁体汉字')
    } 
    return false
}

// 应用
function apply() {
    if (titleGuard(refFragments.value.sch, refFragments.value.zch)) {
        refChars.value.add(refFragments.value)
    }
}

// 导出Json
function exportJson() {
    if (titleGuard(refFragments.value.sch, refFragments.value.zch)) {
        apply()
        const sp = refFragments.value.sch[0]
        const td =  refFragments.value.zch[0]
        downloadJson(`${sp}-${td}.json`, refFragments.value.tojson())
    }
}
</script>

<template>
    <div class="board">
        <!-- 主编辑器 -->
        <div class="card">
            <canvas id="drawBoard" v-on:mousemove="clientX = $event.clientX; clientY = $event.clientY"
                v-on:mousedown="mouse.isMouseDown = true" v-on:mouseup="mouse.isMouseDown = false"
                v-on:touchstart="mouse.isMouseDown = true" v-on:touchend="mouse.isMouseDown = false"></canvas>
        </div>
        <!-- 导出按钮 -->
        <div class="card export">
            <div class="text exportLine">简体汉字*</div>
            <div class="exportLine">
                <input class="textInput" v-model="refFragments.sch">
            </div>
            <div class="exportLine">繁体汉字*</div>
            <div class="exportLine">
                <input class="textInput" v-model="refFragments.zch">
            </div>
            <div class="exportLine">描述（选填）</div>
            <div class="exportLine">
                <input class="textInput" v-model="refFragments.describe">
            </div>
            <div class="exportLine">
                <button @click="apply">应用</button>
            </div>
            <div class="exportLine">
                <button @click="exportJson">导出JSON</button>
            </div>
            <div class="exportLine">
                <button>上传至服务器</button>
            </div>
            <div class="exportLine" style="visibility:hidden">
                <button>？？？？</button>
            </div>
            <div class="exportLine">
                <button>导入JSON</button>
            </div>
        </div>
        <!-- 数值编辑器 -->
        <EditCards :refFragments='refFragments'></EditCards>
    </div>

</template>

<style scoped>

.card {
    border-radius: 5px;
    box-shadow: 0px 0px 7px 0px rgb(167, 161, 161);
    padding: 5px;
    margin: 5px;
    width: fit-content;
}

.board {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.export {
    font-family: "PingFang SC", SimHei, Monaco, Consolas, monospace;
    color: gray;
    font-weight: 600;
    font-size: 10px;
}

.exportLine {
    margin: 10px;
}

.textInput {
    border-style: none;
    border-radius: 5px;
    padding: 3px 5px;
    width: 60px;
    background-color: rgb(237, 237, 237);
}

button {
    border-color: #fff;
    border-style: solid;
    border-radius: 10px;
    height: 25px;
    background-color: #fff;
    box-shadow: rgb(60 64 67 / 30%) 0 1px 3px 0;
}

button:hover {
    background-color: rgb(216, 216, 216);
    border-color: rgb(216, 216, 216);
}

button:active {
    border-color: rgb(41, 41, 41);
}

.row-flex-center {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    place-items: center;
    padding: 1px;
}
</style>
