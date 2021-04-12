//===============================================================================
// Dependencies
//===============================================================================
const { app, BrowserWindow, globalShortcut, ipcMain, screen, CommandLine } = require("electron");
const path = require("path");

//===============================================================================
// Global Constants
//===============================================================================

/* File Paths */
const indexFilePath = path.join(__dirname, "./index.html");
const characterFilePath = path.join(__dirname, "./character.html");
const timerFilePath = path.join(__dirname, "./timer.html");
const editFilePath = path.join(__dirname, "./edit.html");
const configFilePath = path.join(__dirname, "./config.html");
const iconPath = path.join(__dirname, "/assets/icon.ico");

//===============================================================================
// Application
//===============================================================================
if (process.platform === "darwin") {
    app.dock.hide();
}

function createWindow() {
    var show = true;
    var timerChild = null;

    let win = null;
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
        app.quit();
    } else {
        app.on("second-instance", (event, argv, cwd) => {
            if (win) {
                if (win.isMinimized()) {
                    win.show();
                    win.focus();
                }
            }
        });

        app.whenReady().then(() => {
            win = new BrowserWindow({
                width: 800,
                minWidth: 350,
                height: 600,
                minHeight: 216,
                frame: false,
                transparent: true,
                maximizable: false,
                fullscreenable: false,
                icon: iconPath,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    enableRemoteModule: true,
                },
            });

            win.setAlwaysOnTop(true, "screen-saver", 2);
            win.isAlwaysOnTop(true);
            win.setVisibleOnAllWorkspaces(true);

            win.loadFile(indexFilePath);
            globalShortcut.register("CmdOrCtrl+Q", () => app.quit());
            globalShortcut.register("CmdOrCtrl+W", () => {
                if (show) {
                    show = false;
                    win.minimize();
                    BrowserWindow.getAllWindows().forEach((browser) => {
                        if (browser.id != win.id) {
                            browser.minimize();
                        }
                    });
                } else {
                    show = true;
                    win.restore();
                    BrowserWindow.getAllWindows().forEach((browser) => {
                        if (browser.id != win.id) {
                            browser.restore();
                        }
                    });
                }
            });
            globalShortcut.register("CmdOrCtrl+E", () => {
                win.webContents.send("main->index:SwapType");
            });

            // Development Tools
            // win.webContents.openDevTools();

            win.on("restore", () => {
                if (!show) {
                    win.minimize();
                }
            });

            /* IPC Events */
            ipcMain.on("index->main:CharWindow", function (event) {
                let child = new BrowserWindow({
                    width: win.getSize()[0],
                    height: win.getSize()[1],
                    frame: false,
                    transparent: true,
                    alwaysOnTop: true,
                    resizable: false,
                    minimizable: false,
                    maximizable: false,
                    fullscreenable: false,
                    modal: true,
                    show: false,
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false,
                        enableRemoteModule: true,
                    },
                });

                win.setAlwaysOnTop(true, "screen-saver", 2);
                win.isAlwaysOnTop(true);
                win.setVisibleOnAllWorkspaces(true);

                child.setAlwaysOnTop(true, "screen-saver", 2);
                child.isAlwaysOnTop(true);
                child.setVisibleOnAllWorkspaces(true);
                child.setSkipTaskbar(true);

                child.loadFile(characterFilePath);

                /* Center the Browser to the Parent */
                const mainWinPosition = win.getPosition();
                const mainWinSize = win.getSize();
                const childWinSize = child.getSize();
                child.setPosition(
                    Math.floor(mainWinPosition[0] + mainWinSize[0] / 2 - childWinSize[0] / 2),
                    Math.floor(mainWinPosition[1] + mainWinSize[1] / 2 - childWinSize[1] / 2)
                );

                /* Focus Child Window */
                child.on("blur", () => {
                    if (show) {
                        child.focus();
                    }
                });

                child.once("ready-to-show", () => {
                    child.show();
                });
            });

            ipcMain.on("character->main:CharName", function (event, arg) {
                win.webContents.send("main->index:CharName", arg);

                win.setAlwaysOnTop(true, "screen-saver", 2);
                win.isAlwaysOnTop(true);
                win.setVisibleOnAllWorkspaces(true);
            });

            ipcMain.on("index->main:EditWindow", (event, payload) => {
                let childEdit = new BrowserWindow({
                    width: win.getSize()[0],
                    height: win.getSize()[1],
                    frame: false,
                    transparent: true,
                    alwaysOnTop: true,
                    resizable: false,
                    minimizable: false,
                    maximizable: false,
                    fullscreenable: false,
                    modal: true,
                    show: false,
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false,
                        enableRemoteModule: true,
                    },
                });

                win.setAlwaysOnTop(true, "screen-saver", 2);
                win.isAlwaysOnTop(true);
                win.setVisibleOnAllWorkspaces(true);

                childEdit.setAlwaysOnTop(true, "screen-saver", 2);
                childEdit.isAlwaysOnTop(true);
                childEdit.setVisibleOnAllWorkspaces(true);
                childEdit.setSkipTaskbar(true);

                childEdit.loadFile(editFilePath);

                // childEdit.webContents.openDevTools();

                const mainWinPosition = win.getPosition();
                const mainWinSize = win.getSize();
                const childWinSize = childEdit.getSize();
                childEdit.setPosition(
                    Math.floor(mainWinPosition[0] + mainWinSize[0] / 2 - childWinSize[0] / 2),
                    Math.floor(mainWinPosition[1] + mainWinSize[1] / 2 - childWinSize[1] / 2)
                );

                /* Focus Child Window */
                childEdit.on("blur", () => {
                    if (show) {
                        childEdit.focus();
                    }
                });

                childEdit.once("ready-to-show", () => {
                    childEdit.webContents.send("main->edit:EditWindow", payload);
                    childEdit.show();
                });
            });

            ipcMain.on("edit->main:EditSubmit", (event, payload) => {
                win.webContents.send("main->edit:EditSubmit", payload);

                win.setAlwaysOnTop(true, "screen-saver", 2);
                win.isAlwaysOnTop(true);
                win.setVisibleOnAllWorkspaces(true);
            });

            ipcMain.on("index->main:ConfigWindow", (event, payload) => {
                let childConfig = new BrowserWindow({
                    width: win.getSize()[0],
                    height: win.getSize()[1],
                    frame: false,
                    transparent: true,
                    alwaysOnTop: true,
                    resizable: false,
                    minimizable: false,
                    maximizable: false,
                    fullscreenable: false,
                    modal: true,
                    show: false,
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false,
                        enableRemoteModule: true,
                    },
                });

                win.setAlwaysOnTop(true, "screen-saver", 2);
                win.isAlwaysOnTop(true);
                win.setVisibleOnAllWorkspaces(true);

                childConfig.setAlwaysOnTop(true, "screen-saver", 2);
                childConfig.isAlwaysOnTop(true);
                childConfig.setVisibleOnAllWorkspaces(true);

                childConfig.loadFile(configFilePath);

                const mainWinPosition = win.getPosition();
                const mainWinSize = win.getSize();
                const childWinSize = childConfig.getSize();
                childConfig.setPosition(
                    Math.floor(mainWinPosition[0] + mainWinSize[0] / 2 - childWinSize[0] / 2),
                    Math.floor(mainWinPosition[1] + mainWinSize[1] / 2 - childWinSize[1] / 2)
                );

                childConfig.once("ready-to-show", () => {
                    childConfig.webContents.send("main->config:ConfigWindow", payload);
                    childConfig.show();
                });
            });

            ipcMain.on("config->main:ConfigSubmit", (event, payload) => {
                win.webContents.send("main->index:ConfigSubmit", payload);

                win.setAlwaysOnTop(true, "screen-saver", 2);
                win.isAlwaysOnTop(true);
                win.setVisibleOnAllWorkspaces(true);
            });

            ipcMain.on("index->main:TimerWindow", (event) => {
                if (!timerChild) {
                    timerChild = new BrowserWindow({
                        width: win.getSize()[0],
                        minWidth: 350,
                        height: win.getSize()[1],
                        minHeight: 216,
                        icon: iconPath,
                        frame: false,
                        transparent: true,
                        minimizable: false,
                        maximizable: false,
                        alwaysOnTop: true,
                        fullscreenable: false,
                        show: false,
                        webPreferences: {
                            nodeIntegration: true,
                            contextIsolation: false,
                            enableRemoteModule: true,
                        },
                    });

                    timerChild.loadFile(timerFilePath);

                    timerChild.setAlwaysOnTop(true, "screen-saver", 2);
                    timerChild.isAlwaysOnTop(true);
                    timerChild.setVisibleOnAllWorkspaces(true);

                    /* Center the Browser to the Parent */
                    const mainWinPosition = win.getPosition();
                    const mainWinSize = win.getSize();
                    const childWinSize = timerChild.getSize();
                    timerChild.setPosition(
                        Math.floor(mainWinPosition[0] + mainWinSize[0] / 2 - childWinSize[0] / 2),
                        Math.floor(mainWinPosition[1] + mainWinSize[1] / 2 - childWinSize[1] / 2)
                    );

                    timerChild.once("ready-to-show", () => {
                        timerChild.show();
                    });

                    ipcMain.on("timer->main:TimerMinimize", function (event) {
                        timerChild.minimize();
                    });

                    timerChild.on("close", () => {
                        timerChild = null;
                    });
                } else {
                    timerChild.restore();
                    timerChild.focus();
                }
            });
        });
    }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
