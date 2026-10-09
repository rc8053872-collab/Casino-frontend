import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDownToLine, ArrowLeft, Check, Copy, Gift, Headphones, History, Landmark, ShieldCheck, Sparkles, Trophy, WalletCards } from 'lucide-react';
import { apiClient } from '../api/client';
import { getBalance, getTransactions, submitWithdrawal, getPaymentSettings, Transaction } from '../api/wallet';

interface Member {
  id: string;
  phone: string | null;
  email?: string | null;
  balance: number;
}

interface PageActions {
  onHome: () => void;
  onLogin: () => void;
}

interface HomeAction {
  onHome: () => void;
}

interface ReferralInfo {
  code: string;
  invitedUsers: number;
  earnedBonus: number;
  reward: number;
  rewardDescription: string;
}

function getMemberErrorMessage(reason: unknown) {
  if (reason && typeof reason === 'object' && 'error' in reason && typeof reason.error === 'string') return reason.error;
  if (reason instanceof Error) return reason.message;
  return 'Could not complete the request. Please try again.';
}

export function InvitePromoPage({ user, onHome, onLogin, onOpenDeposit }: PageActions & {
  user: Member | null;
  onOpenDeposit: () => void;
}) {
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    apiClient.get<ReferralInfo, ReferralInfo>('/v1/referrals/me')
      .then(result => { if (active) setReferral(result); })
      .catch(reason => {
        if (active) setError(typeof reason?.error === 'string' ? reason.error : 'Could not load your invite code.');
      });
    return () => { active = false; };
  }, [user]);

  const inviteLink = referral
    ? `${window.location.origin}/?ref=${encodeURIComponent(referral.code)}`
    : '';

  const shareInvite = async () => {
    if (!inviteLink || !referral) return;
    const shareData = {
      title: 'Join MaltiplayX',
      text: `Join me on MaltiplayX with my invite code ${referral.code}. You get ₹30 after your first successful login!`,
      url: inviteLink
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch (reason) {
      if (reason instanceof Error && reason.name === 'AbortError') return;
      setError('Could not share the invite. Copy the link instead.');
    }
  };

  const copyInvite = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Clipboard access failed. Copy the invite link manually.');
    }
  };

  return <main className="member-page">
    <PageHeader icon={<Gift size={19} />} eyebrow="PROMOTIONS" title="Invite & earn" onHome={onHome} />
    <section className="invite-hero">
      <div className="invite-hero-icon"><Gift size={25} /></div>
      <p className="eyebrow">FRIEND INVITE BONUS</p>
      <h2>Give your friend ₹30</h2>
      <p>Your invited friend receives ₹30 in their wallet after creating an account with your code and completing their first successful login.</p>
      <div className="invite-steps">
        <span><b>1</b> Share your code</span><span><b>2</b> Friend registers with it</span><span><b>3</b> ₹30 credited after first login</span>
      </div>
    </section>
    {!user ? <section className="member-panel invite-login">
      <p>Log in to get your personal invite code and track successful referrals.</p>
      <button className="gold-button" onClick={onLogin}>Log in</button>
    </section> : referral ? <section className="member-panel referral-card">
      <div className="referral-code-head"><div><small>YOUR INVITE CODE</small><b>{referral.code}</b></div><button type="button" aria-label="Copy invite code" onClick={async () => {
        try { await navigator.clipboard.writeText(referral.code); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
        catch { setError('Clipboard access failed. Copy the code manually.'); }
      }}><Copy size={17} /></button></div>
      <label className="invite-link-label">Share link<input readOnly value={inviteLink} onFocus={event => event.currentTarget.select()} /></label>
      <div className="invite-actions">
        <button type="button" className="gold-button" onClick={() => void shareInvite()}><Gift size={16} /> Share invite</button>
        <button type="button" className="member-outline-button" onClick={() => void copyInvite()}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy link'}</button>
      </div>
      <div className="referral-stats">
        <div><small>Friends joined</small><b>{referral.invitedUsers}</b></div>
        <div><small>Bonuses paid to friends</small><b>₹{referral.earnedBonus.toFixed(2)}</b></div>
      </div>
      {error && <p role="alert" className="member-error">{error}</p>}
    </section> : <p role="status" className="member-notice">{error || 'Loading your invite code…'}</p>}
    <section className="member-panel promo-details">
      <h3><Sparkles size={17} /> Current offers</h3>
      <div className="promo-detail-row"><span><b>Friend invite</b><small>One-time ₹30 wallet reward for an eligible new account</small></span><strong>₹30</strong></div>
      <p>Invite reward is credited once per new account after the first successful login. Reusing an account or code does not grant another bonus.</p>
      <button type="button" className="member-outline-button" onClick={onOpenDeposit}><WalletCards size={16} /> Open wallet</button>
    </section>
  </main>;
}

