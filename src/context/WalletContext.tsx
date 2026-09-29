import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getBalance, WalletBalance } from '../api/wallet';

interface WalletContextType {
  balance: WalletBalance | null;
  loading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBalance();
      setBalance(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if authenticated (assuming token exists)
    if (localStorage.getItem('token')) {
      refreshBalance();
    } else {
      setLoading(false); // Skip loading if no token
    }
  }, []);

  return (
    <WalletContext.Provider value={{ balance, loading, error, refreshBalance }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
