import React from 'react';
import { Bell, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

interface HeaderProps {
  onLoginClick: () => void;
  onDepositClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick, onDepositClick }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { balance } = useWallet();

  return (
    <header className="header">
      <div className="brand">
        <span className="brand-mark"><Sparkles size={19} /></span>
        <span>ORBIT<span className="brand-accent">PLAY</span></span>
      </div>
      <div className="header-actions">
        <button className="icon-button"><Bell size={19} /></button>
        <button className="icon-button"><Search size={20} /></button>
        
        {isAuthenticated ? (
          <div className="user-menu" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="wallet-balance" onClick={onDepositClick} style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '20px' }}>
              <span style={{ color: '#f5b83d', fontWeight: 'bold' }}>
                {balance ? `$${Number(balance.balance).toFixed(2)}` : 'Loading...'}
              </span>
            </div>
            <button className="text-button" onClick={logout}>Log out</button>
          </div>
        ) : (
          <button className="login-button" onClick={onLoginClick}>Log in</button>
        )}
      </div>
    </header>
  );
};
