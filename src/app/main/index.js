// Native
const { join } = require("path");
const { format } = require("url");

// Packages
const { BrowserWindow, app, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const prepareNext = require("electron-next");

// Prepare the renderer once the app is ready
app.on("ready", async () => {
    await prepareNext("./renderer");

    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            preload: join(__dirname, "preload.js"),
        },
        autoHideMenuBar: true,
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: "#00000000",
            symbolColor: "#FFFFFF",
        },
        darkTheme: true,
        icon: join(process.cwd() + "/renderer/public/icon.jpg"),
    });

    const url = isDev
        ? "http://localhost:8000/library"
        : format({
              pathname: join(__dirname, "../renderer/out/index.html"),
              protocol: "file:",
              slashes: true,
          });

    mainWindow.loadURL(url);
});

// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on("message", (event, message) => {
    event.sender.send("message", message);
});
