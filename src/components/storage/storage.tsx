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

export default function Storage() {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StorageItem[]>([]);
  const [ipFilter, setIpFilter] = useState<string>("");
  const [ips, setIps] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<StorageItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化数据
  const initData: StorageItem = {
    id: "",
    ip: "",
    status: "自留",
    productName: "",
    category: "",
    character: "",
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 1,
    soldQuantity: 0,
    remark: "",
  };

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

  // 编辑项目
  const handleEdit = (item: StorageItem) => {
    openEditModal(item);
  };

  // 添加新项目
  const handleAdd = () => {
    openEditModal(initData);
  };

  // 打开编辑
  const openEditModal = (item: StorageItem | null) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  // 关闭编辑
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  // 保存编辑
  const handleSaveEdit = async (updatedItem: StorageItem) => {
    try {
      let updatedItems: StorageItem[] = [];

      if (selectedItem && selectedItem?.id !== "") {
        // 更新现有项目
        updatedItems = items.map((item) =>
          item.id === selectedItem.id ? updatedItem : item
        );
      } else {
        // 新增项目
        const id = crypto.randomUUID();
        updatedItems = [...items, { ...updatedItem, id }];
      }

      const result = await saveStorageData(updatedItems);
      if (result.success) {
        setItems(updatedItems);
      } else {
        console.error("保存失败:", result.error);
        alert("保存失败: " + result.error);
      }

      closeEditModal();
    } catch (error) {
      console.error("保存出错:", error);
      alert("保存过程中发生错误");
    }

    closeEditModal();
  };

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

  // 打开详情模态框
  const openDetailModal = (item: StorageItem) => {
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
            {/* {ipFilter && (
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
            )} */}

            <div className="flex-shrink-0">
              <button
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                新增
              </button>
            </div>
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
                    IP
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
                    角色
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    数量
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    状态
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    买入价
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    售价
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    售出
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
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.character}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.soldQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ¥{item.purchasePrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ¥{item.sellingPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.soldQuantity}/{item.quantity}
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

      {/* 编辑模态框 */}
      {selectedItem && (
        <EditModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          item={selectedItem}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}
