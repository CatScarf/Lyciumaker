<script setup lang="ts">

import { onMounted, Ref, ref } from 'vue'
import DrawBoard from './components/puzzle/DrawBoard.vue'
import Maker from './components/maker/Maker.vue'

import { refChars, jsonInfo } from './components/puzzle/chars';

import { Fragments } from './components/puzzle/fragment'
import CharPreview from './components/puzzle/CharPreview.vue';

enum Page {
  Maker,
  Puzzle
}

const page: Ref<Page> = ref(Page.Maker)
const isSmallCharHover: Ref<boolean> = ref(false)
const refHoverFgs: Ref<Fragments> = ref(new Fragments())

const refVersion: Ref<string> = ref('2.5.4')

const fragments: Ref<Fragments> = ref(new Fragments())

window.onbeforeunload = (event: any) => {
  return "您确认要离开吗？所有内容将会丢失！"
}

</script>

<template>
  <div id="nav-bar" class="row-flex-center">
    <div class="title">
      <div>Lycium制卡器{{ refVersion }}</div>
    </div>
    <div class="nav-btn" @click="page = Page.Maker">
      <div>制卡</div>
    </div>
    <div class="nav-btn" @click="page = Page.Puzzle">
      <div>拼字</div>
    </div>
    <div class="nav-btn" onclick="window.open(href='https://www.bilibili.com/video/BV19P4y1j7n6/')">
      <div>反馈</div>
    </div>
    <div class="nav-btn" onclick="window.open(href='/income/收支与捐赠.html')">
      <div>收支</div>
    </div>
    <div class="nav-btn" onclick="window.open('https://github.com/CatScarf/Lyciumaker')">
      <div>Github</div>
    </div>
  </div>


  <div style="padding: 5px; background: #33cc66; font-size: 10px; text-align: center; color: white">
    感谢大家的捐赠，现在服务器的经济压力大幅缓解，您仍可以
    <a href="https://www.bilibili.com/video/BV19P4y1j7n6/" style="display: inline-block; color: white" target="_blank">
      在该视频下充电
    </a>
    以捐助本网站。此视频下的捐助将全部用于本站服务器费用。具体收支请点击导航栏“收支”查看
  </div>

  <div id="chars" class="row-flex-center">
    <div class="char card" v-for="char in refChars.jsons" @click="fragments.fromjson(char)"
      @mouseenter="isSmallCharHover = true; refHoverFgs = new Fragments().fromjson(char)"
      @mouseleave="isSmallCharHover = false">{{ jsonInfo(char) }}</div>
  </div>

  <div style="width: fit-content;">
    <div v-show="page === Page.Maker">
      <Maker :version="refVersion"></Maker>
    </div>

    <div v-show="page === Page.Puzzle">
      <DrawBoard :fragments="fragments"></DrawBoard>
    </div>
  </div>

  <div id="char-preview" v-show="isSmallCharHover">
    <CharPreview class="relative-center" width='256' :subcvt="refHoverFgs.draw()"></CharPreview>
  </div>

  <div id="bottomBar" style="margin-top:20px; margin-bottom:20px; padding: 5px 5px; background: #d5d5d5;">
    <a class="bottomInfo" href="http://beian.miit.gov.cn/" target="_blank">吉ICP备2022000349号-1</a>
    &nbsp&nbsp
    <img src="/备案图标.png" style="width:20px; height:20px;">
    <a class="bottomInfo" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=22010402001039"
      target="_blank">吉公网安备22010402001039号</a>
  </div>
</template>

<style scoped>
#nav-bar {
  background-color: rgb(44, 49, 50);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  font-family: "PingFang SC", SimHei, Monaco, Consolas, monospace;
}

.nav-btn {
  color: rgb(221, 221, 221);
  padding: 10px 10px;
  height: 100%;
  display: flex;
  place-items: center;
  user-select: none;

  font-size: 15px;
}

.title {
  /* color: rgb(254, 110, 110); */
  padding: 0px 10px;
  height: 100%;
  user-select: none;

  font-size: 15px;
  font-weight: 500;

  background: linear-gradient(to bottom right, #fff3b0, #ca26ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
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
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

#bottomBar {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  height: 20px;
}

.bottomInfo {
  color: #666;
  font-size: 12px;
  text-decoration: none;
  height: 20px;
  line-height: 20px;
}
</style>
