<script setup lang="ts">

import { Ref, ref } from 'vue'
import DrawBoard from './components/puzzle/DrawBoard.vue'
import Maker from './components/maker/Maker.vue'

import { refChars, jsonInfo } from './components/puzzle/chars';

import {Fragment, Fragments, refFragments} from './components/puzzle/fragment'
import CharPreview from './components/puzzle/CharPreview.vue';

enum Page {
  Maker,
  Puzzle
}

const page: Ref<Page> = ref(Page.Maker)
const isSmallCharHover: Ref<boolean> = ref(false)
const refHoverFgs: Ref<Fragments> = ref(new Fragments())

const refVersion: Ref<string> = ref('2.0')

// window.onbeforeunload = (event: any) => {
//   return "您确认要离开吗？所有内容将会丢失！"
// }

</script>

<template>
  <div style="width: fit-content;">
    <div id="nav-bar">
      <div class="nav-btn">
        <div>Lycium制卡器{{refVersion}}</div>
      </div>
      <div class="nav-btn" @click="page = Page.Maker">
        <div>制卡</div>
      </div>
      <div class="nav-btn" @click="page = Page.Puzzle">
        <div>拼字</div>
      </div>
      <div class="nav-btn">
        <div>反馈</div>
      </div>
      <div class="nav-btn">
        <div>捐赠</div>
      </div>
      <div class="nav-btn">
        <div>Github</div>
      </div>
    </div>

    <div id="chars" class="row-flex-center">
        <div class="char card" v-for="char in refChars.jsons" @click="refFragments.fromjson(char)" @mouseenter="isSmallCharHover = true; refHoverFgs = new Fragments().fromjson(char)" @mouseleave="isSmallCharHover = false">{{jsonInfo(char)}}</div>
    </div>

    <div v-show="page === Page.Maker">
      <Maker :version="refVersion"></Maker>
    </div>

    <div v-show="page === Page.Puzzle">
      <DrawBoard></DrawBoard>
    </div>
  </div>

  <div id="char-preview" v-show="isSmallCharHover">
    <CharPreview class="relative-center" width='256' :subcvs="refHoverFgs.draw()"></CharPreview>
  </div>
</template>

<style scoped>

#nav-bar {
  background-color: rgb(44, 49, 50);
  height: 44px;
  display: flex;
  flex-direction: row;
  width: 1000%;
  font-family: "PingFang SC", SimHei, Monaco, Consolas, monospace;

  padding: 0 0px;
}

.nav-btn {
  color: rgb(221, 221, 221);
  padding: 0px 10px;
  height: 100%;
  display: flex;
  place-items: center;
  user-select: none;

  font-size: 15px;
}

.nav-btn:hover {
  color: white;
  cursor: pointer;
}

.row-flex-center {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  place-items: center;
  padding: 1px;
}
.card {
  border-radius: 5px;
  box-shadow: 0px 0px 7px 0px rgb(167 161 161);
  padding: 5px;
  margin: 5px;
}

.char {
  user-select: none;
}

.char:hover {
  background-image: linear-gradient(to bottom right, #81fbb878, #28c76f78);
}

.char:active {
  background-image: linear-gradient(to bottom right, #81fbb8, #28c76f);
}

#char-preview {
  position: absolute;
  /* background-color: rgba(0, 0, 0, 0.575); */
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
}

.relative-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}


</style>
