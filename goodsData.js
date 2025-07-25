const fs = require("fs").promises;
const path = require("path");
const { dialog, app } = require("electron");
const os = require("os");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const getDataFilePath = () => {
  // 使用 app.getPath('userData') 来获取用户数据目录
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "goodsData.json");
};

const getDataDir = () => {
  return path.dirname(getDataFilePath());
};

const readGoodsData = async () => {
  try {
    const filePath = getDataFilePath();
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // 如果文件不存在，创建新文件并返回空数组
    if (error.code === "ENOENT") {
      const emptyData = [];
      const filePath = getDataFilePath();
      await fs.writeFile(filePath, JSON.stringify(emptyData, null, 2));
      return emptyData;
    }
    throw error;
  }
};

const saveGoodsData = async (data) => {
  try {
    const filePath = getDataFilePath();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const openLocalFile = async () => {
  try {
    const result = await dialog.showOpenDialog({
      filters: [{ name: "JSON Files", extensions: ["json"] }],
      properties: ["openFile"],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const data = await fs.readFile(result.filePaths[0], "utf8");
      return { success: true, data: JSON.parse(data) };
    }
    return { success: false, error: "未选择文件" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getGitRemoteUrl = async () => {
  try {
    const dataDir = getDataDir();

    await fs.access(path.join(dataDir, ".git"));

    const remoteResult = await execPromise("git remote", { cwd: dataDir });
    const remotes = remoteResult.stdout.trim().split("\n");

    if (remotes.includes("origin")) {
      const remoteUrlResult = await execPromise("git remote get-url origin", {
        cwd: dataDir,
      });
      const remoteUrl = remoteUrlResult.stdout.trim();
      return { success: true, url: remoteUrl };
    } else {
      return { success: false, error: "No origin remote configured" };
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      return { success: false, error: "Git repository not initialized" };
    }
    return { success: false, error: error.message };
  }
};

const initGitRepo = async (repoUrl) => {
  try {
    const dataDir = getDataDir();
    console.log("[Git] Execution directory:", dataDir);

    // 检查是否已经存在 .git 目录
    try {
      await fs.access(path.join(dataDir, ".git"));
      console.log("[Git] Existing repository found");

      // 检查是否已经设置了远程仓库
      try {
        const remoteResult = await execPromise("git remote", { cwd: dataDir });
        const remotes = remoteResult.stdout.trim().split("\n");

        if (remotes.includes("origin")) {
          console.log("[Git] Remote repository already exists");
          // 检查远程URL是否匹配
          try {
            const remoteUrlResult = await execPromise(
              "git remote get-url origin",
              { cwd: dataDir }
            );
            const currentUrl = remoteUrlResult.stdout.trim();

            if (currentUrl === repoUrl) {
              console.log("[Git] Remote URL matches, pulling changes");
              await execPromise("git pull", { cwd: dataDir });
            } else {
              console.log("[Git] Remote URL mismatch, updating remote");
              await execPromise(`git remote set-url origin ${repoUrl}`, {
                cwd: dataDir,
              });
              await execPromise("git pull", { cwd: dataDir });
            }
          } catch (urlError) {
            console.log("[Git] Error getting remote URL, setting new one");
            await execPromise(`git remote set-url origin ${repoUrl}`, {
              cwd: dataDir,
            });
            await execPromise("git pull", { cwd: dataDir });
          }
        } else {
          // 没有origin远程仓库，添加它
          console.log("[Git] No origin remote found, adding it");
          await execPromise(`git remote add origin ${repoUrl}`, {
            cwd: dataDir,
          });
          await execPromise("git pull origin main", { cwd: dataDir }).catch(
            (error) => {
              console.log(
                "[Git] First pull may fail, which is normal:",
                error.message
              );
            }
          );
        }
      } catch (remoteError) {
        // 没有远程仓库，添加远程仓库
        console.log("[Git] No remote repository found, adding it");
        await execPromise(`git remote add origin ${repoUrl}`, { cwd: dataDir });
        await execPromise("git pull origin main", { cwd: dataDir }).catch(
          (error) => {
            console.log(
              "[Git] First pull may fail, which is normal:",
              error.message
            );
          }
        );
      }
    } catch {
      // 如果不存在 .git 目录，初始化仓库
      console.log("[Git] Initializing new repository");
      await execPromise("git init", { cwd: dataDir });
      await execPromise(`git remote add origin ${repoUrl}`, { cwd: dataDir });

      // 设置默认分支名（如果Git版本较新）
      try {
        await execPromise("git branch -M main", { cwd: dataDir });
      } catch {
        console.log(
          "[Git] Unable to set branch name to main, using default branch"
        );
      }

      // 首次pull可能失败，这是正常的
      await execPromise("git pull origin main", { cwd: dataDir }).catch(
        (error) => {
          console.log(
            "[Git] First pull failed, which is normal:",
            error.message
          );
        }
      );
    }

    return { success: true };
  } catch (error) {
    console.error("[Git] Initialization error:", error);
    return { success: false, error: error.message };
  }
};

const gitAddCommitPush = async (commitMessage) => {
  try {
    const dataDir = getDataDir();
    console.log("[Git] Execution directory:", dataDir);

    await execPromise("git add goodsData.json", { cwd: dataDir });
    console.log("[Git] Added goodsData.json to staging area");

    try {
      await execPromise("git diff --cached --quiet", { cwd: dataDir });
      console.log("[Git] No changes to commit");
      return { success: true, message: "No changes to commit" };
    } catch {
      console.log("[Git] Changes need to be committed");
    }

    await execPromise(`git commit -m "${commitMessage}"`, { cwd: dataDir });
    console.log("[Git] Committed changes:", commitMessage);

    await execPromise("git push origin main", { cwd: dataDir });
    console.log("[Git] Pushed to remote repository");

    return { success: true };
  } catch (error) {
    console.error("[Git] Commit/push error:", error);

    if (
      error.message.includes("Authentication") ||
      error.message.includes("authentication")
    ) {
      return { success: false, error: "认证失败，请检查您的Git凭据配置" };
    }
    return { success: false, error: error.message };
  }
};

const gitPull = async () => {
  try {
    const dataDir = getDataDir();
    await execPromise("git pull origin main", { cwd: dataDir });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  readGoodsData,
  saveGoodsData,
  openLocalFile,
  initGitRepo,
  gitAddCommitPush,
  gitPull,
  getDataDir,
  getGitRemoteUrl,
};
