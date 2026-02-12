export interface TableProps {
  items: GoodsItem[];
  onEdit: (item: GoodsItem) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export interface SubItem {
  name: string;
  quantity: number;
  price: number;
}

export interface GoodsItem {
  id: string;
  productName: string;
  leader: string;
  status: string;
  shippingDate: string;
  details: SubItem[];
  paidAmount: number;
  totalAmount: number;
  ip: string;
}
