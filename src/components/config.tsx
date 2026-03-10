import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { readConfig, saveConfig } from "../../src-tauri/src-tauri";
import { Toggle } from "./toggle";

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => Promise<void>;
  refreshConfig: () => Promise<void>;
  isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时读取配置
  useEffect(() => {
    refreshConfig();
  }, []);

  const refreshConfig = async () => {
    try {
      const result = await readConfig();
      if (result.success && result.data) {
        setConfig({ ...DEFAULT_CONFIG, ...result.data });
      }
    } catch (error) {
      console.error("读取配置失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    try {
      const result = await saveConfig(updatedConfig);
      if (result.success) {
        setConfig(updatedConfig);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("保存配置失败:", error);
      throw error;
    }
  };

  return (
    <ConfigContext.Provider
      value={{ config, updateConfig, refreshConfig, isLoading }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig 必须在 ConfigProvider 内使用");
  }
  return context;
}
export interface AppConfig {
  gitEnabled: boolean; //是否开启 git 操作
  showTotalAmount: boolean; //是否显示总额
  showRemainingAmount: boolean; //是否显示尾款
  showThreshold: boolean; //是否显示尾款阈值
  remainingAmountWarningThreshold: number; //尾款警告阈值
}

// 默认配置
const DEFAULT_CONFIG: AppConfig = {
  gitEnabled: false,
  showTotalAmount: true,
  showRemainingAmount: true,
  showThreshold: false,
  remainingAmountWarningThreshold: 0,
};
export function ConfigModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { config, updateConfig, refreshConfig } = useConfig();
  const [localConfig, setLocalConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isProcessing, setIsProcessing] = useState(false);

  // 处理ESC键关闭模态框
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // 防止背景滚动
      document.body.style.overflow = "hidden";

      readConfig();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // 获取当前配置
  const fetchConfig = async () => {
    try {
      const result = await readConfig();
      if (result.success && result.data) {
        // 合并默认配置，确保新字段有默认值
        setLocalConfig({ ...DEFAULT_CONFIG, ...result.data });
      }
    } catch (error) {
      console.log(
        "Failed to get config:",
        error instanceof Error ? error.message : "未知错误",
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessing(true);
    try {
      // 保存配置
      const saveResult = await saveConfig(localConfig);
      if (!saveResult.success) {
        alert(`保存失败: ${saveResult.error}`);
        setIsProcessing(false);
        return;
      }

      //   alert("Git 配置已保存并初始化成功！");
      onClose();
    } catch (error) {
      alert(
        `保存配置失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 模态框头部 */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">系统设置</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 text-2xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        {/* 模态框内容 */}
        <form onSubmit={handleSave}>
          <div className="space-y-4 p-8">
            <Toggle
              checked={localConfig.showTotalAmount}
              onChange={(checked) =>
                setLocalConfig({ ...localConfig, showTotalAmount: checked })
              }
              label="显示总额"
            />

            <Toggle
              checked={localConfig.showRemainingAmount}
              onChange={(checked) =>
                setLocalConfig({ ...localConfig, showRemainingAmount: checked })
              }
              label="显示尾款"
            />

            <Toggle
              checked={localConfig.showThreshold}
              onChange={(checked) =>
                setLocalConfig({ ...localConfig, showThreshold: checked })
              }
              label="显示尾款阈值"
            />

            {/* 尾款警告阈值 */}
            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-700 w-32">尾款警告阈值</label>
              <input
                type="number"
                value={localConfig.remainingAmountWarningThreshold}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    remainingAmountWarningThreshold: Number(e.target.value),
                  })
                }
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <span className="text-sm text-gray-500">元</span>
            </div>
          </div>
          {/* 模态框底部 */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                关闭
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isProcessing ? "保存中..." : "保存配置"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
