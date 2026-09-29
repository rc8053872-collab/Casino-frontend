import { apiClient } from './client';

export interface WalletBalance {
  balance: number;
  lockedBalance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  description: string;
}

export const getBalance = (): Promise<WalletBalance> => {
  return apiClient.get('/wallet/balance');
};

export const getTransactions = (limit = 50, offset = 0): Promise<Transaction[]> => {
  return apiClient.get('/wallet/transactions', { params: { limit, offset } });
};

export const deposit = (amount: number): Promise<{ paymentUrl: string; transactionId: string }> => {
  return apiClient.post('/wallet/deposit', { amount });
};

export const withdraw = (amount: number, destinationAccount: string): Promise<any> => {
  return apiClient.post('/wallet/withdraw', { amount, destinationAccount });
};
