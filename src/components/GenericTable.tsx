import { ReactNode } from "react";

export interface TableColumn<T> {
  title: string;
  dataIndex?: keyof T;
  key: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (record: T, index: number) => ReactNode;
}

export interface GenericTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: keyof T;
  emptyText?: string;
  loading?: boolean;
  onRowClick?: (record: T) => void;
}

export default function GenericTable<T>({
  columns,
  data,
  rowKey,
  emptyText = "暂无数据",
  loading = false,
  onRowClick,
}: GenericTableProps<T>) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2">加载中...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="text-center py-12 text-gray-500">{emptyText}</div>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={`px-6 py-3 text-${
                column.align || "left"
              } text-xs font-medium text-gray-500 uppercase tracking-wider ${
                column.width || ""
              }`}
            >
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((record, index) => (
          <tr
            key={String(record[rowKey])}
            className={`hover:bg-gray-50 ${onRowClick ? "cursor-pointer" : ""}`}
            onClick={() => onRowClick?.(record)}
          >
            {columns.map((column) => (
              <td
                key={column.key}
                className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                  column.align === "right" ? "text-right" : ""
                }`}
              >
                {column.render
                  ? column.render(record, index)
                  : column.dataIndex
                    ? String(record[column.dataIndex] ?? "")
                    : null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
