export interface Stock {
  id?: number;
  batch_id: string;
  description: string;
  hsn_sac?: string;
  quantity: number;
  rate_per_pcs: number;
  created_at?: string;
  updated_at?: string;
}

export interface BillItem {
  stock_id: number;
  batch_id: string;
  description: string;
  hsn_sac?: string;
  quantity: number;
  rate_per_pcs: number;
  discount: number;
  amount: number;
}

export interface Bill {
  id?: number;
  bill_number: string;
  customer_name?: string;
  customer_phone?: string;
  total_amount: number;
  discount: number;
  final_amount: number;
  qr_code?: string;
  created_at?: string;
  items?: BillItem[];
}

export interface Ledger {
  id?: number;
  bill_id: number;
  transaction_type: string;
  amount: number;
  description?: string;
  created_at?: string;
}

export interface SalesStats {
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  dailySales: Array<{ date: string; amount: number }>;
}
