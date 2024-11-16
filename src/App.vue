<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { StarndardObjects } from './config'
import { PrototypeChain } from './proto'

/** 可视化对象结构, 如果表达式不能解析成对象, 则尝试执行该表达式 */
function visualizeObjectStructure(target: string) {
  searchValue.value = ''
  prototypeChain.value!.visualize(target)
}

const canvas = ref<HTMLCanvasElement | null>(null)
const searchValue = ref('')
const prototypeChain = ref<PrototypeChain | null>(null)

onMounted(() => {
  prototypeChain.value = new PrototypeChain(canvas.value!)
  prototypeChain.value.bindEvent()
  prototypeChain.value.render(...StarndardObjects)
})
</script>

<template>
  <div id="prototypeVisualize">
    <canvas ref="canvas"></canvas>
    <div id="searchContainer">
      <input
        type="search"
        id="searchInput"
        placeholder="快速搜索"
        v-model="searchValue"
        @keyup.enter="visualizeObjectStructure(searchValue)"
        autocomplete="off" />
      <button id="searchBtn" @click="prototypeChain.searchByKeyword(searchValue)">MDN Search</button>
    </div>
  </div>
</template>

<style scoped>
#prototypeVisualize {
  width: 100vw;
  height: 100vh;
  background-color: #1e1e1e;

  /** common style */
  --pro-height: 50px;
  --pro-font: 'JetBrains Mono', sans-serif;
  --pro-font-size: 20px;
  --pro-font-style: italic;
  --pro-font-weight: bolder;
  --pro-text-color: #fff;
  --pro-search-focus-border-color: #06a17b;
  --pro-search-hover-border-color: rgb(141, 5, 179);

  /** searchContainer */
  --pro-search-top: 35px;
  --pro-search-left: 50%;
  --pro-search-transform: translateX(-50%);

  /** searchInput */
  --pro-search-input-width: 400px;
  --pro-search-input-bd-radius: 25px 0 0 25px;

  /** searchBtn */
  --pro-search-btn-width: 200px;
  --pro-search-btn-bd-radius: 0 25px 25px 0;

  /** 搜索框容器 */
  #searchContainer {
    display: flex;
    width: calc(var(--pro-search-input-width) + var(--pro-search-btn-width));
    height: var(--pro-height);
    position: absolute;
    top: var(--pro-search-top);
    left: var(--pro-search-left);
    transform: var(--pro-search-transform);

    /** 当聚焦在 searchContainer 的 input 上时， searchInput 和 searchBtn 的边框颜色变化 */
    &:hover {
      #searchInput {
        border-color: var(--pro-search-hover-border-color);
        border-right-color: transparent;
      }
      #searchBtn {
        border-color: var(--pro-search-hover-border-color);
        border-left-color: transparent;
      }
    }
    &:focus-within {
      #searchInput {
        border-color: var(--pro-search-focus-border-color);
        border-right-color: transparent;
      }
      #searchBtn {
        border-color: var(--pro-search-focus-border-color);
        border-left-color: transparent; /**rgba(8, 176, 83, 0.88)*/
        background-image: linear-gradient(to right, rgba(10, 189, 91, 0.646), rgba(199, 3, 52, 0.8));
      }
    }

    /** 搜索输入框 */
    #searchInput {
      width: var(--pro-search-input-width);
      height: var(--pro-height);
      background-color: rgba(120, 120, 120, 0.3);
      color: var(--pro-text-color);
      font: var(--pro-font-size) var(--pro-font);
      font-style: var(--pro-font-style);
      font-weight: var(--pro-font-weight);
      letter-spacing: 5px;
      border-radius: var(--pro-search-input-bd-radius);
      padding: 3px 5px 3px 20px;
      border: 1px solid #383838;
      outline: none;
      transition: all 0.3s ease-in-out;

      &::placeholder {
        color: #eee;
      }
      &:focus {
        font-size: 16px;
        line-height: 16px;
        letter-spacing: 1;
        font-weight: normal;
      }
    }
    /** 搜索按钮 */
    #searchBtn {
      width: var(--pro-search-btn-width);
      height: var(--pro-height);
      border-radius: var(--pro-search-btn-bd-radius);
      border: 1px solid #383838;
      outline: none;
      cursor: pointer;
      font: var(--pro-font-size) var(--pro-font);
      font-style: var(--pro-font-style);
      font-weight: var(--pro-font-weight);
      color: var(--pro-text-color);
      background: linear-gradient(to right, rgba(145, 143, 143, 0.88), rgba(240, 240, 240, 0.1));
      transition: all 0.3s ease-in-out;

      &:hover {
        background-image: linear-gradient(to right, rgba(8, 176, 84, 0.687), rgba(199, 3, 52, 0.637));
      }
      &:active {
        background-image: linear-gradient(to right, rgba(8, 176, 84, 0.566), rgba(199, 3, 52, 0.5));
      }
    }
  }
}
</style>