export function VipPage({ user, onHome, onLogin }: PageActions & { user: Member | null }) {
  return <main className="member-page">
    <PageHeader icon={<Trophy size={19} />} eyebrow="MEMBER BENEFITS" title="VIP Club" onHome={onHome} />
    <section className="vip-member-hero">
      <div className="vip-crown"><Trophy size={30} /></div>
      <p className="eyebrow">{user ? 'YOUR MEMBERSHIP' : 'JOIN THE CLUB'}</p>
      <h2>{user ? 'Welcome, member' : 'A better way to play'}</h2>
      <p>VIP eligibility and any tier benefits are based on verified activity. Your level will appear here when the VIP programme is enabled for your account.</p>
      {!user && <button className="gold-button" onClick={onLogin}>Log in to your account</button>}
    </section>
    <section className="vip-benefit-grid">
      <article><span>01</span><h3>Member offers</h3><p>See promotions available to your account in the Promos section.</p></article>
      <article><span>02</span><h3>Wallet history</h3><p>Keep track of approved deposits and account transactions.</p></article>
      <article><span>03</span><h3>Account support</h3><p>Contact support for account and payment questions.</p></article>
    </section>
    <p className="member-disclaimer">No VIP level, reward amount, or upgrade threshold is promised until it is published in your account.</p>
  </main>;
}

export function FairPlayPage({ onHome }: HomeAction) {
  return <main className="member-page">
    <PageHeader icon={<ShieldCheck size={19} />} eyebrow="PLAY WITH CARE" title="Fair play & safety" onHome={onHome} />
    <section className="fairplay-hero">
      <ShieldCheck size={35} />
      <h2>Play for entertainment</h2>
      <p>Casino games involve chance. Outcomes are not guaranteed, and past results do not predict future results.</p>
    </section>
    <section className="fairplay-list">
      {[
        ['Set a budget', 'Only play with money you can afford to lose. Never borrow to play or chase losses.'],
        ['Take breaks', 'Step away regularly. Stop playing if it no longer feels enjoyable.'],
        ['Protect your account', 'Keep your password and one-time codes private. Support will never ask you to share them.'],
        ['Check payments', 'Use only the payment QR/UPI shown in the app. Keep your receipt until a deposit is reviewed.'],
        ['Need help?', 'Pause play and contact support if gaming is causing stress or affecting daily life.']
      ].map(([title, copy], index) => <article key={title}><b>{String(index + 1).padStart(2, '0')}</b><div><h3>{title}</h3><p>{copy}</p></div></article>)}
    </section>
    <p className="member-disclaimer">Fair play information does not guarantee a win, return, or specific game outcome.</p>
  </main>;
}

export function SupportPage({ whatsappNumber, onHome }: HomeAction & { whatsappNumber: string | null }) {
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '';
  return <main className="member-page">
    <PageHeader icon={<Headphones size={19} />} eyebrow="WE'RE HERE TO HELP" title="Support" onHome={onHome} />
    <section className="member-panel support-panel">
      <span className="support-icon"><Headphones size={25} /></span>
      <h2>Talk to support on WhatsApp</h2>
      {whatsappNumber
        ? <><p>For deposit reviews, payment questions, or account help, message our configured support number.</p><a className="gold-button support-whatsapp-link" href={whatsappLink} target="_blank" rel="noopener noreferrer">Continue to WhatsApp</a></>
        : <p>WhatsApp support is not available yet. The administrator needs to add the support number in the admin panel.</p>}
      <p className="member-disclaimer">Never send your password, OTP, or full payment credentials in chat.</p>
    </section>
  </main>;
}

