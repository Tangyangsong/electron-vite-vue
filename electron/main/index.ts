// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, "..")
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist")
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, "../public")

import { app, BrowserWindow, shell, ipcMain } from "electron"
import { release } from "os"
import { join } from "path"
import { Window } from "./window"

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js")
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, "index.html")

async function createWindow() {
    let window = new Window()
    window.listen() // 设置监听事件，比如主进程与渲染进程之间的通信事件
    window.createWindows({ isMainWin: true }) // 创建窗口，默认为主窗口
    window.createTray() // 创建系统托盘 
    // win = new BrowserWindow({
    //     title: "Main window",
    //     width: 1200,
    //     height: 700,
    //     minWidth: 800,
    //     minHeight: 600,
    //     icon: join(process.env.PUBLIC, "favicon.ico"),
    //     webPreferences: {
    //         preload,
    //         // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
    //         // Consider using contextBridge.exposeInMainWorld
    //         // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
    //         nodeIntegration: true,
    //         contextIsolation: false,
    //         // nodeIntegrationInWorker: true,// 在Web工作器中启用了Node集成
    //         // nodeIntegrationInSubFrames: true//允许在子页面(iframe)或子窗口(child window)中集成Node.js
    //     },
    //     frame: false, // 标题栏和边框一并隐藏
    //     // resizable: true,//窗口大小是否可调整
    //     transparent: true,
    //     // https://github.com/electron/electron/issues/20357
    //     backgroundColor: "#00000001",
    // })

    // if (app.isPackaged) {
    //     win.loadFile(indexHtml)
    // } else {
    //     // win.loadURL(`${url}login.html`)
    //     win.loadURL(url)
    //     // Open devTool if the app is not packaged
    //     win.webContents.openDevTools()
    // }

    // // Test actively push message to the Electron-Renderer
    // win.webContents.on("did-finish-load", () => {
    //     win?.webContents.send("main-process-message", new Date().toLocaleString())
    // })

    // // Make all links open with the browser, not with the application
    // win.webContents.setWindowOpenHandler(({ url }) => {
    //     if (url.startsWith("https:")) shell.openExternal(url)
    //     return { action: "deny" }
    // })
}

app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
    win = null
    if (process.platform !== "darwin") app.quit()
})

app.on("second-instance", () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) win.restore()
        win.focus()
    }
})

app.on("activate", () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
        allWindows[0].focus()
    } else {
        createWindow()
    }
})

// new window example arg: new windows url (打开新窗口)
ipcMain.handle("main.WindowManager:openWindow", (event, arg) => {
    const childWindow = new BrowserWindow({
        title: "Main window",
        // parent: win,
        width: 600,
        height: 350,
        webPreferences: {
            preload,
        },
    })

    if (app.isPackaged) {
        childWindow.loadFile(indexHtml, { hash: arg })
    } else {
        console.log(`${url}#${arg}`)
        win.loadURL(url)
        // childWindow.loadURL(`${url}${arg}`)
        // childWindow.loadURL(`${url}#/${arg}`)
        childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
    }
})
//关闭窗口
ipcMain.on("main.WindowManager:closeWindow", () => {
    if (win.isClosable()) {
        win.close()
    }
})
//窗口大小切换
ipcMain.handle("main.WindowManager:toggleMaximized", async (event) => {
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
//窗口最小化
ipcMain.handle("main.WindowManager:minimize", async (event) => {
    if (win.isMinimizable()) {
        win.minimize()
        return true
    }
})
//窗口是否最大化
ipcMain.handle("main.WindowManager:isMaximized", async (event) => {
    return win.isMaximized()
})
