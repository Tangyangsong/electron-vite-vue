<script setup lang="ts">
// import { ipcRenderer } from "electron"
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from "./components/HelloWorld.vue"
</script>

<template>
    <!--<div class="logo-box">
        <img class="logo vite" src="./assets/vite.svg" @click="handelrClick('max')" />
        <img class="logo electron" src="./assets/electron.svg" @click="handelrClick('min')" />
        <img class="logo vue" src="./assets/vue.svg" @click="handelrClick('close')" />
    </div>
    <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" />
    <div class="static-public">
        Place static files into the <code>/public</code> folder
        <img style="width: 77px" :src="'./node.png'" />
    </div> -->
    <router-view />
</template>

<style>
html,
body {
    height: 100%;
}

body {
    margin: 0;
    line-height: 1.4;
    background: linear-gradient(140deg, transparent, #6bd1fe, #bd34fe);
}

body,
div,
span,
img,
code {
    box-sizing: border-box;
}

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}


.static-public {
    display: flex;
    align-items: center;
    justify-content: center;
}

.static-public code {
    background-color: #eee;
    padding: 2px 4px;
    margin: 0 4px;
    border-radius: 4px;
    color: #304455;
}

.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: 0.75s;
}

.logo.vite:hover {
    filter: drop-shadow(0 0 2em #747bff);
}

.logo.electron:hover {
    filter: drop-shadow(0 0 2em #9feaf9);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #249b73);
}
</style>
