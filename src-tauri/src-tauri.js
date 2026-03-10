import { invoke } from "@tauri-apps/api/core";
// import { open } from "@tauri-apps/plugin-dialog";
// import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

// 获取数据目录
export const getDataDir = async () => {
  try {
    console.log("[JS] 开始调用 get_data_dir");
    const dataDir = await invoke("get_data_dir");
    console.log("[JS] get_data_dir 返回:", dataDir);
    return { success: true, data: dataDir };
  } catch (error) {
    console.error("[JS] 获取数据目录失败:", error);
    return { success: false, error: error.toString() };
  }
};

// 读取商品数据
export const readGoodsData = async () => {
  try {
    const { data: dataDir } = await getDataDir();
    if (!dataDir) {
      throw new Error("无法获取数据目录");
    }

    const data = await invoke("read_goods_data", { dataDir });
    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    console.error("读取数据失败:", error);
    return { success: false, error: error.toString() };
  }
};

// 保存商品数据
export const saveGoodsData = async (data) => {
  try {
    const { data: dataDir } = await getDataDir();
    if (!dataDir) {
      throw new Error("无法获取数据目录");
    }

    await invoke("save_goods_data", {
      dataDir,
      data: JSON.stringify(data, null, 2),
    });
    return { success: true };
  } catch (error) {
    console.error("保存数据失败:", error);
    return { success: false, error: error.toString() };
  }
};
// 读取商品数据
export const readStorageData = async () => {
  try {
    const { data: dataDir } = await getDataDir();
    if (!dataDir) {
      throw new Error("无法获取数据目录");
    }

    const data = await invoke("read_storage_data", { dataDir });
    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    console.error("读取数据失败:", error);
    return { success: false, error: error.toString() };
  }
};

// 保存商品数据
export const saveStorageData = async (data) => {
  try {
    const { data: dataDir } = await getDataDir();
    if (!dataDir) {
      throw new Error("无法获取数据目录");
    }

    await invoke("save_storage_data", {
      dataDir,
      data: JSON.stringify(data, null, 2),
    });
    return { success: true };
  } catch (error) {
    console.error("保存数据失败:", error);
    return { success: false, error: error.toString() };
  }
};

// 打开本地文件
export const openLocalFile = async () => {
  try {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: "JSON",
          extensions: ["json"],
        },
      ],
    });

    if (selected) {
      const data = await readTextFile(selected);
      return { success: true, data: JSON.parse(data) };
    }
    return { success: false, error: "未选择文件" };
  } catch (error) {
    console.error("打开文件失败:", error);
    return { success: false, error: error.toString() };
  }
};

// 初始化 Git 仓库
export const gitInit = async (repoUrl) => {
  try {
    const { data: dataDir } = await getDataDir();
    if (!dataDir) {
      throw new Error("无法获取数据目录");
    }

    const result = await invoke("init_git_repo", { repoUrl, dataDir });
    return { success: true, data: result };
  } catch (error) {
    console.error("初始化 Git 仓库失败:", error);
    return { success: false, error: error.toString() };
  }
};

// Git 提交并推送
export const gitCommitPush = async (commitMessage) => {
  try {
    const { data: dataDir } = await getDataDir();
    if (!dataDir) {
      throw new Error("无法获取数据目录");
    }

    const result = await invoke("git_add_commit_push", {
      dataDir,
      commitMessage,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Git 提交推送失败:", error);
    return { success: false, error: error.toString() };
  }
};

// Git 拉取
export const gitPull = async () => {
  try {
    const { data: dataDir } = await getDataDir();
    if (!dataDir) {
      throw new Error("无法获取数据目录");
    }

    const result = await invoke("git_pull", { dataDir });
    return { success: true, data: result };
  } catch (error) {
    console.error("Git 拉取失败:", error);
    return { success: false, error: error.toString() };
  }
};

// 获取 Git 远程 URL
export const gitGetRemoteUrl = async () => {
  try {
    const { data: dataDir } = await getDataDir();
    if (!dataDir) {
      throw new Error("无法获取数据目录");
    }

    const remoteUrl = await invoke("get_git_remote_url", { dataDir });
    return { success: true, data: remoteUrl };
  } catch (error) {
    console.error("获取 Git 远程 URL 失败:", error);
    return { success: false, error: error.toString() };
  }
};

export const readConfig = async () => {
  try {
    const { data: dataDir } = await getDataDir();
    if (!dataDir) {
      throw new Error("无法获取数据目录");
    }

    const config = await invoke("read_config", { dataDir });
    return { success: true, data: JSON.parse(config) };
  } catch (error) {
    console.error("读取配置失败:", error);
    return { success: false, error: error.toString() };
  }
};

export const saveConfig = async (config) => {
  try {
    const { data: dataDir } = await getDataDir();
    if (!dataDir) {
      throw new Error("无法获取数据目录");
    }

    await invoke("save_config", {
      dataDir,
      config: JSON.stringify(config, null, 2),
    });
    return { success: true };
  } catch (error) {
    console.error("保存配置失败:", error);
    return { success: false, error: error.toString() };
  }
};
