<script setup lang="ts">

import * as dw from '../draw/draw'
import { Coord } from '../util/coord'
import { onMounted, watch } from 'vue'

let cvs: dw.Canvas
let width: number

const props = defineProps<{
    width: string
    subcvs: dw.Canvas
}>()

function loop() {
    dw.clearCanvas(cvs)
    // cvs.ctx.fillStyle = 'white'
    // cvs.ctx.fillRect(0, 0, width, width)
    cvs.ctx.drawImage(props.subcvs.canvas, 0, 0, width, width)
}

watch(() => {return props.subcvs}, (n, o) => {
    loop()
})

function oninitCanvas() {
    const canvas = document.getElementById('charPreview') as HTMLCanvasElement
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    width = Number(props.width)
    const size = new Coord(width, width)
    cvs = {
        canvas: canvas,
        ctx: ctx,
        logicSize: size,
        displaySize: size
    }
    dw.setCanvasSize(cvs)
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