const { app, BrowserWindow } = require("electron");
const { startServer } = require("./server");

let mainWindow = null;
let serverInstance = null;
let serverBootPromise = null;

async function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    minWidth: 1100,
    minHeight: 800,
    backgroundColor: "#07111d",
    title: "Running TEST",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  await mainWindow.loadURL(`http://127.0.0.1:${port}`);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

async function bootstrap() {
  if (serverBootPromise) {
    return serverBootPromise;
  }

  serverBootPromise = startServer(0).then(async (result) => {
    serverInstance = result.server;
    await createWindow(result.port);
    return result;
  });

  return serverBootPromise;
}

app.whenReady().then(() => {
  bootstrap().catch((error) => {
    console.error(error);
    app.quit();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (serverInstance) {
      serverInstance.close();
      serverInstance = null;
    }
    app.quit();
  }
});

app.on("before-quit", () => {
  if (serverInstance) {
    serverInstance.close();
    serverInstance = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    bootstrap().catch((error) => {
      console.error(error);
    });
  }
});
