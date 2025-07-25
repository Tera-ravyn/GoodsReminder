// src/components/DetailModal.tsx
import { useEffect, useState } from "react";

interface SubItem {
  name: string;
  quantity: number;
  price: number;
}

interface GoodsItem {
  id: string;
  productName: string;
  leader: string;
  status: string;
  shippingDate: string;
  details: SubItem[];
  paidAmount: number;
  totalAmount: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GoodsItem | null;
  onSave: (updatedItem: GoodsItem) => void;
}

const goodsStatus = ["待出荷", "岛现", "国际中", "待发货", "已完成"];

export function DetailModal({ isOpen, onClose, item }: ModalProps) {
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
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // 处理模态框外部点击关闭
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !item) return null;

  const needAdditionalPayment = () => {
    return item.paidAmount < item.totalAmount;
  };

  const additionalPaymentAmount = item.totalAmount - item.paidAmount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      // onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 模态框头部 */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">商品详情</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 text-2xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        {/* 模态框内容 */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">商品名称</p>
              <p className="font-medium">{item.productName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">团长</p>
              <p className="font-medium">{item.leader}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">当前状态</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {item.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">出荷日期</p>
              <p className="font-medium">{item.shippingDate}</p>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-2">商品详情</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      子物品名称
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      数量
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      单价 (¥)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      总价 (¥)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {item.details.map((detail, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {detail.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {detail.quantity}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {detail.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {(detail.price * detail.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-medium">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      总计
                    </td>

                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {item.details.reduce(
                        (sum, detail) => sum + detail.quantity,
                        0
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900"></td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {item.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">已付款金额</p>
              <p className="font-medium text-green-600">
                ¥{item.paidAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">总金额</p>
              <p className="font-medium">¥{item.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">付款状态</p>
                {needAdditionalPayment() ? (
                  <p className="font-medium text-red-600">需要补款</p>
                ) : (
                  <p className="font-medium text-green-600">已全额付款</p>
                )}
              </div>
              {needAdditionalPayment() && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">需补款金额</p>
                  <p className="font-medium text-red-600">
                    ¥{additionalPaymentAmount.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 模态框底部 */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export function EditModal({ isOpen, onClose, item, onSave }: ModalProps) {
  const [productName, setProductName] = useState("");
  const [leader, setLeader] = useState("");
  const [status, setStatus] = useState("");
  const [shippingDate, setShippingDate] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [details, setDetails] = useState<SubItem[]>([
    { name: "", quantity: 1, price: 0 },
  ]);

  // 初始化表单数据
  useEffect(() => {
    if (item && isOpen) {
      setProductName(item.productName);
      setLeader(item.leader);
      setStatus(item.status);
      setShippingDate(item.shippingDate);
      setPaidAmount(item.paidAmount.toString());
      setDetails(
        item.details.length > 0
          ? [...item.details]
          : [{ name: "", quantity: 1, price: 0 }]
      );
    }
  }, [item, isOpen]);

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
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // 处理模态框外部点击关闭
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 处理子物品变化
  const handleDetailChange = (
    index: number,
    field: keyof SubItem,
    value: string | number
  ) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setDetails(newDetails);
  };

  // 添加新的子物品
  const addDetail = () => {
    setDetails([...details, { name: "", quantity: 1, price: 0 }]);
  };

  // 删除子物品
  const removeDetail = (index: number) => {
    if (details.length > 1) {
      const newDetails = details.filter((_, i) => i !== index);
      setDetails(newDetails);
    }
  };

  // 计算总金额
  const calculateTotalAmount = () => {
    return details.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  // 保存表单
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName || !leader || !status || !shippingDate || !paidAmount) {
      alert("请填写所有必填字段");
      return;
    }

    if (!item) return;

    const updatedItem: GoodsItem = {
      ...item,
      productName,
      leader,
      status,
      shippingDate,
      details: [...details],
      paidAmount: parseFloat(paidAmount),
      totalAmount: calculateTotalAmount(),
    };
    onSave(updatedItem);
  };

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      // onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 模态框头部 */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">编辑商品</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 text-2xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        {/* 模态框内容 */}
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品名称 *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入商品名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  团长 *
                </label>
                <input
                  type="text"
                  value={leader}
                  onChange={(e) => setLeader(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入团长"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  当前状态 *
                </label>
                <select
                  value={status}
                  title="status"
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {goodsStatus.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  出荷日期 *
                </label>
                <input
                  type="date"
                  title="出荷日期"
                  value={shippingDate}
                  onChange={(e) => setShippingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  已付款金额 (¥) *
                </label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入已付款金额"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  总金额 (¥)
                </label>
                <input
                  type="text"
                  value={Number(calculateTotalAmount()).toFixed(2)}
                  title="总金额"
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
            </div>

            {/* 子物品详情 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  商品详情 *
                </label>
                <button
                  type="button"
                  onClick={addDetail}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + 添加子物品
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-sm text-gray-400 mb-2">
                <div className="md:col-span-4">商品名称</div>
                <div className="md:col-span-2">数量</div>
                <div className="md:col-span-2">单价</div>
                <div className="md:col-span-2">总价</div>
              </div>

              <div className="space-y-2">
                {details.map((detail, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2"
                  >
                    <div className="md:col-span-4">
                      <input
                        type="text"
                        value={detail.name}
                        onChange={(e) =>
                          handleDetailChange(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="子物品名称"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="number"
                        value={detail.quantity}
                        onChange={(e) =>
                          handleDetailChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="数量"
                        min="1"
                      />
                    </div>
                    <div className="md:col-span-2 relative">
                      <input
                        type="number"
                        value={detail.price}
                        onChange={(e) =>
                          handleDetailChange(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="单价"
                        min="0"
                        step="0.01"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        ¥
                      </div>
                    </div>
                    <div className="md:col-span-2 relative">
                      <input
                        type="number"
                        readOnly
                        value={(detail.price * detail.quantity).toFixed(2)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                        placeholder="金额"
                        min="0"
                        step="0.01"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        ¥
                      </div>
                    </div>
                    <div className="md:col-span-2 flex items-center">
                      {details.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDetail(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 模态框底部 */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function GitIntroModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [repoUrl, setRepoUrl] = useState("");
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

      fetchRemoteUrl();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // 获取当前的远程仓库URL
  const fetchRemoteUrl = async () => {
    try {
      const result = await (window as any).electronAPI.gitGetRemoteUrl();
      if (result.success) {
        setRepoUrl(result.url);
        console.log("Remote URL:", result.url);
      }
    } catch (error) {
      console.log(
        "Failed to get remote URL:",
        error instanceof Error ? error.message : "未知错误"
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      alert("请输入仓库地址");
      return;
    }

    setIsProcessing(true);
    try {
      // 初始化 Git 仓库
      const initResult = await (window as any).electronAPI.gitInit(repoUrl);
      if (!initResult.success) {
        alert(`初始化失败: ${initResult.error}`);
        setIsProcessing(false);
        return;
      }

      alert("Git 配置已保存并初始化成功！");
      onClose();
    } catch (error) {
      alert(`操作失败: ${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestConnection = async () => {
    if (!repoUrl.trim()) {
      alert("请输入仓库地址");
      return;
    }

    setIsProcessing(true);
    try {
      // 初始化 Git 仓库
      const initResult = await (window as any).electronAPI.gitInit(repoUrl);
      if (!initResult.success) {
        alert(`连接测试失败: ${initResult.error}`);
        setIsProcessing(false);
        return;
      }

      // 尝试推送一次
      const commitResult = await (window as any).electronAPI.gitCommitPush(
        "Initial commit from Goods Reminder"
      );
      if (!commitResult.success) {
        alert(`推送测试失败: ${commitResult.error}`);
        setIsProcessing(false);
        return;
      }

      alert("连接测试成功！");
    } catch (error) {
      alert(
        `连接测试失败: ${error instanceof Error ? error.message : "未知错误"}`
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
          <h3 className="text-lg font-medium text-gray-900">
            Git同步功能介绍与配置
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 text-2xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        {/* 模态框内容 */}
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-6">
            {/* 功能介绍 */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">
                功能介绍
              </h4>
              <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
                <p className="mb-2">
                  Git同步功能允许您将本地数据备份到远程Git仓库，实现数据的云端存储和多设备同步。
                </p>
                <p className="mb-2">配置完成后，您可以：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>将数据变更推送到远程仓库</li>
                  <li>从远程仓库拉取最新数据</li>
                  <li>实现多设备间的数据同步</li>
                </ul>
                <p className="mt-2">
                  请确保您已创建了一个空的Git仓库（如GitHub、Gitee等），并获得仓库的HTTPS地址与权限。
                </p>
                <p className="mt-2">
                  推荐本机有Git并且习惯Git操作的用户使用，不使用Git的用户如果想备份本地数据，可以找到`C://Users/(用户名)/Appdata/Roaming/goods-reminders/goodsData.json`，单独给该文件制作备份。用这个文件覆盖其他设备上的同名文件，就可以实现数据的迁移。
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Git仓库地址 *
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如: https://github.com/username/repository.git"
              />
              <p className="mt-1 text-xs text-gray-500">
                请输入您的Git仓库地址
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={fetchRemoteUrl}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                读取已经配置的地址
              </button>
              {/* <button
                type="button"
                onClick={handleTestConnection}
                disabled={isProcessing}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                {isProcessing ? "测试中..." : "测试连接"}
              </button> */}
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isProcessing ? "保存中..." : "保存配置"}
              </button>
            </div>
          </div>

          {/* 模态框底部 */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              关闭
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
