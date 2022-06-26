<script setup lang="ts">

import { Ref, ref } from 'vue'
import DrawBoard from './components/puzzle/DrawBoard.vue'
import Maker from './components/maker/Maker.vue'

import { refChars, jsonInfo } from './components/puzzle/chars';

enum Page {
  Maker,
  Puzzle
}

const page: Ref<Page> = ref(Page.Maker)

</script>

<template>
  <div style="width: fit-content;">
    <div id="nav-bar">
      <div class="nav-btn">
        <div>Lycium制卡器2.0</div>
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
        <div class="card" v-for="char in refChars.jsons">{{jsonInfo(char)}}</div>
    </div>

    <div v-show="page === Page.Maker">
      <Maker></Maker>
    </div>

    <div v-show="page === Page.Puzzle">
      <DrawBoard></DrawBoard>
    </div>
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

</style>
