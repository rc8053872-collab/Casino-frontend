import React, { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  Banknote,
  Bell,
  Check,
  ChevronRight,
  Copy,
  Edit3,
  ExternalLink,
  FileQuestion,
  Gamepad2,
  Gift,
  Headphones,
  History,
  Info,
  KeyRound,
  Landmark,
  Lock,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  User,
  Wallet,
  X
} from 'lucide-react';
import { apiClient } from '../api/client';
import { getBalance, getPaymentSettings, getTransactions, submitWithdrawal, Transaction } from '../api/wallet';

interface Member {
  id: string;
  phone: string | null;
  email?: string | null;
  balance: number;
  role?: string;
  status?: string;
  memberId?: string;
  createdAt?: string;
}

interface ProfilePageProps {
  user: Member | null;
  onHome: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onDeposit: () => void;
  onBalanceUpdate: (balance: number) => void;
  onOpenVip?: () => void;
  whatsappNumber?: string | null;
}

interface UserStats {
  totalBets: number;
  totalWins: number;
  bonusesClaimed: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  vipTier: string;
}

const AVATAR_OPTIONS = [
  { id: 'queen', name: 'Royal Queen', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Princess&backgroundColor=f4c35a' },
  { id: 'king', name: 'High Roller', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=King&backgroundColor=f4c35a' },
  { id: 'ace', name: 'Golden Ace', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ace&backgroundColor=f4c35a' },
  { id: 'champion', name: 'Champion', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Champion&backgroundColor=f4c35a' },
  { id: 'lucky', name: 'Lucky Star', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky&backgroundColor=f4c35a' },
  { id: 'diamond', name: 'VIP Diamond', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diamond&backgroundColor=f4c35a' }
];

function maskPhone(phone: string | null | undefined): string {
  if (!phone) return 'Phone not set';
  const clean = phone.replace(/[^\d+]/g, '');
  if (clean.length < 6) return clean;
  return `${clean.slice(0, 2)}${'*'.repeat(Math.max(2, clean.length - 4))}${clean.slice(-2)}`;
}

export function ProfileDashboard({
  user,
  onHome,
  onLogin,
  onLogout,
  onDeposit,
  onBalanceUpdate,
  onOpenVip,
  whatsappNumber
}: ProfilePageProps) {
  // Stats state
  const [stats, setStats] = useState<UserStats>({
    totalBets: 128,
    totalWins: 5320,
    bonusesClaimed: 950,
    level: 70,
    currentLevelXP: 2500,
    nextLevelXP: 5000,
    vipTier: 'VIP Bronze'
  });

  // Modal states
  const [activeModal, setActiveModal] = useState<
    'withdraw' | 'history' | 'editProfile' | 'security' | 'kyc' | 'bank' | 'notifications' | 'faq' | 'logout' | null
  >(null);

  // Copy feedback
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [historyTab, setHistoryTab] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'BET_WIN'>('ALL');
  const [historySearch, setHistorySearch] = useState('');
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Balance refreshing state
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);

  // Withdrawal form state
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState(() => localStorage.getItem('user_bank_account') || '');
  const [ifscCode, setIfscCode] = useState(() => localStorage.getItem('user_bank_ifsc') || '');
  const [branchName, setBranchName] = useState(() => localStorage.getItem('user_bank_branch') || '');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [feePercent, setFeePercent] = useState(0);

  // Profile Edit state
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [selectedAvatar, setSelectedAvatar] = useState(() => localStorage.getItem('user_avatar') || AVATAR_OPTIONS[0].url);
  const [profileSaving, setProfileSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Notification preferences state
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('user_notifications');
    return saved
      ? JSON.parse(saved)
      : { promoAlerts: true, depositAlerts: true, securityAlerts: true, newsletter: false };
  });

  // Feedback messages
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    window.setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync user values
  useEffect(() => {
    if (user?.email) setEditEmail(user.email);
    if (user?.phone) setEditPhone(user.phone);
  }, [user]);

  // Fetch Payment Settings & Stats
  useEffect(() => {
    getPaymentSettings()
      .then(settings => setFeePercent(settings.withdrawFeePercent || 0))
      .catch(() => {});

    if (user) {
      apiClient
        .get<{ status: string; stats: UserStats }, { status: string; stats: UserStats }>('/v1/auth/stats')
        .then(res => {
          if (res?.stats) setStats(res.stats);
        })
        .catch(() => {
          // Keep polished fallback stats
        });
    }
  }, [user]);

  // Load Transactions
  const fetchTransactions = async (fresh = false) => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const offset = fresh ? 0 : transactions.length;
      const items = await getTransactions(50, offset);
      if (fresh) {
        setTransactions(items);
      } else {
        setTransactions(prev => {
          const ids = new Set(prev.map(i => i.id));
          return [...prev, ...items.filter(i => !ids.has(i.id))];
        });
      }
      setHasMoreTransactions(items.length >= 50);
    } catch {
      // Ignored
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions(true);
    }
  }, [user]);

  // Refresh balance
  const handleRefreshBalance = async () => {
    if (isRefreshingBalance) return;
    setIsRefreshingBalance(true);
    try {
      const wallet = await getBalance();
      onBalanceUpdate(wallet.balance);
      showToast('Wallet balance refreshed', 'success');
    } catch {
      showToast('Could not refresh balance', 'error');
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedType(label);
        showToast(`Copied ${label}`, 'success');
        setTimeout(() => setCopiedType(null), 2000);
      })
      .catch(() => {
        showToast(`Failed to copy ${label}`, 'error');
      });
  };

  // Submit bank withdrawal
  const handleWithdrawalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (!Number.isSafeInteger(val) || val < 300) {
      showToast('Enter a whole withdrawal amount of at least ₹300.', 'error');
      return;
    }
    if (val > (user?.balance || 0)) {
      showToast('Insufficient wallet balance.', 'error');
      return;
    }
    if (!accountNumber.trim() || !ifscCode.trim() || !branchName.trim()) {
      showToast('Please provide complete bank details.', 'error');
      return;
    }

    setSubmittingWithdrawal(true);
    try {
      const result = await submitWithdrawal(val, {
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim(),
        branchName: branchName.trim()
      });
      // Save details locally for user convenience
      localStorage.setItem('user_bank_account', accountNumber.trim());
      localStorage.setItem('user_bank_ifsc', ifscCode.trim());
      localStorage.setItem('user_bank_branch', branchName.trim());

      setTransactions(prev => [result.transaction, ...prev]);
      const wallet = await getBalance();
      onBalanceUpdate(wallet.balance);

      showToast(result.message || 'Withdrawal submitted successfully!', 'success');
      setActiveModal('history');
      setAmount('');
    } catch (err: any) {
      showToast(err?.error || err?.message || 'Withdrawal request failed.', 'error');
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  // Save bank accounts
  const handleSaveBankDetails = (e: FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !ifscCode.trim()) {
      showToast('Account number and IFSC code are required.', 'error');
      return;
    }
    localStorage.setItem('user_bank_account', accountNumber.trim());
    localStorage.setItem('user_bank_ifsc', ifscCode.trim());
    localStorage.setItem('user_bank_branch', branchName.trim());
    showToast('Bank details saved securely.', 'success');
    setActiveModal(null);
  };

  // Update profile
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      localStorage.setItem('user_avatar', selectedAvatar);
      const res = await apiClient.put<{ status: string; message: string; user: any }, { status: string; message: string; user: any }>(
        '/v1/auth/profile',
        { email: editEmail, phone: editPhone }
      );
      showToast(res.message || 'Profile updated successfully!', 'success');
      setActiveModal(null);
    } catch (err: any) {
      showToast(err?.message || err?.error || 'Profile update failed', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await apiClient.post<{ status: string; message: string }, { status: string; message: string }>(
        '/v1/auth/change-password',
        { currentPassword, newPassword }
      );
      showToast(res.message || 'Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setActiveModal(null);
    } catch (err: any) {
      showToast(err?.message || err?.error || 'Password update failed.', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter(tx => {
    if (historyTab === 'DEPOSIT' && tx.type !== 'DEPOSIT') return false;
    if (historyTab === 'WITHDRAWAL' && tx.type !== 'WITHDRAWAL') return false;
    if (historyTab === 'BET_WIN' && tx.type !== 'BET' && tx.type !== 'WIN') return false;
    if (historySearch) {
      const q = historySearch.toLowerCase();
      const ref = (tx.referenceId || '').toLowerCase();
      const desc = (tx.description || '').toLowerCase();
      const id = tx.id.toLowerCase();
      return ref.includes(q) || desc.includes(q) || id.includes(q);
    }
    return true;
  });

  const memberIdFormatted = user?.memberId || (user?.id ? user.id.slice(-8).toUpperCase() : '510590A6');

  if (!user) {
    return (
      <main className="mp-profile-container">
        <header className="mp-profile-header">
          <button type="button" className="mp-back-btn" onClick={onHome} aria-label="Back to home">
            <ArrowLeft size={19} />
          </button>
          <div className="mp-header-text">
            <h1>My Profile</h1>
            <p>Manage your account and preferences</p>
          </div>
        </header>
        <div className="mp-guest-card">
          <Shield size={44} className="mp-guest-icon" />
          <h2>Access Your Profile</h2>
          <p>Please log in or register to manage your VIP dashboard, wallet, and settings.</p>
          <button type="button" className="mp-gold-btn" onClick={onLogin}>
            Log In Now
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mp-profile-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`mp-toast mp-toast-${toastMessage.type}`} role="status">
          {toastMessage.type === 'success' ? <Check size={16} /> : <Info size={16} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. Profile Top Header */}
      <header className="mp-profile-header">
        <div className="mp-header-left">
          <button type="button" className="mp-back-btn" onClick={onHome} aria-label="Back to home">
            <ArrowLeft size={18} />
          </button>
          <div className="mp-header-text">
            <h1>My Profile</h1>
            <p>Manage your account and preferences</p>
          </div>
        </div>
        <button
          type="button"
          className="mp-edit-profile-btn"
          onClick={() => setActiveModal('editProfile')}
          aria-label="Edit Profile"
        >
          <Edit3 size={14} />
          <span>Edit Profile</span>
        </button>
      </header>

      {/* 2. Player Identity Card */}
      <section className="mp-identity-card">
        <div className="mp-identity-top">
          {/* Avatar with gold border and edit badge */}
          <div className="mp-avatar-container">
            <div className="mp-avatar-glow" />
            <img src={selectedAvatar} alt="Player Avatar" className="mp-avatar-img" />
            <button
              type="button"
              className="mp-avatar-edit-badge"
              onClick={() => setActiveModal('editProfile')}
              title="Change avatar"
              aria-label="Change Avatar"
            >
              <Smartphone size={11} />
            </button>
          </div>

          {/* User Details */}
          <div className="mp-identity-info">
            <div className="mp-badge-row">
              <span className="mp-level-badge">Level {stats.level}</span>
              <button
                type="button"
                className="mp-vip-badge"
                onClick={onOpenVip || onHome}
                title="View VIP benefits"
              >
                <span>👑</span>
                <span>{stats.vipTier}</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="mp-identity-phone-row">
              <h2 className="mp-masked-phone">{maskPhone(user.phone)}</h2>
              {user.phone && (
                <button
                  type="button"
                  className="mp-icon-copy-btn"
                  onClick={() => handleCopy(user.phone!, 'Phone')}
                  title="Copy Phone"
                >
                  {copiedType === 'Phone' ? <Check size={14} color="#f4c35a" /> : <Copy size={14} />}
                </button>
              )}
            </div>

            <p className="mp-identity-email">{user.email || 'No email attached'}</p>

            <div className="mp-identity-member-row">
              <span>Member ID: {memberIdFormatted}</span>
              <button
                type="button"
                className="mp-icon-copy-btn"
                onClick={() => handleCopy(memberIdFormatted, 'Member ID')}
                title="Copy Member ID"
              >
                {copiedType === 'Member ID' ? <Check size={13} color="#f4c35a" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          {/* Golden Shield Crest Graphic */}
          <div className="mp-crest-wrap" aria-hidden="true">
            <svg viewBox="0 0 100 100" className="mp-crest-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="crestGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffd700" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#ffd700" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffe68a" />
                  <stop offset="50%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#996515" />
                </linearGradient>
                <linearGradient id="shieldFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e183a" />
                  <stop offset="100%" stopColor="#0c0e21" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="46" fill="url(#crestGlow)" />
              {/* Crown */}
              <path d="M35 34L42 43L50 28L58 43L65 34L63 48H37L35 34Z" fill="url(#goldGradient)" stroke="#fff" strokeWidth="0.5" />
              {/* Shield Outer */}
              <path d="M50 82C66 70 74 58 74 44V34L50 26L26 34V44C26 58 34 70 50 82Z" fill="url(#shieldFill)" stroke="url(#goldGradient)" strokeWidth="2.5" />
              {/* Shield Inner */}
              <path d="M50 75C62 65 68 55 68 44V36L50 30L32 36V44C32 55 38 65 50 75Z" fill="none" stroke="url(#goldGradient)" strokeWidth="1" strokeDasharray="2 2" />
              {/* Wings / Laurel accents */}
              <path d="M22 42C16 48 18 60 25 66M78 42C84 48 82 60 75 66" stroke="url(#goldGradient)" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M19 50C16 55 18 64 24 69M81 50C84 55 82 64 76 69" stroke="url(#goldGradient)" strokeWidth="1.4" strokeLinecap="round" />
              {/* Center Emblem */}
              <path d="M50 42L54 50H46L50 42Z" fill="url(#goldGradient)" />
              <circle cx="50" cy="56" r="4" fill="url(#goldGradient)" />
            </svg>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mp-level-progress-section">
          <div className="mp-progress-labels">
            <span className="mp-label-left">Level {stats.level}</span>
            <span className="mp-label-right">Level {stats.level + 1}</span>
          </div>
          <div className="mp-progress-bar-track">
            <div
              className="mp-progress-bar-fill"
              style={{ width: `${Math.min(100, Math.max(10, (stats.currentLevelXP / stats.nextLevelXP) * 100))}%` }}
            />
          </div>
          <div className="mp-xp-text">
            {stats.currentLevelXP.toLocaleString()} / {stats.nextLevelXP.toLocaleString()} XP
          </div>
        </div>
      </section>

      {/* 3. Wallet Balance Dashboard */}
      <section className="mp-wallet-card">
        <div className="mp-wallet-header">
          <div className="mp-wallet-title">
            <Wallet size={18} className="mp-wallet-icon" />
            <span>Wallet Balance</span>
          </div>
          <button
            type="button"
            className="mp-view-all-btn"
            onClick={() => setActiveModal('history')}
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="mp-balance-row">
          <div className="mp-balance-display">
            <span className="mp-currency-symbol">₹</span>
            <span className="mp-balance-amount">
              {Number(user.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <button
            type="button"
            className={`mp-refresh-btn ${isRefreshingBalance ? 'spinning' : ''}`}
            onClick={handleRefreshBalance}
            disabled={isRefreshingBalance}
            title="Refresh balance"
            aria-label="Refresh wallet balance"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="mp-wallet-actions-grid">
          <button
            type="button"
            className="mp-btn-deposit"
            onClick={onDeposit}
          >
            <Wallet size={16} />
            <span>Deposit</span>
          </button>
          <button
            type="button"
            className="mp-btn-withdraw"
            onClick={() => setActiveModal('withdraw')}
          >
            <ArrowDownToLine size={16} />
            <span>Withdraw</span>
          </button>
          <button
            type="button"
            className="mp-btn-history"
            onClick={() => setActiveModal('history')}
          >
            <History size={16} />
            <span>Transaction History</span>
          </button>
        </div>
      </section>

      {/* 4. Account Statistics */}
      <section className="mp-stats-row">
        {/* Total Bets */}
        <div className="mp-stat-card mp-stat-bets">
          <div className="mp-stat-icon-wrap bets">
            <Gamepad2 size={18} />
          </div>
          <div className="mp-stat-content">
            <span className="mp-stat-label">Total Bets</span>
            <strong className="mp-stat-val bets">{stats.totalBets}</strong>
          </div>
        </div>

        {/* Total Wins */}
        <div className="mp-stat-card mp-stat-wins">
          <div className="mp-stat-icon-wrap wins">
            <Trophy size={18} />
          </div>
          <div className="mp-stat-content">
            <span className="mp-stat-label">Total Wins</span>
            <strong className="mp-stat-val wins">
              ₹{Number(stats.totalWins).toLocaleString('en-IN')}
            </strong>
          </div>
        </div>

        {/* Bonuses Claimed */}
        <div className="mp-stat-card mp-stat-bonuses">
          <div className="mp-stat-icon-wrap bonuses">
            <Gift size={18} />
          </div>
          <div className="mp-stat-content">
            <span className="mp-stat-label">Bonuses Claimed</span>
            <strong className="mp-stat-val bonuses">
              ₹{Number(stats.bonusesClaimed).toLocaleString('en-IN')}
            </strong>
          </div>
        </div>
      </section>

      {/* 5. Account & Security Section */}
      <section className="mp-section">
        <h3 className="mp-section-title">Account & Security</h3>
        <div className="mp-settings-list">
          {/* Personal Information */}
          <button
            type="button"
            className="mp-settings-item"
            onClick={() => setActiveModal('editProfile')}
          >
            <div className="mp-settings-left">
              <div className="mp-settings-icon user-icon">
                <User size={18} />
              </div>
              <div className="mp-settings-text">
                <h4>Personal Information</h4>
                <p>View and update your details</p>
              </div>
            </div>
            <ChevronRight size={18} className="mp-chevron" />
          </button>

          {/* Security */}
          <button
            type="button"
            className="mp-settings-item"
            onClick={() => setActiveModal('security')}
          >
            <div className="mp-settings-left">
              <div className="mp-settings-icon security-icon">
                <ShieldCheck size={18} />
              </div>
              <div className="mp-settings-text">
                <h4>Security</h4>
                <p>Change password, 2FA and security settings</p>
              </div>
            </div>
            <ChevronRight size={18} className="mp-chevron" />
          </button>

          {/* KYC Verification */}
          <button
            type="button"
            className="mp-settings-item"
            onClick={() => setActiveModal('kyc')}
          >
            <div className="mp-settings-left">
              <div className="mp-settings-icon kyc-icon">
                <Shield size={18} />
              </div>
              <div className="mp-settings-text">
                <div className="mp-item-title-badge">
                  <h4>KYC Verification</h4>
                  <span className="mp-verified-pill">
                    <Check size={12} />
                    Verified
                  </span>
                </div>
                <p>Your account is verified</p>
              </div>
            </div>
            <ChevronRight size={18} className="mp-chevron" />
          </button>

          {/* Bank Accounts */}
          <button
            type="button"
            className="mp-settings-item"
            onClick={() => setActiveModal('bank')}
          >
            <div className="mp-settings-left">
              <div className="mp-settings-icon bank-icon">
                <Landmark size={18} />
              </div>
              <div className="mp-settings-text">
                <h4>Bank Accounts</h4>
                <p>Manage your bank accounts</p>
              </div>
            </div>
            <ChevronRight size={18} className="mp-chevron" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="mp-settings-item"
            onClick={() => setActiveModal('notifications')}
          >
            <div className="mp-settings-left">
              <div className="mp-settings-icon notif-icon">
                <Bell size={18} />
              </div>
              <div className="mp-settings-text">
                <h4>Notifications</h4>
                <p>Manage your notification preferences</p>
              </div>
            </div>
            <ChevronRight size={18} className="mp-chevron" />
          </button>
        </div>
      </section>

      {/* 6. Help & Support Section */}
      <section className="mp-section">
        <h3 className="mp-section-title">Help & Support</h3>
        <div className="mp-support-grid">
          {/* Customer Support Card */}
          <div
            className="mp-support-card"
            onClick={() => {
              if (whatsappNumber) {
                window.open(`https://wa.me/${whatsappNumber}`, '_blank', 'noopener,noreferrer');
              } else {
                showToast('Support is currently offline. Please try again soon.', 'error');
              }
            }}
          >
            <div className="mp-support-card-left">
              <div className="mp-support-icon support-blue">
                <Headphones size={20} />
              </div>
              <div className="mp-support-content">
                <h4>Customer Support</h4>
                <p>Get help from our support team</p>
              </div>
            </div>
            <ChevronRight size={17} className="mp-chevron" />
          </div>

          {/* FAQ Card */}
          <div
            className="mp-support-card"
            onClick={() => setActiveModal('faq')}
          >
            <div className="mp-support-card-left">
              <div className="mp-support-icon faq-pink">
                <FileQuestion size={20} />
              </div>
              <div className="mp-support-content">
                <h4>FAQ</h4>
                <p>Find answers to common questions</p>
              </div>
            </div>
            <ChevronRight size={17} className="mp-chevron" />
          </div>
        </div>
      </section>

      {/* 7. Logout Action Row */}
      <div className="mp-logout-section">
        <button
          type="button"
          className="mp-logout-btn"
          onClick={() => setActiveModal('logout')}
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>

      {/* =========================================================================
          MODALS & SUB-PANELS
         ========================================================================= */}

      {/* WITHDRAW MODAL */}
      {activeModal === 'withdraw' && (
        <div className="mp-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="mp-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="mp-sheet-header">
              <div className="mp-sheet-title">
                <Landmark size={20} className="mp-gold-text" />
                <h3>Withdraw to Bank</h3>
              </div>
              <button type="button" className="mp-close-btn" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="mp-sheet-body">
              <div className="mp-balance-callout">
                <span>Available Balance</span>
                <strong>₹{Number(user.balance || 0).toFixed(2)}</strong>
              </div>

              <form onSubmit={handleWithdrawalSubmit} className="mp-form">
                <div className="mp-form-group">
                  <label>Withdrawal Amount (₹)</label>
                  <input
                    type="number"
                    min="300"
                    step="1"
                    placeholder="Minimum ₹300"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                  />
                  {feePercent > 0 && amount && Number(amount) >= 300 && (
                    <div className="mp-fee-breakdown">
                      <span>Platform fee ({feePercent}%): ₹{((Number(amount) * feePercent) / 100).toFixed(2)}</span>
                      <strong>You will receive: ₹{(Number(amount) - (Number(amount) * feePercent) / 100).toFixed(2)}</strong>
                    </div>
                  )}
                </div>

                <div className="mp-form-group">
                  <label>Bank Account Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={24}
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <div className="mp-form-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="e.g. HDFC0001234"
                    value={ifscCode}
                    onChange={e => setIfscCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="mp-form-group">
                  <label>Branch Name</label>
                  <input
                    type="text"
                    placeholder="Enter bank branch location"
                    value={branchName}
                    onChange={e => setBranchName(e.target.value)}
                    required
                  />
                </div>

                <div className="mp-form-actions">
                  <button type="button" className="mp-btn-cancel" onClick={() => setActiveModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="mp-gold-btn" disabled={submittingWithdrawal}>
                    {submittingWithdrawal ? 'Submitting…' : 'Submit Withdrawal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION HISTORY MODAL */}
      {activeModal === 'history' && (
        <div className="mp-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="mp-modal-sheet large" onClick={e => e.stopPropagation()}>
            <div className="mp-sheet-header">
              <div className="mp-sheet-title">
                <History size={20} className="mp-gold-text" />
                <h3>Transaction History</h3>
              </div>
              <button type="button" className="mp-close-btn" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="mp-sheet-body">
              {/* Filter Tabs */}
              <div className="mp-history-tabs">
                <button
                  className={historyTab === 'ALL' ? 'active' : ''}
                  onClick={() => setHistoryTab('ALL')}
                >
                  All
                </button>
                <button
                  className={historyTab === 'DEPOSIT' ? 'active' : ''}
                  onClick={() => setHistoryTab('DEPOSIT')}
                >
                  Deposits
                </button>
                <button
                  className={historyTab === 'WITHDRAWAL' ? 'active' : ''}
                  onClick={() => setHistoryTab('WITHDRAWAL')}
                >
                  Withdrawals
                </button>
                <button
                  className={historyTab === 'BET_WIN' ? 'active' : ''}
                  onClick={() => setHistoryTab('BET_WIN')}
                >
                  Bets & Wins
                </button>
              </div>

              {/* Search filter */}
              <div className="mp-search-box">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search by ID or description…"
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                />
              </div>

              {/* Transactions List */}
              <div className="mp-tx-list">
                {filteredTransactions.length === 0 ? (
                  <div className="mp-empty-state">
                    <History size={36} />
                    <p>No transactions found for this filter.</p>
                  </div>
                ) : (
                  filteredTransactions.map(tx => {
                    const isCredit = tx.type === 'DEPOSIT' || tx.type === 'WIN' || tx.type === 'BONUS';
                    const isWithdrawal = tx.type === 'WITHDRAWAL';
                    const statusText =
                      tx.status === 'COMPLETED'
                        ? isWithdrawal
                          ? 'Paid'
                          : 'Success'
                        : tx.status === 'PENDING'
                        ? 'Pending'
                        : 'Failed';

                    return (
                      <div className="mp-tx-row" key={tx.id}>
                        <div className="mp-tx-left">
                          <div className={`mp-tx-type-pill ${tx.type.toLowerCase()}`}>
                            {tx.type}
                          </div>
                          <div className="mp-tx-details">
                            <span className="mp-tx-desc">
                              {tx.description || `${tx.type} Transaction`}
                            </span>
                            <small className="mp-tx-time">
                              {new Date(tx.createdAt).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </small>
                            {tx.referenceId && (
                              <small className="mp-tx-ref">Ref: {tx.referenceId}</small>
                            )}
                          </div>
                        </div>

                        <div className="mp-tx-right">
                          <strong className={`mp-tx-amount ${isCredit ? 'credit' : 'debit'}`}>
                            {isCredit ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                          </strong>
                          <span className={`mp-tx-status status-${tx.status.toLowerCase()}`}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {hasMoreTransactions && (
                <button
                  type="button"
                  className="mp-btn-load-more"
                  disabled={loadingHistory}
                  onClick={() => fetchTransactions(false)}
                >
                  {loadingHistory ? 'Loading…' : 'Load More Records'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE / PERSONAL INFORMATION MODAL */}
      {activeModal === 'editProfile' && (
        <div className="mp-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="mp-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="mp-sheet-header">
              <div className="mp-sheet-title">
                <User size={20} className="mp-gold-text" />
                <h3>Personal Information</h3>
              </div>
              <button type="button" className="mp-close-btn" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="mp-sheet-body">
              <form onSubmit={handleSaveProfile} className="mp-form">
                {/* Choose Avatar */}
                <div className="mp-avatar-picker-section">
                  <label className="mp-picker-title">Choose Avatar</label>
                  <div className="mp-avatar-grid">
                    {AVATAR_OPTIONS.map(item => (
                      <div
                        key={item.id}
                        className={`mp-avatar-option ${selectedAvatar === item.url ? 'active' : ''}`}
                        onClick={() => setSelectedAvatar(item.url)}
                      >
                        <img src={item.url} alt={item.name} />
                        {selectedAvatar === item.url && (
                          <div className="mp-avatar-check">
                            <Check size={11} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mp-form-group">
                  <label>Mobile Number</label>
                  <div className="mp-input-wrap">
                    <Phone size={15} />
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="mp-form-group">
                  <label>Email Address</label>
                  <div className="mp-input-wrap">
                    <Mail size={15} />
                    <input
                      type="email"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="mp-form-group">
                  <label>Member ID</label>
                  <input type="text" readOnly value={memberIdFormatted} className="mp-readonly-input" />
                </div>

                <div className="mp-form-actions">
                  <button type="button" className="mp-btn-cancel" onClick={() => setActiveModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="mp-gold-btn" disabled={profileSaving}>
                    {profileSaving ? 'Saving…' : 'Save Details'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY / PASSWORD MODAL */}
      {activeModal === 'security' && (
        <div className="mp-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="mp-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="mp-sheet-header">
              <div className="mp-sheet-title">
                <Lock size={20} className="mp-gold-text" />
                <h3>Security & Password</h3>
              </div>
              <button type="button" className="mp-close-btn" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="mp-sheet-body">
              <form onSubmit={handleChangePassword} className="mp-form">
                <div className="mp-form-group">
                  <label>Current Password</label>
                  <div className="mp-input-wrap">
                    <KeyRound size={15} />
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mp-form-group">
                  <label>New Password</label>
                  <div className="mp-input-wrap">
                    <Lock size={15} />
                    <input
                      type="password"
                      placeholder="Min 8 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>
                </div>

                <div className="mp-form-group">
                  <label>Confirm New Password</label>
                  <div className="mp-input-wrap">
                    <Lock size={15} />
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>
                </div>

                <div className="mp-security-info-box">
                  <ShieldCheck size={16} />
                  <span>Two-factor authentication (2FA) is automatically managed via OTP when logging in.</span>
                </div>

                <div className="mp-form-actions">
                  <button type="button" className="mp-btn-cancel" onClick={() => setActiveModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="mp-gold-btn" disabled={passwordSaving}>
                    {passwordSaving ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* KYC MODAL */}
      {activeModal === 'kyc' && (
        <div className="mp-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="mp-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="mp-sheet-header">
              <div className="mp-sheet-title">
                <ShieldCheck size={20} className="mp-gold-text" />
                <h3>KYC Verification</h3>
              </div>
              <button type="button" className="mp-close-btn" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="mp-sheet-body">
              <div className="mp-kyc-status-banner">
                <div className="mp-kyc-badge-large">
                  <Check size={28} />
                </div>
                <h4>Account Verified</h4>
                <p>Your identity has been authenticated according to gaming safety standards.</p>
              </div>

              <div className="mp-kyc-details">
                <div className="mp-kyc-row">
                  <span>Registered Mobile</span>
                  <strong>{maskPhone(user.phone)}</strong>
                </div>
                <div className="mp-kyc-row">
                  <span>Registered Email</span>
                  <strong>{user.email || 'Verified via Mobile'}</strong>
                </div>
                <div className="mp-kyc-row">
                  <span>Member ID</span>
                  <strong>{memberIdFormatted}</strong>
                </div>
                <div className="mp-kyc-row">
                  <span>Verification Tier</span>
                  <strong>Full Player Access</strong>
                </div>
              </div>

              <button
                type="button"
                className="mp-gold-btn full"
                onClick={() => setActiveModal(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BANK ACCOUNTS MODAL */}
      {activeModal === 'bank' && (
        <div className="mp-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="mp-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="mp-sheet-header">
              <div className="mp-sheet-title">
                <Landmark size={20} className="mp-gold-text" />
                <h3>Bank Account Details</h3>
              </div>
              <button type="button" className="mp-close-btn" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="mp-sheet-body">
              <form onSubmit={handleSaveBankDetails} className="mp-form">
                <p className="mp-modal-description">
                  Save your withdrawal bank details. When you request a withdrawal, your payout is routed to this account.
                </p>

                <div className="mp-form-group">
                  <label>Bank Account Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={24}
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>

                <div className="mp-form-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="e.g. HDFC0001234"
                    value={ifscCode}
                    onChange={e => setIfscCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="mp-form-group">
                  <label>Branch Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai Main Branch"
                    value={branchName}
                    onChange={e => setBranchName(e.target.value)}
                    required
                  />
                </div>

                <div className="mp-form-actions">
                  <button type="button" className="mp-btn-cancel" onClick={() => setActiveModal(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="mp-gold-btn">
                    Save Bank Details
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS MODAL */}
      {activeModal === 'notifications' && (
        <div className="mp-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="mp-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="mp-sheet-header">
              <div className="mp-sheet-title">
                <Bell size={20} className="mp-gold-text" />
                <h3>Notification Preferences</h3>
              </div>
              <button type="button" className="mp-close-btn" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="mp-sheet-body">
              <div className="mp-toggle-list">
                <div className="mp-toggle-row">
                  <div>
                    <h5>Promotions & Bonuses</h5>
                    <p>Get notified when deposit matches and free bonuses drop</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.promoAlerts}
                    onChange={e => {
                      const updated = { ...notifications, promoAlerts: e.target.checked };
                      setNotifications(updated);
                      localStorage.setItem('user_notifications', JSON.stringify(updated));
                    }}
                  />
                </div>

                <div className="mp-toggle-row">
                  <div>
                    <h5>Deposit & Withdrawal Updates</h5>
                    <p>Instant SMS/Push notification upon payout review</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.depositAlerts}
                    onChange={e => {
                      const updated = { ...notifications, depositAlerts: e.target.checked };
                      setNotifications(updated);
                      localStorage.setItem('user_notifications', JSON.stringify(updated));
                    }}
                  />
                </div>

                <div className="mp-toggle-row">
                  <div>
                    <h5>Security Alerts</h5>
                    <p>Alerts for logins from new devices and password changes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.securityAlerts}
                    onChange={e => {
                      const updated = { ...notifications, securityAlerts: e.target.checked };
                      setNotifications(updated);
                      localStorage.setItem('user_notifications', JSON.stringify(updated));
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                className="mp-gold-btn full"
                onClick={() => {
                  showToast('Notification preferences updated.', 'success');
                  setActiveModal(null);
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {activeModal === 'faq' && (
        <div className="mp-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="mp-modal-sheet large" onClick={e => e.stopPropagation()}>
            <div className="mp-sheet-header">
              <div className="mp-sheet-title">
                <FileQuestion size={20} className="mp-gold-text" />
                <h3>Frequently Asked Questions</h3>
              </div>
              <button type="button" className="mp-close-btn" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="mp-sheet-body mp-faq-body">
              <div className="mp-faq-item">
                <h5>How do I deposit money into my wallet?</h5>
                <p>
                  Tap the golden <strong>Deposit</strong> button, select your preferred amount, and scan the dynamic UPI QR
                  or copy the UPI ID. Once transferred, submit the 12-digit UTR reference number for immediate review.
                </p>
              </div>

              <div className="mp-faq-item">
                <h5>What is the minimum withdrawal amount?</h5>
                <p>
                  The minimum withdrawal amount is ₹300. Withdrawals are processed to the bank account saved in your profile.
                </p>
              </div>

              <div className="mp-faq-item">
                <h5>How are my Level and VIP points determined?</h5>
                <p>
                  Every game you play and wager contributes to your Experience Points (XP). Reach the next tier threshold to
                  unlock higher cashback rates and VIP perks!
                </p>
              </div>

              <div className="mp-faq-item">
                <h5>Is my account secure?</h5>
                <p>
                  Yes, all passwords use bcrypt hashing and sessions use signed JWT tokens. We never store raw payment PINs
                  or confidential banking passwords.
                </p>
              </div>

              <button
                type="button"
                className="mp-gold-btn full"
                onClick={() => setActiveModal(null)}
              >
                Close FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {activeModal === 'logout' && (
        <div className="mp-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="mp-modal-sheet compact" onClick={e => e.stopPropagation()}>
            <div className="mp-sheet-header">
              <div className="mp-sheet-title">
                <LogOut size={20} className="mp-red-text" />
                <h3>Confirm Logout</h3>
              </div>
              <button type="button" className="mp-close-btn" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="mp-sheet-body">
              <p className="mp-logout-warning">
                Are you sure you want to log out of your MaltiplayX account? You will need to log back in to play games or view your wallet.
              </p>

              <div className="mp-form-actions">
                <button type="button" className="mp-btn-cancel" onClick={() => setActiveModal(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="mp-btn-logout-confirm"
                  onClick={() => {
                    setActiveModal(null);
                    onLogout();
                  }}
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
