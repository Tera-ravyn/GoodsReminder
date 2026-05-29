export interface TableProps {
  items: StockItem[];
  onEdit: (item: StockItem) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export interface BundledItem {
  id: string;
  name: string;
  quantity: number;
  status: "自留" | "待售" | "在架" | "售出";
}

export interface StockItem {
  id: string;
  ip: string;
  status: "自留" | "待售" | "在架" | "售出";
  productName: string; //商品名称
  category: string[]; //商品类别
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