export function ProfilePage({ user, onHome, onLogin, onLogout, onDeposit, onBalanceUpdate }: PageActions & {
  user: Member | null;
  onLogout: () => void;
  onDeposit: () => void;
  onBalanceUpdate: (balance: number) => void;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [panel, setPanel] = useState<'profile' | 'withdraw' | 'history'>('profile');
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false);
  const [loadingMoreTransactions, setLoadingMoreTransactions] = useState(false);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feePercent, setFeePercent] = useState(0);

  useEffect(() => {
    if (panel === 'withdraw') {
      getPaymentSettings().then(settings => setFeePercent(settings.withdrawFeePercent || 0)).catch(() => {});
    }
  }, [panel]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const refreshAccount = async () => {
      try {
        const [items, wallet] = await Promise.all([getTransactions(51, 0), getBalance()]);
        if (!active) return;
        const latest = items.slice(0, 50);
        setTransactions(current => [
          ...latest,
          ...current.filter(item => !latest.some(latestItem => latestItem.id === item.id))
        ]);
        setHasMoreTransactions(items.length > 50);
        onBalanceUpdate(wallet.balance);
        setError('');
      } catch (reason) {
        if (active) setError(getMemberErrorMessage(reason));
      }
    };
    void refreshAccount();
    const interval = window.setInterval(() => { void refreshAccount(); }, 10000);
    return () => { active = false; window.clearInterval(interval); };
  }, [onBalanceUpdate, user]);

  const loadMoreTransactions = async () => {
    setLoadingMoreTransactions(true);
    setError('');
    try {
      const items = await getTransactions(50, transactions.length);
      setTransactions(current => {
        const existingIds = new Set(current.map(item => item.id));
        return [...current, ...items.filter(item => !existingIds.has(item.id))];
      });
      setHasMoreTransactions(items.length === 50);
    } catch (reason) {
      setError(getMemberErrorMessage(reason));
    } finally {
      setLoadingMoreTransactions(false);
    }
  };

  const requestWithdrawal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isSafeInteger(parsedAmount) || parsedAmount < 300) {
      setError('Enter a whole withdrawal amount of at least ₹300.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const result = await submitWithdrawal(parsedAmount, {
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim(),
        branchName: branchName.trim()
      });
      setTransactions(current => [result.transaction, ...current.filter(item => item.id !== result.transaction.id)]);
      const wallet = await getBalance();
      onBalanceUpdate(wallet.balance);
      setMessage(result.message);
      setPanel('history');
      setAmount('');
      setAccountNumber('');
      setIfscCode('');
      setBranchName('');
    } catch (reason) {
      setError(getMemberErrorMessage(reason));
    } finally {
      setSubmitting(false);
    }
  };

  return <main className="member-page">
    <PageHeader icon={<WalletCards size={19} />} eyebrow="ACCOUNT" title="My profile" onHome={onHome} />
    {!user ? <section className="member-panel invite-login"><p>Log in to view your account, wallet, and transaction history.</p><button className="gold-button" onClick={onLogin}>Log in</button></section> : <>
      <section className="profile-summary">
        <div className="profile-avatar">{(user.phone || user.email || 'U').slice(-2).toUpperCase()}</div>
        <div><small>PLAYER ACCOUNT</small><h2>{user.phone ? maskPhone(user.phone) : user.email || 'Google account'}</h2><p>{user.email || 'Email unavailable'} · Member ID · {user.id.slice(-8).toUpperCase()}</p></div>
      </section>
      <section className="profile-balance-card">
        <div><small>AVAILABLE WALLET BALANCE</small><b>₹{Number(user.balance).toFixed(2)}</b></div>
        <div className="profile-wallet-actions">
          <button className="gold-button" onClick={onDeposit}>Deposit</button>
          <button className="member-outline-button" onClick={() => { setError(''); setPanel('withdraw'); }}><ArrowDownToLine size={15} /> Withdraw</button>
          <button className="member-outline-button" onClick={() => { setError(''); setPanel('history'); }}><History size={15} /> History</button>
        </div>
      </section>
      {message && <p role="status" className="member-notice">{message}</p>}
      {panel === 'withdraw' && <section className="member-panel profile-withdrawal">
        <h3><Landmark size={17} /> Withdraw to bank</h3>
        <p>Minimum withdrawal is ₹300. The requested amount is held while the administrator reviews it.</p>
        <form onSubmit={event => void requestWithdrawal(event)}>
          <label>Amount (₹)<input required type="number" min="300" step="1" inputMode="numeric" value={amount} onChange={event => setAmount(event.target.value)} placeholder="Minimum ₹300" /></label>
          {feePercent > 0 && amount && Number(amount) >= 300 && (
            <p className="fee-notice text-xs text-slate-500 mb-4" style={{ marginTop: '-10px', display: 'block' }}>
              Platform fee ({feePercent}%): ₹{((Number(amount) * feePercent) / 100).toFixed(2)} <br/>
              You will receive: <b>₹{(Number(amount) - (Number(amount) * feePercent) / 100).toFixed(2)}</b>
            </p>
          )}
          <label>Bank account number<input required type="text" inputMode="numeric" autoComplete="off" maxLength={24} value={accountNumber} onChange={event => setAccountNumber(event.target.value.replace(/\D/g, ''))} placeholder="Enter account number" /></label>
          <label>IFSC code<input required type="text" autoComplete="off" maxLength={11} value={ifscCode} onChange={event => setIfscCode(event.target.value.toUpperCase())} placeholder="e.g. HDFC0001234" /></label>
          <label>Branch name<input required type="text" autoComplete="organization" maxLength={100} value={branchName} onChange={event => setBranchName(event.target.value)} placeholder="Enter bank branch" /></label>
          {error && <p role="alert" className="member-error">{error}</p>}
          <div className="withdrawal-form-actions">
            <button type="button" className="member-outline-button" onClick={() => setPanel('profile')}>Cancel</button>
            <button type="submit" className="gold-button" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit withdrawal'}</button>
          </div>
        </form>
      </section>}
      {panel === 'history' && <section className="member-panel profile-history">
        <h3>Deposit & withdrawal history</h3>
        {error && <p role="alert" className="member-error">{error}</p>}
        {!error && transactions.filter(transaction => transaction.type === 'DEPOSIT' || transaction.type === 'WITHDRAWAL').length === 0 && <p>No deposit or withdrawal activity yet.</p>}
        {transactions.filter(transaction => transaction.type === 'DEPOSIT' || transaction.type === 'WITHDRAWAL').map(transaction => {
          const isWithdrawal = transaction.type === 'WITHDRAWAL';
          const status = transaction.status === 'COMPLETED' ? (isWithdrawal ? 'Paid' : 'Approved')
            : transaction.status === 'PENDING' ? 'Pending'
              : 'Rejected';
          return <div className="deposit-history-row" key={transaction.id}>
            <span><b>{isWithdrawal ? 'Withdrawal' : 'Deposit'}</b><small>{transaction.referenceId ? `Ref ${transaction.referenceId} · ` : ''}{transaction.description || new Date(transaction.createdAt).toLocaleString()}</small></span>
            <strong className={`deposit-status status-${transaction.status.toLowerCase()}`}>
              {isWithdrawal ? (transaction.status === 'FAILED' ? '' : '−') : transaction.status === 'COMPLETED' ? '+' : ''}₹{Number(transaction.amount).toFixed(2)} · {status}
            </strong>
          </div>;
        })}
        {hasMoreTransactions && <button type="button" className="member-outline-button" disabled={loadingMoreTransactions} onClick={() => void loadMoreTransactions()}>
          {loadingMoreTransactions ? 'Loading…' : 'Load more history'}
        </button>}
      </section>}
      <button className="member-outline-button profile-logout" onClick={onLogout}>Log out</button>
    </>}
  </main>;
}

function PageHeader({ icon, eyebrow, title, onHome }: HomeAction & { icon: ReactNode; eyebrow: string; title: string }) {
  return <header className="member-page-header">
    <button type="button" onClick={onHome} aria-label="Back to home"><ArrowLeft size={19} /></button>
    <div><small>{eyebrow}</small><h1>{title}</h1></div>
  </header>;
}

function maskPhone(phone: string) {
  if (phone.length < 6) return phone;
  return `${phone.slice(0, 2)}${'*'.repeat(Math.max(2, phone.length - 4))}${phone.slice(-2)}`;
}
