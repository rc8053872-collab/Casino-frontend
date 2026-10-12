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
  referenceId?: string | null;
}

export interface PaymentSettings {
  configured: boolean;
  isDemo: boolean;
  demoSubmissionsEnabled: boolean;
  upiId: string | null;
  qrCodeUrl: string | null;
  withdrawFeePercent: number;
}

export const getBalance = (): Promise<WalletBalance> => {
  return apiClient.get('/wallet/balance');
};

export const getTransactions = (limit = 50, offset = 0): Promise<Transaction[]> => {
  return apiClient.get('/wallet/transactions', { params: { limit, offset } });
};

export const getPaymentSettings = (): Promise<PaymentSettings> => {
  return apiClient.get('/wallet/settings');
};

export const submitDeposit = (amount: number, utrNumber: string, proofDataUrl: string): Promise<{ message: string; transaction: Transaction }> => {
  return apiClient.post('/wallet/deposit', { amount, utrNumber, proofDataUrl });
};

export interface WithdrawalBankDetails {
  accountNumber: string;
  ifscCode: string;
  branchName: string;
}

export interface WithdrawalResponse {
  message: string;
  transaction: Transaction;
  originalAmount?: number;
  feePercent?: number;
  feeAmount?: number;
  finalAmount?: number;
}

export const submitWithdrawal = (
  amount: number,
  bankDetails: WithdrawalBankDetails
): Promise<WithdrawalResponse> => {
  return apiClient.post('/wallet/withdraw', { amount, ...bankDetails });
};
