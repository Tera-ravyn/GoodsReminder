// src/components/table.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DetailModal, EditModal } from "./modal";
import { StatusTag } from "../statusTag";
import { CustomSelect } from "../select";
import { GoodsItem, TableProps } from "./types";

export default function GoodsTable({
  items,
  onEdit,
  onDelete,
  onAdd,
}: TableProps) {
  const [filteredItems, setFilteredItems] = useState<GoodsItem[]>([]);
  const [leaderFilter, setLeaderFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [ipFilter, setIpFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [leaders, setLeaders] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [ips, setIps] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<GoodsItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 初始化筛选选项
  useEffect(() => {
    const allLeaders = Array.from(new Set(items.map((item) => item.leader)));
    const allStatuses = Array.from(new Set(items.map((item) => item.status)));
    const allIps = Array.from(
      new Set(items.map((item) => item.ip).filter((ip) => ip)),
    );

    setLeaders(allLeaders);
    setStatuses(allStatuses);
    setIps(allIps);
  }, [items]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setSearchTerm(newValue);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        setDebouncedSearchTerm(newValue);
      }, 600);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 应用筛选
  useEffect(() => {
    let result = [...items];

    if (debouncedSearchTerm) {
      result = result.filter((item) =>
        item.productName
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()),
      );
    }

    if (leaderFilter) {
      result = result.filter((item) => item.leader === leaderFilter);
    }

    if (statusFilter) {
      if (statusFilter === "未完成") {
        result = result.filter((item) => item.status !== "已完成");
      } else result = result.filter((item) => item.status === statusFilter);
    }

    if (ipFilter) {
      result = result.filter((item) => item.ip === ipFilter);
    }

    result.sort((a, b) => {
      return (
        new Date(a.shippingDate).getTime() - new Date(b.shippingDate).getTime()
      );
    });

    setFilteredItems(result);
  }, [items, leaderFilter, statusFilter, ipFilter, debouncedSearchTerm]);

  const needAdditionalPayment = (item: GoodsItem) => {
    const total = item.details.reduce((sum, subItem) => sum + subItem.price, 0);
    return item.paidAmount < total;
  };

  const resetFilters = () => {
    setLeaderFilter("");
    setStatusFilter("");
    setIpFilter("");
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  const openDetailModal = (item: GoodsItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* 筛选和操作栏 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-6">
              <div>
                <label
                  htmlFor="leader-filter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  按团长筛选
                </label>
                <CustomSelect
                  value={leaderFilter}
                  onChange={setLeaderFilter}
                  options={[
                    ...leaders.map((leader) => ({
                      value: leader,
                      label: leader,
                    })),
                  ]}
                  placeholder="所有团长"
                  searchable
                  className="w-48"
                />
              </div>

              <div>
                <label
                  htmlFor="status-filter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  按状态筛选
                </label>
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "未完成", label: "未完成" },
                    ...statuses.map((status) => ({
                      value: status,
                      label: status,
                    })),
                  ]}
                  placeholder="所有状态"
                />
              </div>
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
                  placeholder="所有IP"
                />
              </div>
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  搜索商品名
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
                  placeholder="输入商品名搜索"
                />
              </div>
              {(leaderFilter ||
                statusFilter ||
                ipFilter ||
                debouncedSearchTerm) && (
                <div className="self-end">
                  <button
                    onClick={resetFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    清除筛选
                  </button>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 flex items-center gap-4">
              <div>
                <div className="text-sm text-gray-500">
                  当前页面尾款：
                  {filteredItems
                    .reduce(
                      (sum, item) => sum + (item.totalAmount - item.paidAmount),
                      0,
                    )
                    .toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  总尾款：
                  {items
                    .reduce(
                      (sum, item) => sum + (item.totalAmount - item.paidAmount),
                      0,
                    )
                    .toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  当前页面金额：
                  {filteredItems
                    .reduce((sum, item) => sum + item.totalAmount, 0)
                    .toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  总金额：
                  {items
                    .reduce((sum, item) => sum + item.totalAmount, 0)
                    .toFixed(2)}
                </div>
              </div>
              <button
                onClick={onAdd}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 "
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
                ? "暂无数据，请添加新项目"
                : "没有匹配的筛选结果"}
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
                    团长
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    当前状态
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    出荷日期
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    总金额
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    是否需要补款
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
                {filteredItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div
                        className="text-blue-600 hover:text-blue-900 hover:underline cursor-pointer"
                        onClick={() => {
                          setLeaderFilter(item.leader);
                        }}
                      >
                        {item.leader}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <StatusTag status={item.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.shippingDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {needAdditionalPayment(item) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          需要补款
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          无需补款
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openDetailModal(item)}
                        className="text-blue-500 hover:text-blue-600 mr-3"
                      >
                        详情
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-500 hover:text-blue-600 mr-3"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 详情模态框 */}
      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        item={selectedItem}
        onSave={() => {}}
      />
    </>
  );
}
