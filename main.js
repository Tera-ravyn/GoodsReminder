const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const {
  readGoodsData,
  saveGoodsData,
  openLocalFile,
  initGitRepo,
  gitAddCommitPush,
  gitPull,
  getDataDir,
  getGitRemoteUrl,
} = require("./goodsData");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  const startPath = isDev
    ? "http://localhost:3000"
    : path.join(__dirname, "out/index.html");

  if (isDev) {
    mainWindow.loadURL(startPath);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(startPath);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC 处理程序
ipcMain.handle("read-goods-data", async () => {
  try {
    const data = await readGoodsData();
    return data;
  } catch (error) {
    console.error("读取数据失败:", error);
    return [];
  }
});

ipcMain.handle("save-goods-data", async (event, data) => {
  return await saveGoodsData(data);
});

ipcMain.handle("open-local-file", async () => {
  return await openLocalFile();
});

// ipcMain.handle("sync-to-github", async () => {
//   const remoteUrl=await getGitRemoteUrl();
// });

// Git 相关 IPC 处理程序
ipcMain.handle("git-init", async (event, repoUrl) => {
  return await initGitRepo(repoUrl);
});

ipcMain.handle("git-commit-push", async (event, commitMessage) => {
  return await gitAddCommitPush(commitMessage);
});

ipcMain.handle("git-pull", async () => {
  return await gitPull();
});

ipcMain.handle("get-data-dir", async () => {
  return getDataDir();
});

ipcMain.handle("git-get-remote-url", async () => {
  return await getGitRemoteUrl();
});
