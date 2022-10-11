// electron-main/window.ts
import type { NativeImage } from "electron"
import { app, BrowserWindow, ipcMain, shell, Menu, Tray } from "electron"
import { join } from "path"
process.env.DIST_ELECTRON = join(__dirname, "..")
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist")
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, "../public")

const preload = join(__dirname, "../preload/index.js")
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, "index.html")

interface IWindowsCfg {
    id: number | null
    title: string
    width: number | null
    height: number | null
    minWidth: number | null
    minHeight: number | null
    route: string
    resizable: boolean
    maximize: boolean
    transparent: boolean
    backgroundColor: string
    data: object | null
    isMultiWindow: boolean
    isMainWin: boolean
    parentId: number | null
    modal: boolean
}
interface IWindowOpt {
    width: number
    height: number
    icon: NativeImage | string
    backgroundColor: string
    autoHideMenuBar: boolean
    resizable: boolean
    minimizable: boolean
    maximizable: boolean
    frame: boolean
    show: boolean
    parent?: BrowserWindow
    minWidth: number
    minHeight: number
    modal: boolean
    webPreferences: {
        contextIsolation: boolean //上下文隔离
        nodeIntegration: boolean //启用 Node 集成（是否完整的支持 node）
        webSecurity: boolean
        preload: string
    }
}

// 新建窗口时可以传入的一些options配置项
export const windowsCfg: IWindowsCfg = {
    id: null, //唯一 id
    title: "", //窗口标题
    width: null, //宽度
    height: null, //高度
    minWidth: null, //最小宽度
    minHeight: null, //最小高度
    route: "", // 页面路由 URL '/manage?id=123'
    resizable: true, //是否支持调整窗口大小
    maximize: false, //是否最大化
    transparent: true,
    backgroundColor: "#00000001", //窗口背景色
    data: null, //数据
    isMultiWindow: false, //是否支持多开窗口 (如果为 false，当窗体存在，再次创建不会新建一个窗体 只 focus 显示即可，，如果为 true，即使窗体存在，也可以新建一个)
    isMainWin: false, //是否主窗口(当为 true 时会替代当前主窗口)
    parentId: null, //父窗口 id  创建父子窗口 -- 子窗口永远显示在父窗口顶部 【父窗口可以操作】
    modal: false, //模态窗口 -- 模态窗口是禁用父窗口的子窗口，创建模态窗口必须设置 parent 和 modal 选项 【父窗口不能操作】
}
// 窗口组
interface IGroup {
    [props: string]: {
        route: string
        isMultiWindow: boolean
    }
}
/**
 * 窗口配置
 */
export class Window {
    main: BrowserWindow | null | undefined
    group: IGroup
    tray: Tray | null
    constructor() {
        this.main = null //当前页
        this.group = {} //窗口组
        this.tray = null //托盘
    }

    // 窗口配置
    winOpts(wh: Array<number> = []): IWindowOpt {
        return {
            width: wh[0],
            height: wh[1],
            backgroundColor: "#00000001",
            autoHideMenuBar: true,
            resizable: true,
            minimizable: true,
            maximizable: true,
            frame: false,
            show: false,
            minWidth: 0,
            minHeight: 0,
            modal: true,
            icon: join(process.env.PUBLIC, "favicon.ico"),
            webPreferences: {
                contextIsolation: false, //上下文隔离
                nodeIntegration: true, //启用 Node 集成（是否完整的支持 node）
                webSecurity: false,
                preload,
            },
        }
    }

    // 获取窗口
    getWindow(id: number): any {
        return BrowserWindow.fromId(id)
    }

