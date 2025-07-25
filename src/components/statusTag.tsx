// src/components/StatusTag.tsx
import React from "react";

interface StatusTagProps {
  status: string;
}

export const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  const statusClass =
    {
      待出荷: "bg-yellow-100 text-yellow-800",
      岛现: "bg-green-100 text-green-800",
      国际中: "bg-blue-100 text-blue-800",
      待发货: "bg-purple-100 text-purple-800",
      已完成: "bg-gray-100 text-gray-800",
    }[status] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}
    >
      {status}
    </span>
  );
};
