import { createMemoryHistory, createRouter, RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "Home",
        component: () => import("@/views/Home.vue"),
    },
    // {
    //     path: "/home",
    //     name: "Home",
    //     component: () => import("@/views/Home.vue"),
    // },
    {
        path: "/book",
        name: "Book",
        component: () => import("@/views/Book.vue"),
    },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    next()
})

export default router