    // 创建窗口
    createWindows(options: object) {
        console.log("------------开始创建窗口...")
        let args = Object.assign({}, windowsCfg, options)
        // 判断窗口是否存在
        for (let i in this.group) {
            if (this.getWindow(Number(i)) && this.group[i].route === args.route && !this.group[i].isMultiWindow) {
                console.log("窗口已经存在了")
                this.getWindow(Number(i)).focus()
                return
            }
        }
        // 创建 electron 窗口的配置参数
        let opt = this.winOpts([args.width || 390, args.height || 590])
        // 判断是否有父窗口
        if (args.parentId) {
            console.log("parentId：" + args.parentId)
            opt.parent = this.getWindow(args.parentId) as BrowserWindow // 获取主窗口
        } else if (this.main) {
            console.log("当前为主窗口")
        } // 还可以继续做其它判断
        // 根据传入配置项，修改窗口的相关参数
        opt.modal = args.modal
        opt.resizable = args.resizable // 窗口是否可缩放
        if (args.backgroundColor) opt.backgroundColor = args.backgroundColor // 窗口背景色
        if (args.minWidth) opt.minWidth = args.minWidth
        if (args.minHeight) opt.minHeight = args.minHeight
        console.log(opt)
        let win = new BrowserWindow(opt)
        console.log("窗口 id：" + win.id)
        this.group[win.id] = {
            route: args.route,
            isMultiWindow: args.isMultiWindow,
        }
        // 是否最大化
        if (args.maximize && args.resizable) {
            win.maximize()
        }
        // 是否主窗口
        if (args.isMainWin) {
            if (this.main) {
                console.log("主窗口存在")
                delete this.group[this.main.id]
                this.main.close()
            }
            this.main = win
        }
        args.id = win.id
        win.on("close", () => win.setOpacity(0))

        // 打开网址（加载页面）
        let winURL
        if (app.isPackaged) {
            // winURL = args.route ? `app://./index.html${args.route}` : `app://./index.html`
            // winURL = args.route ? `${indexHtml}?route=${args.route}` : indexHtml
            if (args.route) {
                win.loadFile(indexHtml, { search: `route=${args.route}&&winId=${args.id}` })
            } else {
                win.loadFile(indexHtml, { search: `winId=${args.id}` })
            }
            // win.loadFile(winURL)
            win.webContents.openDevTools()
        } else {
            // winURL = args.route
            //     ? `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}${args.route}?winId=${args.id}`
            //     : `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}?winId=${args.id}`
            // winURL = args.route ? `${url}#/${args.route}?winId=${args.id}` : `${url}?winId=${args.id}`
            winURL = args.route ? `${url}?route=${args.route}&&winId=${args.id}` : `${url}?winId=${args.id}`
            win.loadURL(winURL)
            win.webContents.openDevTools()
        }
        console.log("新窗口地址:", winURL)
        win.once("ready-to-show", () => {
            win.show()
        })
        // Test actively push message to the Electron-Renderer
        win.webContents.on("did-finish-load", () => {
            win?.webContents.send("main-process-message", new Date().toLocaleString())
        })

        // Make all links open with the browser, not with the application
        win.webContents.setWindowOpenHandler(({ url }) => {
            if (url.startsWith("https:")) shell.openExternal(url)
            return { action: "deny" }
        })
    }

    // 创建托盘
    createTray() {
        const contextMenu = Menu.buildFromTemplate([
            {
                label: "注销",
                click: () => {
                    console.log("注销")
                    // 主进程发送消息，通知渲染进程注销当前登录用户 --todo
                },
            },
            {
                type: "separator", // 分割线
            },
            // 菜单项
            {
                label: "退出",
                role: "quit", // 使用内置的菜单行为，就不需要再指定 click 事件
            },
        ])
        this.tray = new Tray(join(process.env.PUBLIC, "node.png")) // 图标favicon.ico
        // 点击托盘显示窗口
        this.tray.on("click", () => {
            for (let i in this.group) {
                if (this.group[i]) this.getWindow(Number(i)).show()
            }
        })
        // 处理右键
        this.tray.on("right-click", () => {
            this.tray?.popUpContextMenu(contextMenu)
        })
        this.tray.setToolTip("小猪课堂")
    }

    // 开启监听
    listen() {
        // 固定
        ipcMain.on("pinUp", (event: Event, winId) => {
            event.preventDefault()
            if (winId && (this.main as BrowserWindow).id == winId) {
                let win: BrowserWindow = this.getWindow(Number((this.main as BrowserWindow).id))
                if (win.isAlwaysOnTop()) {
                    win.setAlwaysOnTop(false) // 取消置顶
                } else {
                    win.setAlwaysOnTop(true) // 置顶
                }
            }
        })

        // 隐藏
        ipcMain.on("window-hide", (event, winId) => {
            if (winId) {
                this.getWindow(Number(winId)).hide()
            } else {
                for (let i in this.group) {
                    if (this.group[i]) this.getWindow(Number(i)).hide()
                }
            }
        })

        // 显示
        ipcMain.on("window-show", (event, winId) => {
            if (winId) {
                this.getWindow(Number(winId)).show()
            } else {
                for (let i in this.group) {
                    if (this.group[i]) this.getWindow(Number(i)).show()
                }
            }
        })

        // 最小化
        ipcMain.on("window-mini", (event: Event, winId) => {
            console.log("最小化窗口 id", winId)
            if (winId) {
                this.getWindow(Number(winId)).minimize()
            } else {
                for (let i in this.group) {
                    if (this.group[i]) {
                        this.getWindow(Number(i)).minimize()
                    }
                }
            }
        })

        // 窗口最大化
        ipcMain.on("window-max", (event, winId) => {
            if (winId) {
                this.getWindow(Number(winId)).maximize()
            } else {
                for (let i in this.group) if (this.group[i]) this.getWindow(Number(i)).maximize()
            }
        })

        //窗口大小切换
        ipcMain.handle("window-toggle-maximized", async (event, winId) => {
            let win: BrowserWindow;
            if (winId && (this.main as BrowserWindow).id == winId) {
                win = this.getWindow(Number(winId))
            } else {
                win = this.getWindow(Number((this.main as BrowserWindow).id))
            }
            if (!win.isMaximized() && win.isMaximizable()) {
                win.maximize()
                return true
            } else if (win.isMaximized()) {
                win.unmaximize()
                return false
            } else {
                return new Error("window is not maximizable")
            }
        })

        // 关闭窗口
        ipcMain.on("window-close", (event, winId) => {
            if (winId) {
                this.getWindow(Number(winId)).close()
            } else {
                for (let i in this.group) {
                    if (this.group[i]) this.getWindow(Number(i)).close()
                }
            }
        })

        // 创建窗口
        ipcMain.on("window-new", (event: Event, args) => this.createWindows(args))
    }
}
