export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO string YYYY-MM-DD
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  TRANSACTIONS = 'transactions'
}