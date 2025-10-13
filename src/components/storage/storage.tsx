// src/components/ip-management.tsx
"use client";

import { useState, useEffect } from "react";
import { DetailModal, EditModal } from "../storage/modal";
import { StatusTag } from "../statusTag";
import { CustomSelect } from "../select";
import { readStorageData, saveStorageData } from "../../../src-tauri/src-tauri";

interface SubItem {
  name: string;
  quantity: number;
  price: number;
  status: "自留" | "待售" | "在架" | "售出"; // 子商品状态
  soldPrice?: number; // 售出金额
}

interface GoodsItem {
  id: string;
  productName: string;
  ip: string;
  details: SubItem[];
  paidAmount: number;
  totalAmount: number;
  remark: string; // 备注字段
}

export default function Storage() {
  const [items, setItems] = useState<GoodsItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GoodsItem[]>([]);
  const [ipFilter, setIpFilter] = useState<string>("");
  const [ips, setIps] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<GoodsItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { success, data, error } = await readStorageData();
        if (success) setItems(data);
        else console.error("读取数据失败:", error);
      } catch (error) {
        console.error("加载数据失败:", error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 提取所有IP
  useEffect(() => {
    const allIps = Array.from(
      new Set(items.map((item) => item.ip).filter((ip) => ip))
    );
    setIps(allIps);
  }, [items]);

  // 应用IP筛选
  useEffect(() => {
    let result = [...items];

    if (ipFilter) {
      result = result.filter((item) => item.ip === ipFilter);
    }

    // 按商品名称排序
    result.sort((a, b) => a.productName.localeCompare(b.productName));

    setFilteredItems(result);
  }, [items, ipFilter]);

  // 计算统计数据
  const calculateStats = () => {
    if (!ipFilter) return { totalPaid: 0, totalSold: 0, netConsumption: 0 };

    const ipItems = items.filter((item) => item.ip === ipFilter);

    // 总购入金额（已付款金额）
    const totalPaid = ipItems.reduce((sum, item) => sum + item.paidAmount, 0);

    // 总售出金额（所有售出状态子商品的售出金额）
    const totalSold = ipItems.reduce((sum, item) => {
      return (
        sum +
        item.details
          .filter((detail) => detail.status === "售出")
          .reduce((detailSum, detail) => detailSum + (detail.soldPrice || 0), 0)
      );
    }, 0);

    // 净消费金额 = 总购入 - 总售出
    const netConsumption = totalPaid - totalSold;

    return { totalPaid, totalSold, netConsumption };
  };

  const { totalPaid, totalSold, netConsumption } = calculateStats();

  // 打开详情模态框
  const openDetailModal = (item: GoodsItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  // 关闭详情模态框
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
  };

  // 删除项目
  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这个项目吗？")) {
      try {
        const updatedItems = items.filter((item) => item.id !== id);
        setItems(updatedItems);

        // 保存到本地
        const result = await saveStorageData(updatedItems);
        if (!result.success) {
          console.error("删除失败:", result.error);
          alert("删除失败: " + result.error);
        }
      } catch (error) {
        console.error("删除出错:", error);
        alert("删除过程中发生错误");
      }
    }
  };

  // 更新子商品状态
  const updateSubItemStatus = async (
    itemId: string,
    subItemIndex: number,
    newStatus: "自留" | "待售" | "在架" | "售出"
  ) => {
    try {
      const updatedItems = items.map((item) => {
        if (item.id === itemId) {
          const updatedDetails = [...item.details];
          updatedDetails[subItemIndex] = {
            ...updatedDetails[subItemIndex],
            status: newStatus,
          };
          return { ...item, details: updatedDetails };
        }
        return item;
      });

      setItems(updatedItems);

      // 保存到本地
      const result = await saveStorageData(updatedItems);
      if (!result.success) {
        console.error("更新失败:", result.error);
        alert("更新失败: " + result.error);
      }
    } catch (error) {
      console.error("更新出错:", error);
      alert("更新过程中发生错误");
    }
  };

  // 更新子商品售出金额
  const updateSubItemSoldPrice = async (
    itemId: string,
    subItemIndex: number,
    soldPrice: number
  ) => {
    try {
      const updatedItems = items.map((item) => {
        if (item.id === itemId) {
          const updatedDetails = [...item.details];
          updatedDetails[subItemIndex] = {
            ...updatedDetails[subItemIndex],
            soldPrice: soldPrice,
          };
          return { ...item, details: updatedDetails };
        }
        return item;
      });

      setItems(updatedItems);

      // 保存到本地
      const result = await saveStorageData(updatedItems);
      if (!result.success) {
        console.error("更新失败:", result.error);
        alert("更新失败: " + result.error);
      }
    } catch (error) {
      console.error("更新出错:", error);
      alert("更新过程中发生错误");
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* 筛选和统计栏 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label
                  htmlFor="ip-filter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  按IP筛选
                </label>
                <CustomSelect
                  value={ipFilter}
                  onChange={setIpFilter}
                  options={[
                    ...ips.map((ip) => ({
                      value: ip,
                      label: ip,
                    })),
                  ]}
                  placeholder="选择IP"
                />
              </div>

              {ipFilter && (
                <div className="flex items-end">
                  <button
                    onClick={() => setIpFilter("")}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    清除筛选
                  </button>
                </div>
              )}
            </div>

            {/* 统计信息 */}
            {ipFilter && (
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">总购入金额</p>
                  <p className="text-lg font-semibold text-blue-600">
                    ¥{totalPaid.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">售出金额</p>
                  <p className="text-lg font-semibold text-green-600">
                    ¥{totalSold.toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">净消费金额</p>
                  <p
                    className={`text-lg font-semibold ${
                      netConsumption >= 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    ¥{netConsumption.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 表格 */}
        <div className="overflow-x-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {items.length === 0
                ? "暂无数据"
                : ipFilter
                ? "该IP下暂无数据"
                : "请选择IP进行查看"}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    序号
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    商品名
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    IP
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    回血金额
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    子商品详情
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item, index) => {
                  // 计算该商品的回血金额（售出子商品的售出金额总和）
                  const recoveryAmount = item.details
                    .filter((detail) => detail.status === "售出")
                    .reduce((sum, detail) => sum + (detail.soldPrice || 0), 0);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ¥{recoveryAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="space-y-1">
                          {item.details.map((detail, detailIndex) => (
                            <div
                              key={detailIndex}
                              className="flex items-center gap-2"
                            >
                              <span className="font-medium">{detail.name}</span>
                              <span className="text-gray-400">
                                x{detail.quantity}
                              </span>
                              <span>¥{detail.price.toFixed(2)}</span>
                              <select
                                value={detail.status}
                                onChange={(e) =>
                                  updateSubItemStatus(
                                    item.id,
                                    detailIndex,
                                    e.target.value as
                                      | "自留"
                                      | "待售"
                                      | "在架"
                                      | "售出"
                                  )
                                }
                                className="text-xs border rounded px-1 py-0.5"
                              >
                                <option value="自留">自留</option>
                                <option value="待售">待售</option>
                                <option value="在架">在架</option>
                                <option value="售出">售出</option>
                              </select>
                              {detail.status === "售出" && (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">售价:</span>
                                  <input
                                    type="number"
                                    value={detail.soldPrice || ""}
                                    onChange={(e) =>
                                      updateSubItemSoldPrice(
                                        item.id,
                                        detailIndex,
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-20 text-xs border rounded px-1 py-0.5"
                                    placeholder="售出金额"
                                    step="0.01"
                                    min="0"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openDetailModal(item)}
                          className="text-blue-500 hover:text-blue-600 mr-3"
                        >
                          详情
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 详情模态框 */}
      {selectedItem && (
        <DetailModal
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          item={selectedItem}
          onSave={() => {}}
        />
      )}
    </>
  );
}
