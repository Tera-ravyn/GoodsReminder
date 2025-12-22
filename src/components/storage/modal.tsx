// src/components/storage/storage-modal.tsx
import { useEffect, useState } from "react";

interface BundledItem {
  id: string;
  name: string;
  quantity: number;
  status: "自留" | "待售" | "在架" | "售出";
}

interface StorageItem {
  id: string;
  ip: string;
  status: "自留" | "待售" | "在架" | "售出";
  productName: string; //商品名称
  category: string; //商品类别
  character: string; //相关角色
  purchasePrice: number; //买入价格
  sellingPrice: number; //售出价格
  quantity: number; //商品数量
  soldQuantity: number; //卖出数量
  remark: string;
  // 捆绑商品相关字段
  bundledItems?: BundledItem[];
  masterItem?: { id: string; name: string };
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: StorageItem | null;
  onSave: (updatedItem: StorageItem) => void;
}

const statuses = ["自留", "待售", "在架", "售出"];

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg"
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
              <p className="text-sm text-gray-500">IP</p>
              <p className="font-medium">{item.ip}</p>
            </div>
            <div></div>
            <div>
              <p className="text-sm text-gray-500">商品名称</p>
              <p className="font-medium">{item.productName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">商品类别</p>
              <p className="font-medium">{item.category || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">相关角色</p>
              <p className="font-medium">{item.character || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">状态</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {item.status}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500">商品数量</p>
              <p className="font-medium">{item.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">售出数量</p>
              <p className="font-medium">{item.soldQuantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">买入价</p>
              <p className="font-medium text-green-600">
                ¥{item.purchasePrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">卖出价</p>
              <p className="font-medium text-green-600">
                ¥{item.sellingPrice.toFixed(2)}
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
                      序号
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      子物品名称
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      数量
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      买入价 (¥)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      售出价 (¥)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      是否已卖出
                    </th>
                  </tr>
                </thead>
                {/* <tbody className="bg-white divide-y divide-gray-200">
                  {item.details.map((detail, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {detail.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {detail.quantity}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {detail.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {detail.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {detail.status === "售出"
                          ? (detail.soldPrice || 0).toFixed(2)
                          : "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {detail.status === "售出" ? "是" : "否"}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-medium">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      总计
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900"></td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {item.details.reduce(
                        (sum, detail) => sum + detail.quantity,
                        0
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500"></td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900"></td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {sellingPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {soldCount}/{totalCount}
                    </td>
                  </tr>
                </tbody> */}
              </table>
            </div>
          </div>

          {/* 捆绑商品信息 */}
          {(item.bundledItems && item.bundledItems.length > 0) ||
          item.masterItem ? (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">
                捆绑商品信息
              </h4>

              {item.bundledItems && item.bundledItems.length > 0 ? (
                // 捆绑了其他商品
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-900">
                    捆绑的商品列表
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          商品名
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          数量
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {item.bundledItems.map((bundledItem, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {bundledItem.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {bundledItem.quantity}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {bundledItem.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : item.masterItem ? (
                // 被其他商品捆绑
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-900">
                    主商品信息
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500">
                      该商品被以下商品捆绑:
                    </p>
                    <p className="font-medium">{item.masterItem.name}</p>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
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
  const [category, setCategory] = useState("");
  const [character, setCharacter] = useState("");
  const [status, setStatus] = useState("自留");
  const [purchasePrice, setpurchasePrice] = useState("");
  const [sellingPrice, setsellingPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [soldQuantity, setSoldQuantity] = useState("");
  const [remark, setRemark] = useState("");

  // 初始化表单数据
  useEffect(() => {
    if (item && isOpen) {
      setProductName(item.productName);
      setIp(item.ip);
      setCategory(item.category || "");
      setCharacter(item.character || "");
      setpurchasePrice(item.purchasePrice?.toString());
      setsellingPrice(item.sellingPrice?.toString());
      setQuantity(item.quantity?.toString());
      setRemark(item.remark || "");
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

  // 保存表单
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName || !ip || !purchasePrice) {
      alert("请填写所有必填字段");
      return;
    }

    if (!item) return;

    const updatedItem: StorageItem = {
      ...item,
      productName,
      ip,
      category,
      character,
      purchasePrice: parseFloat(purchasePrice),
      sellingPrice: parseFloat(sellingPrice) || 0,
      quantity: parseInt(quantity) || 0,
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
          <h3 className="text-lg font-medium text-gray-900">编辑库存</h3>
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
                  IP
                </label>
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入IP"
                />
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品名称
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
                  商品类别
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入商品类别"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  相关角色
                </label>
                <input
                  type="text"
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入相关角色"
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
                  {statuses.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品数量
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入商品数量"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  售出数量
                </label>
                <input
                  type="number"
                  value={soldQuantity}
                  onChange={(e) => setSoldQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入售出数量"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  买入金额 (¥) *
                </label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setpurchasePrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入买入金额"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  售出金额 (¥)
                </label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setsellingPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入售出金额"
                  min="0"
                  step="0.01"
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
              onClick={handleSave}
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
