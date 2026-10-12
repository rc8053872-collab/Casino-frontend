import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDownToLine, ArrowLeft, Check, Copy, Gift, Headphones, History, Landmark, ShieldCheck, Sparkles, Trophy, WalletCards } from 'lucide-react';
import { apiClient } from '../api/client';
import { getBalance, getTransactions, submitWithdrawal, getPaymentSettings, Transaction } from '../api/wallet';

interface Member {
  id: string;
  username?: string | null;
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

import { ProfileDashboard } from './ProfileDashboard';

export function ProfilePage({ user, onHome, onLogin, onLogout, onDeposit, onBalanceUpdate, onOpenVip, whatsappNumber }: PageActions & {
  user: Member | null;
  onLogout: () => void;
  onDeposit: () => void;
  onBalanceUpdate: (balance: number) => void;
  onOpenVip?: () => void;
  whatsappNumber?: string | null;
}) {
  return (
    <ProfileDashboard
      user={user}
      onHome={onHome}
      onLogin={onLogin}
      onLogout={onLogout}
      onDeposit={onDeposit}
      onBalanceUpdate={onBalanceUpdate}
      onOpenVip={onOpenVip}
      whatsappNumber={whatsappNumber}
    />
  );
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
