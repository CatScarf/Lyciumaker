<script setup lang="ts">

import * as dw from '../draw/draw'
import { Vector } from '../entity/Vector'
import { onMounted, watch } from 'vue'
import { CanvasTool } from '../entity/CanvasTool';

let cvt: CanvasTool
let width: number

const props = defineProps<{
    width: string
    subcvt: CanvasTool
}>()

function loop() {
    cvt.clear()
    // cvt.ctx.fillStyle = 'white'
    // cvt.ctx.fillRect(0, 0, width, width)
    cvt.ctx.drawImage(props.subcvt.canvas, 0, 0, width, width)
}

watch(() => {return props.subcvt}, (n, o) => {
    loop()
})

function oninitCanvas() {
    const canvas = document.getElementById('charPreview') as HTMLCanvasElement
    width = Number(props.width)
    const logicSize = new Vector(Number(props.width), Number(props.width))
    cvt = new CanvasTool(canvas, logicSize, logicSize)
}

onMounted(() => {
    oninitCanvas()
})

</script>

<template>
    <div class="glass-card">
        <canvas id="charPreview">
        </canvas>
    </div>
</template>

<style scoped>
.glass-card{
    backdrop-filter: blur(10px);
    background-color: rgba(91, 91, 91, 0.148);
    border-radius: 10px;
    box-shadow: 0px 0px 7px 0px rgb(154, 154, 154);
    padding: 5px;
    margin: 5px;
}

</style>