const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  readGoodsData: () => ipcRenderer.invoke("read-goods-data"),
  saveGoodsData: (data) => ipcRenderer.invoke("save-goods-data", data),
  openLocalFile: () => ipcRenderer.invoke("open-local-file"),
  // syncToGitHub: () => ipcRenderer.invoke("sync-to-github"),
  gitInit: (repoUrl) => ipcRenderer.invoke("git-init", repoUrl),
  gitCommitPush: (commitMessage) =>
    ipcRenderer.invoke("git-commit-push", commitMessage),
  gitPull: () => ipcRenderer.invoke("git-pull"),
  getDataDir: () => ipcRenderer.invoke("get-data-dir"),
  gitGetRemoteUrl: () => ipcRenderer.invoke("git-get-remote-url"),
});
