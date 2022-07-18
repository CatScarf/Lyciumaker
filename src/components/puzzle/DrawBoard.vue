<script setup lang="ts">

import { onMounted, Ref, ref, watch } from 'vue'
import { Fragments } from './fragment'
import { drawAuxiliaryLines, drawText } from './draw'

import EditCards from './EditCards.vue'
import { downloadJson } from './util'
import { refChars } from './chars'
import { translate } from '../fonts/trainslate'
import { Mouse } from '../controller/Mouse'
import { CanvasTool } from '../entity/CanvasTool'
import { Vector } from '../entity/Vector'
import { AnchorBox } from '../entity/AnchorBox'
import { Rect } from '../entity/Rect'

// 组件参数
const props = defineProps<{
    fragments: Fragments
}>()

// 自动繁体输入
const refIsTranslate = ref(true)


// 画布相关常量
const displayw: number = 400 //显示宽高
const width: number = 512  // 逻辑宽高
const margin: number = displayw * 0.05; // 基本边框

// 画布相关变量
let cvt: CanvasTool

// 所有字符片段
const fragments: Fragments = props.fragments

// 鼠标相关变量
let mouse: Mouse

// 锚框相关变量
let anchorBox: AnchorBox

// 动画循环
function loop() {
    // 清空画布
    cvt.clear()

    // 绘制辅助线
    drawAuxiliaryLines(cvt.ctx, width, margin)

    // 绘制文字
    for (let i = 0; i < fragments.flist.length; i++) {
        const fgs = fragments
        const fg = fgs.flist[i]
        drawText(cvt.ctx, fg, width, mouse.isDown(), margin)
    }

    // 绘制锚框
    for (let fg of fragments.flist) {
        const state = fg.selectState()
        if (state != 'none') {
            const size = fg.getSize()
            const mask = fg.getMask()
            anchorBox.resize(Rect.fromCenterCoord(size.x + width / 2, size.y + width / 2, size.w, size.h), Rect.fromQuadCoord(mask.x1, mask.y1, mask.x2, mask.y2))
            const res = anchorBox.move(state)
            fg.size = [res.size.x + res.size.w / 2 - width / 2, res.size.y + res.size.h / 2 - width / 2, res.size.w, res.size.h]
            fg.mask = [res.mask.x, res.mask.y, res.mask.x + res.mask.w, res.mask.y + res.mask.h]
            anchorBox.draw(state)
        }
    }

    // 鼠标动画
    mouse.visible()

    // 下一帧
    window.requestAnimationFrame(loop);
}

// 初始化canvas并开始动画循环
function oninitCanvas() {
    const canvas = document.getElementById('drawBoard') as HTMLCanvasElement;
    const logicSize =  new Vector(width + margin * 2, width + margin * 2) 
    const displaySize = new Vector(displayw, displayw)
    cvt = new CanvasTool(canvas, logicSize, displaySize)
    mouse = new Mouse(cvt)
    anchorBox = new AnchorBox(cvt, mouse, margin)
    window.requestAnimationFrame(loop)
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
    if (titleGuard(fragments.sch, fragments.zch)) {
        refChars.value.add(fragments)
    }
}

// 导出Json
function exportJson() {
    if (titleGuard(fragments.sch, fragments.zch)) {
        apply()
        const sp = fragments.sch[0]
        const td =  fragments.zch[0]
        downloadJson(`${sp}-${td}.json`, fragments.tojson())
    }
}

// 点击导入Json
function importJsonClick() {
    const fileElement = document.getElementById('import-json')
    fileElement?.click()
}

// 导入Json
function importJson(event: any) {
    const file = event.target.files[0]
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => {
        const fgs = new Fragments
        try {
            fgs.fromjson(reader.result as string)
            refChars.value.add(fgs)
        } catch (err) {
            alert('Json解析失败! 错误信息: ' + err)
        }

    }
}

watch(() => {return fragments.sch}, (n, o) => {
    console.log(o, n)
    if (refIsTranslate.value) {
        fragments.zch = translate(n)
    }
})

</script>

<template>
    <div class="board">
        <!-- 主编辑器 -->
        <div class="card">
            <canvas id="drawBoard"></canvas>
        </div>
        <!-- 导出按钮 -->
        <div class="card export">
            <div class="text exportLine">简体汉字*</div>
            <div class="exportLine">
                <input class="textInput" v-model="fragments.sch">
            </div>
            <div class="row-flex-center">
                <div class="exportLine">繁体*</div>
                <input type="checkbox" v-model="refIsTranslate">
                <div>自动</div>
            </div>
            <div class="exportLine">
                <input class="textInput" v-model="fragments.zch" :disabled="refIsTranslate">
            </div>
            <div class="exportLine">描述（选填）</div>
            <div class="exportLine">
                <input class="textInput" v-model="fragments.describe">
            </div>
            <div class="exportLine">
                <button @click="apply">应用</button>
            </div>
            <div class="exportLine">
                <button @click="exportJson">导出JSON</button>
            </div>
            <div class="exportLine" style="visibility:hidden">
                <button>上传至服务器</button>
            </div>
            <div class="exportLine" style="visibility:hidden">
                <button>？？？？</button>
            </div>
            <div class="exportLine">
                <button @click="importJsonClick()">导入JSON</button>
            </div>

            <div class="row-flex-center" style="display: none;">
                <input id='import-json' type="file" accept=".json" @change="importJson($event)">
            </div>

        </div>
        <!-- 数值编辑器 -->
        <EditCards :fragments='fragments'></EditCards>
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
    margin: 5px;
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
