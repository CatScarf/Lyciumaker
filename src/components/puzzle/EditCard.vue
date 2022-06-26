<script setup lang="ts">

import { Ref, ref } from 'vue';

defineProps(['refText' ,'refSize', 'refMask', 'refSelect'])
defineEmits(['update:refText', 'update:refSize', 'update:refMask', 'MvtsClick', 'MaskClick', 'DelClick', 'CpClick'])

// 选中功能相关变量
let refMvtsOn: Ref<boolean> = ref(false);
let refMaskOn: Ref<boolean> = ref(false);
let refDelOn: Ref<boolean> = ref(false);
let refCpOn: Ref<boolean> = ref(false);

</script>

<template>
  <div class="card editCard" v-bind:class="{onDel: refDelOn, onCp: refCpOn}">
    <!-- 字符 -->
    <div class="cardPart">
      <div class="titleAndButton">
        <div class="smallTitle">字符</div>
        <div class="cpCardButton" @mouseenter="refCpOn=true" @mouseleave="refCpOn=false" @mousedown="$emit('CpClick')">＋</div>
        <div class="rmCardButton" @mouseenter="refDelOn=true" @mouseleave="refDelOn=false" @mousedown="$emit('DelClick')">×</div>
      </div>
      <input class="myInput" type="text" v-model="refText[0]" @input="$emit('update:refText', [($event.target as HTMLInputElement).value])" placeholder="请输入字符" style="margin: 4px 0 0 2px ">
    </div>

    <hr class="cardHr" align=center color=gray SIZE=1>

    <!-- 移动与变形 -->
    <div class="cardPart" v-bind:class="{preSelect: refMvtsOn, select: refSelect[0]}" @mouseenter="refMvtsOn=true" @mouseleave="refMvtsOn=false" @mousedown="$emit('MvtsClick')">
      <div class="smallTitle" style="margin:0 0 5px 0">移动与变形</div>
      <div class="doubleInput">
        <div>X:</div>
        <input class="myInput" type="number" v-model="refSize[0]" @input="$emit('update:refSize', [($event.target as HTMLInputElement).value, refSize[1], refSize[2], refSize[3]])" placeholder="左上坐标x1">
        <div>Y:</div>
        <input class="myInput" type="number" v-model="refSize[1]" @input="$emit('update:refSize', [refSize[0], ($event.target as HTMLInputElement).value, refSize[2], refSize[3]])" placeholder="左上坐标y1">
      </div>
      <div class="doubleInput">
        <div>W:</div>
        <input class="myInput" type="number" v-model="refSize[2]" @input="$emit('update:refSize', [refSize[0], refSize[1], ($event.target as HTMLInputElement).value, refSize[3]])" placeholder="右下坐标x1">
        <div>H:</div>
        <input class="myInput" type="number" v-model="refSize[3]" @input="$emit('update:refSize', [refSize[0], refSize[1], refSize[2], ($event.target as HTMLInputElement).value])" placeholder="右下坐标y1">
      </div>
    </div>

    <hr class="cardHr" align=center color=gray SIZE=1>

    <!-- 蒙版 -->
    <div class="cardPart" v-bind:class="{preSelect: refMaskOn, select: refSelect[1]}" @mouseenter="refMaskOn=true" @mouseleave="refMaskOn=false" @mousedown="$emit('MaskClick')">
      <div class="smallTitle">蒙版</div>
      <div class="maskattr">
        <div class="doubleInput">
          <div>X1:</div>
          <input class="myInput" type="number" v-model="refMask[0]" @input="$emit('update:refMask', [($event.target as HTMLInputElement).value, refMask[1], refMask[2], refMask[3]])" placeholder="左上坐标x1">
          <div>Y1:</div>
          <input class="myInput" type="number" v-model="refMask[1]" @input="$emit('update:refMask', [refMask[0], ($event.target as HTMLInputElement).value, refMask[2], refMask[3]])" placeholder="左上坐标y1">
        </div>
        <div class="doubleInput">
          <div>X2:</div>
          <input class="myInput" type="number" v-model="refMask[2]" @input="$emit('update:refMask', [refMask[0], refMask[1], ($event.target as HTMLInputElement).value, refMask[3]])" placeholder="右下坐标x2">
          <div>Y2:</div>
          <input class="myInput" type="number" v-model="refMask[3]" @input="$emit('update:refMask', [refMask[0], refMask[1], refMask[2], ($event.target as HTMLInputElement).value])" placeholder="右下坐标y2">
        </div>
      </div>
    </div>

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

.editCard {
  font-size: 10px;
  font-family: Monaco, Consolas, monospace;
  padding: 0px;
  width: 200px;
}

.cardHr {
  margin: 0;
  border: 0;
  height: 1px;
  background-color: rgb(195, 195, 195);
}

.cardPart {
  padding:10px;
}

.maskattr {
  display: grid;
}

.titleAndButton {
  display: grid;
  grid-template-columns: 5fr 1fr 1fr;
  padding: 3px;
  /* align-items: center; */

}

.rmCardButton {
  display: inline-block;
  user-select: none;
  color: rgb(255, 0, 0);
  text-shadow: rgb(255, 0, 0) 0 0 6px;
  font-size: 20px;

  text-align:center;
  line-height: 100%;

  position: relative;
  transform: translateY(-11%);
}

.cpCardButton {
  display: inline-block;
  user-select: none;
  color: rgb(0, 255, 85);
  text-shadow: rgb(0, 255, 85) 0 0 6px;
  font-size: 19px;

  text-align:center;
  line-height: 100%;
}

.smallTitle {
  color: gray;
  padding: 3px 3px 3px 3px;
  font-weight: 600;
}

.preSelect {
  background-image: linear-gradient(to bottom right, #d5fbff78, #6cceff78);
  border-radius: 5px;
}

.onDel {
  background-image: linear-gradient(to bottom right, #feb69278, #ea545578);
  border-radius: 5px;
}

.onCp {
  background-image: linear-gradient(to bottom right, #81fbb878, #28c76f78);
  border-radius: 5px;
}

.select {
  background-image: linear-gradient(to bottom right, #d5fbff, #6cceff);
  border-radius: 5px;
}

.doubleInput {
  display: grid;
  grid-template-columns: repeat(2, 2fr 5fr);
  padding: 3px;
  align-items: center;
}

.myInput {
  border-style: none;
  border-radius: 5px;
  width: 70%;
  padding: 4px;
  height: 15px;
  background-color: rgb(237, 237, 237);
}
</style>
