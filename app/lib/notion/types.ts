export interface Transaction {
  id: string;
  name: string | null;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface CreateTransactionInput {
  name?: string;
  amount: number;
  category: string;
  date?: string; // YYYY-MM-DD, defaults to today
}

export interface TransactionFilter {
  year: number;
  month: number; // 1-12
}
