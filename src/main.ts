import { createApp } from "vue"
import App from "./App.vue"
import router from "@/router"
import { getQueryObject } from "./utils"
// const pinia = createPinia()
// pinia.use(watcher)

const app = createApp(App)
// app.use(pinia)
app.use(router)
// app.use(i18n)
app.mount("#app").$nextTick(() => {
    const query = getQueryObject(window.location.href)
    console.log(query)
    //query.winId(窗口Id) query.route(路由地址)
    if (query.route) router.replace({ path: query.route })
    // initialStore().then(() => {
    //   router.replace({ path: '/device' })
    //   // debug only
    //   window.onclick = (event) => {
    //     console.log('you clicked: ', event.target)
    //   }
    // })
})

// createApp(App)
//   .mount('#app')
//   .$nextTick(() => {
//     postMessage({ payload: 'removeLoading' }, '*')
//   })
