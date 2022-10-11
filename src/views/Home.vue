<template>
  <div>
    home222
  </div>
  <div class="logo-box">
    <button @click="onToggleMaximized()">切换窗口</button>
    <button @click="onMinimize()">最小化</button>
    <button @click="onWindowMax()">最大化</button>
    <button @click="onHide()">隐藏窗口</button>
    <button @click="onHide()">关闭</button>
    <button @click="onOpenWin()">打开新窗口</button>
    <!-- <img class="logo vite" src="@/assets/vite.svg" @click="handelrClick('max')" />
      <img class="logo electron" src="@/assets/electron.svg" @click="handelrClick('min')" />
      <img class="logo vue" src="@/assets/vue.svg" @click="handelrClick('close')" /> -->
  </div>
</template>
<script setup lang="ts">
import { ipcRenderer } from 'electron';

// 关闭窗口
const onClose = () => {
  // ipcRenderer.send('main.WindowManager:closeWindow')
  ipcRenderer.send('window-close')
}
// 隐藏窗口
const onHide = () => {
  ipcRenderer.send('window-hide')
}

const onToggleMaximized = async () => {
  const result = await ipcRenderer.invoke('window-toggle-maximized')
  console.log(result)
  if (result instanceof Error) {
    console.log('err')
  }
}

const onMinimize = () => {
  ipcRenderer.send('window-mini')
}

const onWindowMax = async () => {
  ipcRenderer.send('window-max')
  console.log('窗口最大化')
}

const onOpenWin = async () => {
  ipcRenderer.send("window-new", {
    route: "/book",
    width: 500,
    height: 500,
    isMainWin: true
  });
  // ipcRenderer.invoke('main.WindowManager:openWindow', 'book')
}



</script>
<style lang="less" scoped>
.logo-box {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  /* height: calc(100vh - 24px); */
}
</style>