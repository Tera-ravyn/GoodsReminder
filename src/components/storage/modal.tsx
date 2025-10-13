// src/components/storage/storage-modal.tsx
import { useEffect, useState } from "react";

interface SubItem {
  name: string;
  quantity: number;
  price: number;
  status: "自留" | "待售" | "在架" | "售出";
  soldPrice?: number;
}

interface GoodsItem {
  id: string;
  productName: string;
  ip: string;
  details: SubItem[];
  paidAmount: number;
  totalAmount: number;
  remark: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GoodsItem | null;
  onSave: (updatedItem: GoodsItem) => void;
}

const subItemStatuses = ["自留", "待售", "在架", "售出"];

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

  if (!isOpen || !item) return null;

  // 计算回血金额
  const recoveryAmount = item.details
    .filter((detail) => detail.status === "售出")
    .reduce((sum, detail) => sum + (detail.soldPrice || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg"
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
              <p className="text-sm text-gray-500">IP地址</p>
              <p className="font-medium">{item.ip}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">已付款金额</p>
              <p className="font-medium text-green-600">
                ¥{item.paidAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">回血金额</p>
              <p className="font-medium text-green-600">
                ¥{recoveryAmount.toFixed(2)}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">备注</p>
              <p className="font-medium">{item.remark || "-"}</p>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-2">
              子商品详情
            </h4>
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
                      状态
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      售出金额 (¥)
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {detail.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {detail.status === "售出"
                          ? (detail.soldPrice || 0).toFixed(2)
                          : "-"}
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
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500"></td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {recoveryAmount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
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
  const [ip, setIp] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [details, setDetails] = useState<SubItem[]>([
    { name: "", quantity: 1, price: 0, status: "自留" },
  ]);

  // 初始化表单数据
  useEffect(() => {
    if (item && isOpen) {
      setProductName(item.productName);
      setIp(item.ip);
      setPaidAmount(item.paidAmount.toString());
      setRemark(item.remark || "");
      setDetails(
        item.details.length > 0
          ? [...item.details]
          : [{ name: "", quantity: 1, price: 0, status: "自留" }]
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
    setDetails([
      ...details,
      { name: "", quantity: 1, price: 0, status: "自留" },
    ]);
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

    if (!productName || !ip || !paidAmount) {
      alert("请填写所有必填字段");
      return;
    }

    if (!item) return;

    const updatedItem: GoodsItem = {
      ...item,
      productName,
      ip,
      details: [...details],
      paidAmount: parseFloat(paidAmount),
      totalAmount: calculateTotalAmount(),
      remark,
    };
    onSave(updatedItem);
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg"
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
                  IP地址 *
                </label>
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入IP地址"
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
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入备注信息"
                  rows={3}
                />
              </div>
            </div>

            {/* 子物品详情 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  子商品详情 *
                </label>
                <button
                  type="button"
                  onClick={addDetail}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + 添加子商品
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-sm text-gray-400 mb-2">
                <div className="md:col-span-3">商品名称</div>
                <div className="md:col-span-1">数量</div>
                <div className="md:col-span-2">单价</div>
                <div className="md:col-span-2">状态</div>
                <div className="md:col-span-2">售出金额</div>
              </div>

              <div className="space-y-2">
                {details.map((detail, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
                  >
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={detail.name}
                        onChange={(e) =>
                          handleDetailChange(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="子商品名称"
                      />
                    </div>
                    <div className="md:col-span-1">
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
                    <div className="md:col-span-2">
                      <select
                        value={detail.status}
                        onChange={(e) =>
                          handleDetailChange(
                            index,
                            "status",
                            e.target.value as "自留" | "待售" | "在架" | "售出"
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {subItemStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2 relative">
                      <input
                        type="number"
                        value={detail.soldPrice || ""}
                        onChange={(e) =>
                          handleDetailChange(
                            index,
                            "soldPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="售出金额"
                        min="0"
                        step="0.01"
                        disabled={detail.status !== "售出"}
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
