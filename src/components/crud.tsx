"use client";

import { useState, useEffect } from "react";
import GoodsTable from "./table";
import { EditModal, GitIntroModal } from "./modal";

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

const initData: GoodsItem = {
  id: "",
  productName: "",
  leader: "",
  status: "未出荷",
  shippingDate: "",
  details: [
    {
      name: "",
      quantity: 1,
      price: 0,
    },
  ],
  paidAmount: 0,
  totalAmount: 0,
};

export default function GoodsReminder() {
  const [items, setItems] = useState<GoodsItem[]>([]);
  const [name, setName] = useState("");
  const [leader, setLeader] = useState("");
  const [status, setStatus] = useState("");
  const [shippingDate, setShippingDate] = useState("");
  const [details, setDetails] = useState<SubItem[]>([
    { name: "", quantity: 1, price: 0 },
  ]);
  const [paidAmount, setPaidAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  //   const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GoodsItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [isGitOperationRunning, setIsGitOperationRunning] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 检查是否在Electron环境中
        if (typeof window !== "undefined" && (window as any).electronAPI) {
          const data = await (window as any).electronAPI.readGoodsData();
          setItems(data);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error("加载数据失败:", error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 重置表单
  const resetForm = () => {
    setName("");
    setLeader("");
    setStatus("");
    setShippingDate("");
    setDetails([{ name: "", quantity: 1, price: 0 }]);
    setPaidAmount("");
  };

  // 编辑项目
  const handleEdit = (item: GoodsItem) => {
    setName(item.productName);
    setLeader(item.leader);
    setStatus(item.status);
    setShippingDate(item.shippingDate);
    setDetails(item.details);
    setPaidAmount(item.paidAmount.toString());
    setEditingId(item.id);
    openEditModal(item);
  };

  // 删除项目
  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这个项目吗？")) {
      try {
        const updatedItems = items.filter((item) => item.id !== id);

        // 保存到Electron
        if (typeof window !== "undefined" && (window as any).electronAPI) {
          const result = await (window as any).electronAPI.saveGoodsData(
            updatedItems
          );
          if (result.success) {
            setItems(updatedItems);
          } else {
            console.error("删除失败:", result.error);
            alert("删除失败: " + result.error);
          }
        } else {
          // 开发环境下直接更新状态
          setItems(updatedItems);
        }
      } catch (error) {
        console.error("删除出错:", error);
        alert("删除过程中发生错误");
      }
    }
  };

  // 添加新项目
  const handleAdd = () => {
    // setEditingId(null);
    // resetForm();
    openEditModal(initData);
  };
  // 打开详情
  const openEditModal = (item: GoodsItem | null) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  // 关闭详情
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  // 打开Git同步帮助
  const openGitModal = () => {
    setIsGitModalOpen(true);
  };
  // 保存编辑
  const handleSaveEdit = async (updatedItem: GoodsItem) => {
    try {
      let updatedItems: GoodsItem[] = [];

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

      // 保存到Electron
      if (typeof window !== "undefined" && (window as any).electronAPI) {
        const result = await (window as any).electronAPI.saveGoodsData(
          updatedItems
        );
        if (result.success) {
          setItems(updatedItems);
        } else {
          console.error("保存失败:", result.error);
          alert("保存失败: " + result.error);
        }
      } else {
        // 开发环境下直接更新状态
        setItems(updatedItems);
      }

      closeEditModal();
    } catch (error) {
      console.error("保存出错:", error);
      alert("保存过程中发生错误");
    }

    closeEditModal();
  };

  const handlePull = async () => {
    if (typeof window !== "undefined" && (window as any).electronAPI) {
      if (isGitOperationRunning) return;
      setIsGitOperationRunning(true);
      try {
        const result = await (window as any).electronAPI.gitPull();
        if (result.success) {
          alert("数据已成功从远程仓库拉取");
          // 重新加载数据以显示最新内容
          const data = await (window as any).electronAPI.readGoodsData();
          setItems(data);
        } else {
          alert("拉取失败: " + result.error);
        }
      } catch (error) {
        console.error("拉取出错:", error);
        alert(
          "拉取过程中发生错误: " +
            (error instanceof Error ? error.message : "未知错误")
        );
      } finally {
        setIsGitOperationRunning(false);
      }
    }
  };

  const handlePush = async () => {
    if (typeof window !== "undefined" && (window as any).electronAPI) {
      if (isGitOperationRunning) return;
      setIsGitOperationRunning(true);
      try {
        const result = await (window as any).electronAPI.gitCommitPush(
          "Update goods data from Goods Reminder"
        );
        if (result.success) {
          alert("数据已成功推送到远程仓库");
        } else {
          alert("推送失败: " + result.error);
        }
      } catch (error) {
        console.error("推送出错:", error);
        alert(
          "推送过程中发生错误: " +
            (error instanceof Error ? error.message : "未知错误")
        );
      } finally {
        setIsGitOperationRunning(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-5/6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">加载数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-5/6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">周边预订管理</h2>
        <div className="flex gap-x-4">
          <button
            title="help"
            onClick={openGitModal}
            className="bg-gray-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            onClick={handlePull}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isGitOperationRunning ? (
              "请稍候..."
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                    clipRule="evenodd"
                  />
                </svg>
                从Git拉取
              </>
            )}
          </button>
          <button
            onClick={handlePush}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {isGitOperationRunning ? (
              "请稍候..."
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style={{ transform: "rotate(180deg)" }}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                    clipRule="evenodd"
                  />
                </svg>
                推送到Git
              </>
            )}
          </button>
        </div>
      </div>

      <GoodsTable
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
      <EditModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        item={selectedItem}
        onSave={handleSaveEdit}
      />
      <GitIntroModal
        isOpen={isGitModalOpen}
        onClose={() => setIsGitModalOpen(false)}
      />
    </div>
  );
}
