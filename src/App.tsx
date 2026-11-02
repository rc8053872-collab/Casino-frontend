import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import {  Bell, ChevronRight, Gift, Headphones, Home, LayoutGrid, Play, Search, ShieldCheck, Sparkles, Star, Trophy, UserRound, X, Zap, ArrowLeft, BadgeDollarSign, CalendarDays, ClipboardList, Coins, Fish, RefreshCcw, Spade, WalletCards, Volume2, Mail , ChevronDown } from 'lucide-react'
import { Category, Game, liveGameProvider } from './services/gameProvider'
import { getGameLogo } from './utils/getGameLogo'
import { DepositWorkflow } from './components/DepositWorkflow'
import { getBalance } from './api/wallet'
import { FairPlayPage, InvitePromoPage, ProfilePage, SupportPage, VipPage } from './components/MemberPages'
import { apiClient } from './api/client'

const API_BASE = import.meta.env.VITE_API_URL || '/api';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      marquee: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { scrollamount?: string };
    }
  }
}

const Marquee = 'marquee' as any;

type Account = { id: string; username?: string | null; email: string | null; phone: string | null; balance: number; role?: string };



const winners = [];

const liveWinnersList = [
  { user: 'User9630...', game: 'Chicken', amount: '₹3,180', image: '/icons/games/chicken.jpg' },
  { user: 'User35023...', game: 'Rummy', amount: '₹954.40', image: '/game-art/3-cards-judgement-mac88.webp' },
  { user: 'User6501...', game: 'Gold Vault', amount: '₹1,000', image: '/icons/games/fortune-gems.jpg' },
  { user: 'User91912...', game: 'Aviator', amount: '₹2,540', image: '/icons/games/aviator.jpg' },
  { user: 'User14092...', game: 'Fortune Gems', amount: '₹4,890', image: '/icons/games/fortune-gems.jpg' },
  { user: 'User7721...', game: 'Candy Super', amount: '₹12,400', image: '/icons/games/pappu.jpg' },
];

const recentlyPlayedList = [
  { id: 'recent-aviator', slug: 'spribe_aviator', name: 'AVIATOR', sub: 'Originals', image: '/icons/games/aviator.jpg', players: '928' },
  { id: 'recent-chicken', slug: 'chicken-road', name: 'CHICKEN', sub: 'Originals', image: '/icons/games/chicken.jpg', players: '1,010' },
  { id: 'recent-ludo', slug: 'ludo', name: 'LUDO', sub: 'Playing', image: '/icons/games/ludo.jpg', players: '6,949' },
];

const originalsList = [
  { id: 'orig-dragontiger', slug: 'dragon-tiger-on', name: 'DRAGON TIGER', sub: 'Originals', image: '/icons/games/dragon-tiger.jpg?v=2', players: '1,294' },
  { id: 'orig-chicken', slug: 'chicken-road', name: 'CHICKEN', sub: 'Originals', image: '/icons/games/chicken.jpg', players: '1,010' },
  { id: 'orig-aviator', slug: 'spribe_aviator', name: 'AVIATOR', sub: 'Originals', image: '/icons/games/aviator.jpg', players: '928' },
  { id: 'orig-dice', slug: '100-super-icy-dice-expanse', name: 'DICE', sub: 'Originals', image: '/icons/games/dice.jpg', players: '826' },
  { id: 'orig-limbo', slug: 'mole-crash-jdb', name: 'LIMBO', sub: 'Originals', image: '/icons/games/limbo.jpg', players: '566' },
  { id: 'orig-plinko', slug: 'plinko-jdb', name: 'PLINKO', sub: 'Originals', image: '/icons/games/plinko.jpg', players: '294' },
];

const casinoList = [
  { id: 'cas-aviator', slug: 'spribe_aviator', name: 'AVIATOR', sub: 'Casino', image: '/icons/games/aviator.jpg', players: '2,844' },
  { id: 'cas-garuda', slug: '100-blazing-clover-jili', name: 'FORTUNE GARUDA 1000', sub: 'Casino', image: '/icons/games/garuda.jpg', players: '2,625' },
  { id: 'cas-chicken2', slug: 'chicken-road', name: 'CHICKEN ROAD 2', sub: 'Casino', image: '/icons/games/chicken-road.jpg', players: '1,487' },
  { id: 'cas-gems', slug: '10-sparkling-crown-jili', name: 'FORTUNE GEMS 500', sub: 'Casino', image: '/icons/games/fortune-gems.jpg', players: '948' },
  { id: 'cas-7up', slug: '3-cards-judgement-mac88', name: '7UP 7DOWN', sub: 'Casino', image: '/icons/games/7up-7down.jpg', players: '1,039' },
  { id: 'cas-pappu', slug: 'candy-superwin', name: 'PAPPU', sub: 'Casino', image: '/icons/games/pappu.jpg', players: '539' },
];

const freeToPlayList = [
  { id: 'ftp-ludo', slug: 'ludo', name: 'LUDO', sub: 'Free Play', image: '/icons/games/ludo.jpg', players: '6,964' },
  { id: 'ftp-ludo2', slug: '100-zombies-dice-endorphina', name: 'LUDO 2DICE', sub: 'Free Play', image: '/icons/games/dice.jpg', players: '1,763' },
  { id: 'ftp-snakes', slug: '101-candies-evolution-netent-asia', name: 'SNAKES & LADDERS', sub: 'Free Play', image: '/icons/games/snakes-ladders.jpg', players: '2,093' },
  { id: 'ftp-fruit', slug: '3-power-dragons', name: 'FRUIT DART', sub: 'Free Play', image: '/icons/games/fruit-dart.jpg', players: '925' },
];

const heroBannersList = [
  {
    id: 'banner-originals',
    title: '99% RTP',
    titleColor: '#f7b731',
    subtitle: 'ORIGINALS',
    tag: 'Fair Play',
    tagIcon: 'shield',
    tagBg: 'rgba(46, 75, 140, 0.45)',
    tagBorder: 'rgba(83, 107, 255, 0.5)',
    tagColor: '#b5c7ff',
    image: '/icons/games/dice.jpg',
    gradient: 'linear-gradient(135deg, #091227 0%, #111d44 55%, #18285c 100%)',
    actionType: 'fairplay'
  },
  {
    id: 'banner-aviator',
    title: '100X CASH',
    titleColor: '#ff4757',
    subtitle: 'AVIATOR PRO',
    tag: 'Cashout ✈️',
    tagIcon: 'zap',
    tagBg: 'rgba(255, 71, 87, 0.28)',
    tagBorder: 'rgba(255, 71, 87, 0.65)',
    tagColor: '#ff929d',
    image: '/icons/games/aviator.jpg',
    gradient: 'linear-gradient(135deg, #2a0b14 0%, #4a0d20 55%, #1a050b 100%)',
    actionType: 'aviator'
  },
  {
    id: 'banner-bonus',
    title: '100% BONUS',
    titleColor: '#ffd32a',
    subtitle: 'UP TO ₹10,000',
    tag: 'Claim Now ⚡',
    tagIcon: 'sparkles',
    tagBg: 'rgba(255, 211, 42, 0.25)',
    tagBorder: 'rgba(255, 211, 42, 0.6)',
    tagColor: '#ffeaa7',
    image: '/welcome-banner.jpg',
    gradient: 'linear-gradient(135deg, #1f1402 0%, #3e2806 55%, #140c02 100%)',
    actionType: 'deposit'
  },
  {
    id: 'banner-dragontiger',
    title: 'DRAGON VS TIGER',
    titleColor: '#ff4757',
    subtitle: 'LIVE ARENA',
    tag: 'Play Live 🐉',
    tagIcon: 'flame',
    tagBg: 'rgba(255, 71, 87, 0.25)',
    tagBorder: 'rgba(255, 71, 87, 0.6)',
    tagColor: '#ff929d',
    image: '/icons/games/dragon-tiger.jpg?v=2',
    gradient: 'linear-gradient(135deg, #2a0b14 0%, #4a0d20 55%, #1a050b 100%)',
    actionType: 'dragontiger'
  },
  {
    id: 'banner-jackpot',
    title: '1000X SPINS',
    titleColor: '#ffa801',
    subtitle: 'MEGA JACKPOT',
    tag: 'Spin & Win 🎰',
    tagIcon: 'trophy',
    tagBg: 'rgba(255, 168, 1, 0.25)',
    tagBorder: 'rgba(255, 168, 1, 0.6)',
    tagColor: '#ffd32a',
    image: '/icons/games/garuda.jpg',
    gradient: 'linear-gradient(135deg, #261203 0%, #4a2307 55%, #180c02 100%)',
    actionType: 'slots'
  }
];

type PromoTab = 'Event' | 'Mission' | 'VIP' | 'Rebate' | 'Unclaimed'
type PromoCategory = 'All' | 'Agent' | 'Slot' | 'Mini Games' | 'Cards' | 'Fishing'

const promoBanners = [
  { id: 'deposit', title: 'Deposit Tutorial', subtitle: 'Detailed Instructions', category: 'All' as PromoCategory, image: 'https://images.unsplash.com/photo-1518544889288-63c9e4c7d7c9?auto=format&fit=crop&w=1000&q=85' },
  { id: 'trusted', title: 'Trusted by Player', subtitle: 'Try Now', category: 'All' as PromoCategory, image: 'https://images.unsplash.com/photo-1518893883800-45cd0954574b?auto=format&fit=crop&w=1000&q=85' },
  { id: 'new-user', title: 'New User Rewards', subtitle: 'Finish Tasks - Claim Now', category: 'All' as PromoCategory, image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=1000&q=85' },
  { id: 'agent', title: 'Agent Program', subtitle: 'Be Exclusive Today', category: 'Agent' as PromoCategory, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=85' },
  { id: 'vip', title: 'VIP Union', subtitle: 'Your VIP Bonus', category: 'All' as PromoCategory, image: 'https://images.unsplash.com/photo-1560174038-da43ac74f01b?auto=format&fit=crop&w=1000&q=85' },
  { id: 'rebate', title: 'Unlimited Rebate', subtitle: 'Rewards on all Bets', category: 'Slot' as PromoCategory, image: 'https://images.unsplash.com/photo-1605870445919-838d190e8e1b?auto=format&fit=crop&w=1000&q=85' },
  { id: 'fishing', title: 'Fishing Bonus', subtitle: 'Higher Bets, Higher Gains', category: 'Fishing' as PromoCategory, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=85' },
  { id: 'cards', title: 'Cards Party', subtitle: 'Daily Wager Rewards', category: 'Cards' as PromoCategory, image: 'https://images.unsplash.com/photo-1541278107931-e006523892df?auto=format&fit=crop&w=1000&q=85' },
]

const promoCategories: { label: PromoCategory; icon: typeof LayoutGrid }[] = [
  { label: 'All', icon: LayoutGrid }, { label: 'Agent', icon: UserRound }, { label: 'Slot', icon: Spade }, { label: 'Mini Games', icon: Coins }, { label: 'Cards', icon: WalletCards }, { label: 'Fishing', icon: Fish },
]

function PromoPage({ onOpenDeposit }: { onOpenDeposit: () => void }) {
  const [tab, setTab] = useState<PromoTab>('Event')
  const [category, setCategory] = useState<PromoCategory>('All')
  const [claimed, setClaimed] = useState<string[]>([])
  const visibleBanners = category === 'All' ? promoBanners : promoBanners.filter((banner) => banner.category === 'All' || banner.category === category)

  return <main className="promo-page">
    <div className="promo-tabs"><button aria-label="Back to home"><ArrowLeft size={19} /></button>{(['Event', 'Mission', 'VIP', 'Rebate', 'Unclaimed'] as PromoTab[]).map((item) => <button className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}</div>
    {tab === 'Event' && <div className="promo-layout"><aside className="promo-sidebar">{promoCategories.map(({ label, icon: Icon }) => <button className={category === label ? 'active' : ''} onClick={() => setCategory(label)} key={label}><Icon size={18} /><span>{label}</span></button>)}<div className="sidebar-divider" /><button className="outline-action"><CalendarDays size={15} /> History</button><button className="outline-action" onClick={() => setClaimed([])}><RefreshCcw size={14} /> Refresh rewards</button></aside><section className="promo-feed"><div className="promo-feed-heading"><div><p className="eyebrow">REWARDS CENTER</p><h2>Featured promotions</h2></div><button className="text-button" onClick={onOpenDeposit}>Wallet <ChevronRight size={15} /></button></div><div className="promo-banner-grid">{visibleBanners.map((banner) => <article className="promo-banner-card" key={banner.id} style={{ backgroundImage: `linear-gradient(90deg, rgba(6, 8, 23, .78), rgba(6, 8, 23, .05)), url(${banner.image})` }}><div><p>{banner.category}</p><h3>{banner.title}</h3><strong>{banner.subtitle}</strong><button onClick={() => { setClaimed((current) => current.includes(banner.id) ? current : [...current, banner.id]); onOpenDeposit() }}>{claimed.includes(banner.id) ? 'Claimed' : 'View offer'} <ChevronRight size={14} /></button></div></article>)}</div></section></div>}
    {tab === 'Mission' && <section className="mission-panel"><div className="mission-progress"><div><p className="eyebrow">YOUR DAILY PROGRESS</p><h2><Coins size={18} /> 0 points</h2></div><button className="text-button">Details <ChevronRight size={14} /></button><div className="chest-track">{[1, 2, 3, 4].map((chest) => <div className="chest" key={chest}><span>▣</span><small>৳{chest * 50}</small></div>)}</div></div><div className="mission-filters"><button className="active">New player</button><button>Daily mission</button><button>Weekly mission</button><button className="refresh-button"><RefreshCcw size={14} /> Refresh</button></div>{['First deposit upon registration', 'First withdrawal', 'Add any social account', 'Login to the app'].map((task, index) => <div className="task-card" key={task}><div><span>{index === 0 ? '🎁' : index === 1 ? '💳' : '✨'}</span><b>{task}</b><small>Reward value · {27 + index * 10}.00</small></div><button onClick={onOpenDeposit}>Go</button></div>)}</section>}
    {tab === 'VIP' && <section className="vip-panel"><div className="vip-level-card"><div><p>Current level</p><h2>VIP <em>0</em></h2><span>Bet 1,000.00 to enjoy member benefits</span></div><div className="vip-medal">0<small>VIP</small></div></div><div className="vip-heading"><Trophy size={18} /> VIP reward list <Trophy size={18} /></div><div className="vip-switch"><button>VIP reward</button><button className="active">Rules</button></div><div className="rules-copy">{['From 00:00 on the 27th to 23:59:59 on the 27th of each month, please click the Receive button at the top of the VIP page to receive your rewards.', 'Customers who join Maltiplayx and upgrade to VIP 3 or above can enjoy bonus every month.', 'After placing a bet, the system will be updated every 10 minutes.', 'Promotion criteria: If you meet the VIP promotion requirements, you can be promoted to the corresponding VIP level and receive the corresponding promotion bonus.'].map((rule, index) => <p key={rule}><b>{index + 1}.</b> {rule}</p>)}</div></section>}
    {(tab === 'Rebate' || tab === 'Unclaimed') && <section className="empty-promos"><BadgeDollarSign size={42} /><h2>{tab === 'Rebate' ? 'Rebate rewards are on the way' : 'Nothing unclaimed yet'}</h2><p>Complete a promotion or mission and your rewards will appear here.</p><button className="gold-button" onClick={() => setTab('Event')}>Explore promotions <ChevronRight size={15} /></button></section>}
  </main>
}

function DepositModal({ onClose, user }: { onClose: () => void, user: any }) {
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [setting, setSetting] = useState<{ upiId: string, qrCodeUrl: string } | null>(null);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    fetch(API_BASE + '/wallet/settings', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setSetting(data))
    .catch(console.error);
  }, []);

  const submitDeposit = async () => {
    if (!user) { setMessage('Please login first'); return; }
    if (Number(amount) < 100) { setMessage('Minimum deposit is ₹100'); return; }
    if (!utr) { setMessage('UTR number is required'); return; }
    
    setLoading(true);
    try {
      const res = await fetch(API_BASE + '/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ amount: Number(amount), utrNumber: utr })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Deposit submitted successfully! Waiting for admin approval.');
        setAmount('');
        setUtr('');
      } else {
        setMessage(data.error || 'Deposit failed');
      }
    } catch (err) {
       setMessage('Network error');
    }
    setLoading(false);
  };

  return (
    <>
      <p className="eyebrow">DEPOSIT INR</p>
      <h2 style={{ marginBottom: '15px' }}>Add Funds to Wallet</h2>
      {setting ? (
         <div style={{ textAlign: 'center', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(143, 157, 215, 0.17)' }}>
           {setting.qrCodeUrl && <img src={setting.qrCodeUrl} alt="QR Code" style={{ width: '140px', height: '140px', borderRadius: '8px', margin: '0 auto 10px', background: '#fff', padding: '10px' }} />}
           <p style={{ margin: 0, fontSize: '15px', color: '#ccd6f6' }}>UPI ID: <b style={{ color: '#f4c35a', letterSpacing: '0.5px' }}>{setting.upiId}</b></p>
           <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#8898c6' }}>Scan QR or copy UPI ID to pay. Minimum <strong style={{ color: '#fff' }}>₹100</strong>.</p>
         </div>
      ) : <p style={{ textAlign: 'center', color: '#8898c6' }}>Loading payment details...</p>}
      
      {message && <p style={{ color: message.includes('success') ? '#00d13b' : '#ff4444', marginBottom: '15px', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>{message}</p>}
      
      <label>Amount (₹)<input type="number" placeholder="e.g. 500" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
      <label>12-Digit UTR/Ref Number<input type="text" placeholder="e.g. 301234567890" value={utr} onChange={(e) => setUtr(e.target.value)} /></label>
      <button className="gold-button full" onClick={submitDeposit} disabled={loading} style={{ marginTop: '10px' }}>{loading ? 'Submitting...' : <>Submit Request <ChevronRight size={17} /></>}</button>
    </>
  );
}

function App() {
  const [categories, setCategories] = useState<Category[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [activeCategory, setActiveCategory] = useState('slots')
  const [activeProvider, setActiveProvider] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'login' | 'deposit' | 'register' | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'home' | 'promos' | 'vip' | 'profile' | 'fairplay' | 'support'>('home')
  const [inrFilter, setInrFilter] = useState(true)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [providerList, setProviderList] = useState<string[]>([]);
  const [providerGameFilter, setProviderGameFilter] = useState<'All' | 'Slots' | 'Aviator' | 'Dragon Tiger' | 'Triple 7' | 'Suspended'>('All');

  const [mainNavTab, setMainNavTab] = useState<'explore' | 'games' | 'fantasy' | 'casino' | 'sports'>('explore');
  const [user, setUser] = useState<Account | null>(null);
  const updateWalletBalance = useCallback((balance: number) => {
    setUser(current => current && current.balance !== balance ? { ...current, balance } : current);
  }, []);
  const refreshWalletBalance = useCallback(async () => {
    try {
      const wallet = await getBalance();
      updateWalletBalance(wallet.balance);
    } catch (error) {
      console.error('Wallet balance refresh failed:', error);
    }
  }, [updateWalletBalance]);
  const [authForm, setAuthForm] = useState(() => ({
    email: '',
    phone: '',
    identifier: '',
    password: '',
    confirmPassword: '',
    referralCode: new URLSearchParams(window.location.search).get('ref')?.trim().toUpperCase() || ''
  }));
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [supportWhatsApp, setSupportWhatsApp] = useState<string | null>(null);
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroBannersList.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      setHeroSlide((prev) => (prev + 1) % heroBannersList.length);
    } else if (diff < -40) {
      setHeroSlide((prev) => (prev - 1 + heroBannersList.length) % heroBannersList.length);
    }
    touchStartX.current = null;
  };

  const handleBannerAction = (actionType: string) => {
    if (actionType === 'fairplay') {
      setView('fairplay');
    } else if (actionType === 'deposit') {
      openDeposit();
    } else if (actionType === 'dragontiger' || actionType === 'mines') {
      const gm = games.find(g => g.slug === 'dragon-tiger-on' || g.slug === 'dragon-tiger-joker' || g.slug === 'dragon-tiger-2-mac88' || g.name.toLowerCase().includes('dragon')) || games[0];
      if (gm) launch(gm);
    } else if (actionType === 'aviator') {
      const av = games.find(g => g.name.toLowerCase().includes('aviator')) || games[0];
      if (av) launch(av);
    } else if (actionType === 'slots') {
      setActiveCategory('slots');
    }
  };
  
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeProvider && sidebarRef.current) {
      if (activeProvider === 'JILI') {
        sidebarRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const activeBtn = document.getElementById(`provider-btn-${activeProvider}`);
        if (activeBtn) {
          const offsetTop = activeBtn.offsetTop;
          const currentScroll = sidebarRef.current.scrollTop;
          const containerHeight = sidebarRef.current.clientHeight;
          
          if (offsetTop < currentScroll || offsetTop + activeBtn.clientHeight > currentScroll + containerHeight) {
             sidebarRef.current.scrollTo({ top: offsetTop - 20, behavior: 'smooth' });
          }
        }
      }
    }
  }, [activeProvider]);
  const [providerTab, setProviderTab] = useState('All');
  const [bannerIndex, setBannerIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      const width = sliderRef.current.clientWidth;
      sliderRef.current.scrollTo({ left: width * bannerIndex, behavior: 'smooth' });
    }
  }, [bannerIndex]);

  useEffect(() => {
    liveGameProvider.getCategories().then(setCategories)
    liveGameProvider.getProviders('SLOT').then(setProviderList)
    apiClient.get<{ configured: boolean; whatsappNumber: string | null }, { configured: boolean; whatsappNumber: string | null }>('/support/settings')
      .then(settings => setSupportWhatsApp(settings.configured ? settings.whatsappNumber : null))
      .catch(error => console.error('Support settings could not be loaded:', error));
    
    // Check auth on load
    const token = localStorage.getItem('token');
    if (token) {
      fetch(API_BASE + '/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'SUCCESS') setUser(data.user);
        else localStorage.removeItem('token');
      })
      .catch(() => localStorage.removeItem('token'));
    }
  }, [])

  const openSupport = () => {
    if (!supportWhatsApp) {
      setView('support');
      return;
    }
    window.open(`https://wa.me/${supportWhatsApp}`, '_blank', 'noopener,noreferrer');
  };

  const openDeposit = () => {
    if (!user) {
      setAuthError('');
      setModal('register');
      return;
    }
    setModal('deposit');
  };

  useEffect(() => {
    if (!user?.id) return;
    void refreshWalletBalance();
    const interval = window.setInterval(() => { void refreshWalletBalance(); }, 20000);
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') void refreshWalletBalance();
    };
    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, [refreshWalletBalance, user?.id]);

  // Automated 10-minute server API heartbeat ping (keeps server alive 24/7)
  useEffect(() => {
    const pingServer = () => {
      fetch(`${API_BASE}/ping`).catch(() => {});
    };
    pingServer(); // Immediate ping on initial load
    const pingInterval = window.setInterval(pingServer, 10 * 60 * 1000); // Every 10 minutes (600,000 ms)
    return () => window.clearInterval(pingInterval);
  }, []);

  // Debounce Search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setGames([]);
    setHasMore(true);
    setLoadingMore(false);
  }, [inrFilter, activeProvider, debouncedSearch, providerGameFilter]);

  // Fetch Games (paginated)
  useEffect(() => {
    let cancelled = false;
    const fetchGames = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const apiCategory = activeProvider && providerGameFilter === 'Slots' ? 'SLOT' : 'all';
      const apiSearch = activeProvider && providerGameFilter === 'Aviator'
        ? 'aviator'
        : debouncedSearch;
      const apiGameType = activeProvider && ['Dragon Tiger', 'Triple 7', 'Suspended'].includes(providerGameFilter)
        ? providerGameFilter
        : undefined;
      const loadFullHomeCatalog = !activeProvider && !debouncedSearch;
      const pageLimit = loadFullHomeCatalog ? 100 : 40;
      const result = await liveGameProvider.getGames(apiCategory, inrFilter, activeProvider || 'All', apiSearch, page, pageLimit, apiGameType);
      let fetchedGames = result.games;
      let totalPages = result.pagination.totalPages;

      if (loadFullHomeCatalog && page === 1) {
        for (let nextPage = 2; nextPage <= totalPages; nextPage += 1) {
          try {
            const nextResult = await liveGameProvider.getGames(apiCategory, inrFilter, 'All', apiSearch, nextPage, pageLimit, apiGameType);
            if (nextResult && nextResult.games && nextResult.games.length > 0) {
              fetchedGames = [...fetchedGames, ...nextResult.games];
              totalPages = Math.max(totalPages, nextResult.pagination.totalPages);
            } else {
              break;
            }
          } catch (err) {
            console.warn('Pagination load fallback for page', nextPage, err);
            break;
          }
        }
      }

      if (cancelled) return;
      setGames(prev => {
         if (page === 1) return fetchedGames;
         // Prevent duplicates
         const existingIds = new Set(prev.map(g => g.id));
         const newGames = fetchedGames.filter(g => !existingIds.has(g.id));
         return [...prev, ...newGames];
      });
      
      setHasMore(!loadFullHomeCatalog && result.pagination.page < result.pagination.totalPages);
      setLoading(false);
      setLoadingMore(false);
    };
    fetchGames();
    return () => { cancelled = true; };
  }, [page, inrFilter, activeProvider, debouncedSearch, providerGameFilter]);

  // Only paginate actual game lists; the home provider directory is already complete.
  useEffect(() => {
    if (!activeProvider && !debouncedSearch) return;

    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
        if (!loading && !loadingMore && hasMore) {
          setPage(prev => prev + 1);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeProvider, debouncedSearch, loading, loadingMore, hasMore]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.category-section');
      let currentCategory = activeCategory;
      let minDistance = Infinity;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      
      sections.forEach((section: any) => {
        const rect = section.getBoundingClientRect();
        // Check which section is closest to top viewport (offset by header ~150px)
        const distance = Math.abs(rect.top - 150);
        if (distance < minDistance && rect.top < window.innerHeight / 2) {
          minDistance = distance;
          currentCategory = section.id.replace('category-', '');
        }
      });
      if (currentCategory && currentCategory !== activeCategory) {
        setActiveCategory(currentCategory);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeCategory]);

  const isSuspendedGame = (game: Game) =>
    (Boolean(game.status) && game.status?.toUpperCase() !== 'ACTIVE') || game.isActive === false;

  // filteredGames is just games now, because search is handled by backend
  const filteredGames = activeProvider && providerGameFilter === 'Suspended'
    ? games.filter(isSuspendedGame)
    : games.filter(game => !isSuspendedGame(game));
  const getHomeGameCategory = (game: Game) => {
    const category = game.category.trim().toLowerCase();
    const name = game.name.trim().toLowerCase();
    const subCategory = game.subCategory?.trim().toLowerCase();
    if (subCategory === 'aviator' || subCategory === 'other' || subCategory === 'cards') return subCategory;
    if (name === 'aviator extra bet') return 'minigames';
    if (name.includes('aviator')) return 'aviator';
    if (/dragon[\s-]*tiger/i.test(name)) return 'dragon-tiger';
    if (name.includes('fish') || category.includes('fish')) return 'fishing';
    if (category.includes('card') || category === 'cards' || category === 'roulette' || /cards?|judgement|arena of cards|poker|baccarat|teen.?patti|pokdeng/i.test(name)) return 'cards';
    if (['slot', 'slots'].includes(category)) return 'slots';
    if (category.includes('lottery')) return 'lottery';
    if (category.includes('live') || category === 'casino') return 'live';
    if (['mini', 'arcade', 'crash', 'hundred-player'].includes(category)) return 'minigames';
    if (category.includes('sport')) return 'sports';
    if (category.includes('cockfight') || category.includes('cock-fight')) return 'cockfight';
    return 'other';
  };
  const getHomeCategoryGames = (categoryId: string) => filteredGames.filter(game =>
    categoryId === 'hot' ? game.isHot : getHomeGameCategory(game) === categoryId
  );
  const homeCategoryOptions = [
    { id: 'slots', label: 'Slots', image: '/category/cat-slots.jpg' },
    { id: 'minigames', label: 'Mini Games', image: '/category/cat-minigames.jpg' },
    { id: 'aviator', label: 'Aviator', image: '/category/cat-aviator.jpg' },
    { id: 'cards', label: 'Cards', image: '/category/cat-cards.jpg' },
    { id: 'live', label: 'Live Casino', image: '/category/cat-live.jpg' },
    { id: 'fishing', label: 'Fish', image: '/category/cat-fish.jpg' },
    { id: 'lottery', label: 'Lottery', image: '/icons/25-coins-santas-jackpot.webp' },
    { id: 'sports', label: 'Sports', image: '/icons/aviator.jpg' },
    { id: 'other', label: 'More', image: '/icons/diamond-treasure.webp' },
  ].filter(option =>
    getHomeCategoryGames(option.id).length > 0
    || ['slots', 'minigames', 'aviator', 'cards', 'live', 'fishing', 'lottery'].includes(option.id)
  );
  const providerGames = filteredGames
    .filter(game => game.provider === activeProvider)
    .filter(game => providerGameFilter !== 'Slots' || game.category.toUpperCase() === 'SLOT' || game.category.toLowerCase() === 'slots')
    .filter(game => providerGameFilter !== 'Aviator' || (game.name.toLowerCase().includes('aviator') && game.name.toLowerCase() !== 'aviator extra bet'))
    .filter(game => providerGameFilter !== 'Dragon Tiger' || /dragon[\s-]*tiger/i.test(game.name))
    .filter(game => providerGameFilter !== 'Triple 7' || /triple[\s-]*(?:7|seven)|7\s*7\s*7|777/i.test(game.name))
    .filter(game => providerGameFilter === 'Suspended' ? isSuspendedGame(game) : !isSuspendedGame(game))
    .filter(game => !search || game.name.toLowerCase().includes(search.trim().toLowerCase()))
    .filter(game => {
      if (providerTab === 'Hot') return game.isHot;
      if (providerTab === 'Recent') return game.isNew;
      if (providerTab === 'Favorites') return favorites.includes(game.id);
      return true;
    });

  const dynamicProviders = useMemo(() => {
    const source = providerList.length ? providerList : games.map(g => g.provider);
    const provs = Array.from(new Set(source.filter((provider): provider is string =>
      Boolean(provider?.trim()) && !/^[a-f\d]{24,}$/i.test(provider.trim())
    )));
    const top = ['JILI', 'PG', 'JDB', 'Playtech', 'Big Time Gaming', 'NetEnt', 'RSG', 'DB Slots', 'Redtiger', 'YGR', 'BBIN', 'HB', 'CHOICE', 'VA', 'MW', 'BGaming'];
    const topExisting = top.filter(t => provs.includes(t));
    const rest = provs.filter(p => !top.includes(p)).sort();
    return Array.from(new Set([...topExisting, ...rest]));
  }, [games, providerList]);

  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

    const renderGameCard = (game: Game) => {
    const isSupported = !game.supportedCurrencies || game.supportedCurrencies.includes('INR');
    const isSuspended = isSuspendedGame(game);
    const logoSrc = getGameLogo(game);
    const hash = (game.name + game.id).split('').reduce((acc, c) => (acc * 33 + c.charCodeAt(0)) >>> 0, 5381);
    const players = (350 + (hash % 6200)).toLocaleString('en-IN');

    return (
      <article
        className="come-card"
        key={game.id}
        onClick={() => {
          if (isSupported && !isSuspended) launch(game);
        }}
      >
        <div className="come-card-thumb-wrap">
          <img 
            src={logoSrc} 
            alt={game.name} 
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src.includes('slot_main.jpg')) return;
              target.src = '/icons/slot_main.jpg';
            }} 
          />
        </div>
        <div className="come-card-title" title={game.name}>
          {game.name}
        </div>
        <div className="come-card-sub">
          {game.provider || 'Originals'}
        </div>
        <div className="come-live-players">
          <span className="come-live-dot">●</span>
          <span>{players} playing</span>
        </div>
      </article>
    );
  };

  const renderComeCard = (g: {
    id: string;
    slug?: string;
    name: string;
    sub: string;
    image: string;
    players: string;
  }) => {
    return (
      <article
        key={g.id}
        className="come-card"
        onClick={() => {
          let matched = games.find(gm => gm.slug === g.slug);
          if (!matched && g.id) {
            matched = games.find(gm => gm.id === g.id);
          }
          if (!matched) {
            matched = games.find(gm => gm.name.toLowerCase() === g.name.toLowerCase());
          }
          if (!matched) {
            if (g.name.toLowerCase().includes('aviator')) {
              matched = games.find(gm => gm.slug === 'spribe_aviator') || games.find(gm => gm.name.toLowerCase().includes('aviator'));
            } else if (g.name.toLowerCase().includes('chicken')) {
              matched = games.find(gm => gm.slug === 'chicken-road') || games.find(gm => gm.gameUid === '2126c5c458316ba1f2df65b387b60408') || games.find(gm => gm.slug === 'chicken-hot-run-expanse');
            } else if (g.name.toLowerCase().includes('dragon') || g.name.toLowerCase().includes('tiger')) {
              matched = games.find(gm => gm.slug === 'dragon-tiger-on' || gm.slug === 'dragon-tiger-joker' || gm.slug === 'dragon-tiger-2-mac88') || games.find(gm => gm.name.toLowerCase().includes('dragon'));
            } else if (g.name.toLowerCase().includes('ludo') || (g.slug && g.slug.includes('ludo'))) {
              matched = games.find(gm => gm.slug === 'ludo') || games.find(gm => gm.gameUid === '98bcfab0b0808eb3063b559049afd0e9') || games.find(gm => gm.name.toLowerCase().includes('ludo'));
            } else if (g.name.toLowerCase().includes('mines')) {
              matched = games.find(gm => gm.slug === 'mines-jdb');
            }
          }
          if (matched) {
            launch(matched);
          } else {
            if (g.name.toLowerCase().includes('ludo') || (g.slug && g.slug.includes('ludo'))) {
              launch({
                id: 'ludo',
                slug: 'ludo',
                gameUid: '98bcfab0b0808eb3063b559049afd0e9',
                providerId: '98bcfab0b0808eb3063b559049afd0e9',
                name: 'Ludo',
                provider: 'GameCloud',
                category: 'ARCADE',
                image: '/icons/games/ludo.jpg',
                accent: '#ffaa00',
                supportedCurrencies: ['INR'],
                status: 'ACTIVE',
                isActive: true
              } as any);
            } else if (g.name.toLowerCase().includes('chicken')) {
              launch({
                id: 'chicken-road',
                slug: 'chicken-road',
                gameUid: '2126c5c458316ba1f2df65b387b60408',
                providerId: '2126c5c458316ba1f2df65b387b60408',
                name: 'Chicken Road',
                provider: 'GameCloud',
                category: 'CRASH',
                image: '/icons/games/chicken.jpg',
                accent: '#ffaa00',
                supportedCurrencies: ['INR'],
                status: 'ACTIVE',
                isActive: true
              } as any);
            } else if (g.name.toLowerCase().includes('dragon') || g.name.toLowerCase().includes('tiger')) {
              launch({
                id: 'dragon-tiger-on',
                slug: 'dragon-tiger-on',
                gameUid: 'dragon-tiger-on',
                providerId: 'dragon-tiger-on',
                name: 'Dragon Tiger',
                provider: 'GameCloud',
                category: 'TABLE',
                image: '/icons/games/dragon-tiger.jpg',
                accent: '#ffaa00',
                supportedCurrencies: ['INR'],
                status: 'ACTIVE',
                isActive: true
              } as any);
            } else if (g.name.toLowerCase().includes('aviator')) {
              launch({
                id: 'spribe_aviator',
                slug: 'spribe_aviator',
                gameUid: 'spribe_aviator',
                providerId: 'spribe_aviator',
                name: 'Aviator',
                provider: 'GameCloud',
                category: 'CRASH',
                image: '/icons/games/aviator.jpg',
                accent: '#ffaa00',
                supportedCurrencies: ['INR'],
                status: 'ACTIVE',
                isActive: true
              } as any);
            } else {
              launch({
                id: g.id || g.slug,
                slug: g.slug,
                gameUid: g.slug,
                providerId: g.slug,
                name: g.name,
                provider: 'GameCloud',
                category: 'ARCADE',
                image: g.image,
                accent: '#ffaa00',
                supportedCurrencies: ['INR'],
                status: 'ACTIVE',
                isActive: true
              } as any);
            }
          }
        }}
      >
        <div className="come-card-thumb-wrap">
          <img
            src={g.image}
            alt={g.name}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/icons/slot_main.jpg';
            }}
          />
        </div>
        <div className="come-card-title">{g.name}</div>
        <div className="come-card-sub">{g.sub}</div>
        <div className="come-live-players">
          <span className="come-live-dot">●</span>
          <span>{g.players} playing</span>
        </div>
      </article>
    );
  };

  const renderProviderLogo = (provider: string) => {
    if (provider === 'JILI') return <div style={{ fontSize: '14px', fontWeight: '900', color: '#ffcc00', textShadow: '1px 1px 0 #000, 0 0 4px #000', fontStyle: 'italic', flexShrink: 0 }}>JILI</div>;
    if (provider === 'PG') return <div style={{ fontSize: '14px', fontWeight: '900', color: '#fff', textShadow: '0 0 3px #00f, 0 0 5px #00f', letterSpacing: '-1px', flexShrink: 0 }}>PG</div>;
    if (provider === 'JDB') return <div style={{ fontSize: '14px', fontWeight: '900', color: '#d32f2f', textShadow: '1px 1px 0 #ffcc00, -1px -1px 0 #ffcc00, 1px -1px 0 #ffcc00, -1px 1px 0 #ffcc00', fontStyle: 'italic', flexShrink: 0 }}>JDB</div>;
    if (provider === 'WG') return <div style={{ fontSize: '14px', fontWeight: '900', flexShrink: 0 }}><span style={{color:'#4caf50'}}>W</span><span style={{color:'#2196f3'}}>G</span></div>;
    if (provider === 'MG') return <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #00bcd4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00bcd4', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>M</div>;
    if (provider === 'BNG') return <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4caf50', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>b</div>;
    if (provider === 'CQ9') return <div style={{ fontSize: '14px', fontWeight: '900', color: '#ffb300', flexShrink: 0 }}>CQ9</div>;
    if (provider === 'YellowBat') return <div style={{ fontSize: '14px', fontWeight: '900', color: '#ffeb3b', flexShrink: 0 }}>YB</div>;
    if (provider === 'NolimitCity') return <div style={{ fontSize: '10px', fontWeight: '900', flexShrink: 0, display: 'flex', flexDirection: 'column', lineHeight: 1 }}><span style={{color:'#ffeb3b'}}>NOLIMIT</span><span style={{color:'#fff'}}>CITY</span></div>;
    if (provider === 'Playtech') return <div style={{ width: '22px', height: '14px', borderRadius: '50%', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', flexShrink: 0, fontStyle: 'italic' }}>PT</div>;
    if (provider === 'Big Time Gaming') return <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d32f2f', fontSize: '8px', fontWeight: 'bold', flexShrink: 0 }}>BTG</div>;
    if (provider === 'NetEnt') return <div style={{ fontSize: '12px', fontWeight: '900', color: '#4caf50', flexShrink: 0 }}>NET</div>;
    if (provider === 'RSG') return <div style={{ fontSize: '16px', flexShrink: 0 }}>👑</div>;
    if (provider === 'DB Slots') return <div style={{ fontSize: '10px', fontWeight: '900', flexShrink: 0, color: '#e91e63', border: '1px solid #e91e63', borderRadius: '4px', padding: '1px 3px' }}>DB</div>;
    if (provider === 'Redtiger') return <div style={{ fontSize: '16px', flexShrink: 0 }}>🐅</div>;
    if (provider === 'YGR') return <div style={{ fontSize: '10px', fontWeight: '900', color: '#d32f2f', border: '1px solid #d32f2f', padding: '1px 4px', borderRadius: '10px', flexShrink: 0 }}>YGR</div>;
    if (provider === 'BBIN') return <div style={{ fontSize: '14px', fontWeight: '900', color: '#f44336', flexShrink: 0 }}>bb<span style={{color:'#fff', fontWeight: 'normal'}}>in</span></div>;
    if (provider === 'HB') return <div style={{ width: '18px', height: '20px', background: '#ff5722', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 'bold', flexShrink: 0, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>HB</div>;
    if (provider === 'CHOICE') return <div style={{ fontSize: '9px', fontWeight: '900', color: '#fff', border: '1px solid #4caf50', borderRadius: '4px', padding: '1px 3px', flexShrink: 0 }}>CHOICE</div>;
    if (provider === 'VA') return <div style={{ fontSize: '14px', fontWeight: '900', color: '#00bcd4', flexShrink: 0, fontStyle: 'italic' }}>VA</div>;
    if (provider === 'MW') return <div style={{ fontSize: '14px', fontWeight: '900', color: '#ffeb3b', flexShrink: 0, textShadow: '0 0 2px #fff' }}>MW</div>;
    if (provider === 'BGaming') return <div style={{ width: '16px', height: '16px', background: '#ffeb3b', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0, borderRadius: '2px' }}>B</div>;
    
    return <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{provider.slice(0,3)}</div>;
  };

  const launch = async (game: Game) => {
    if (!user) {
      setAuthError('');
      setModal('register');
      return;
    }
    
    try {
      const session = await liveGameProvider.launchGame(game);
      if (session?.sessionUrl) {
        window.location.href = session.sessionUrl; // Use full page redirect as it's an external provider game
      }
    } catch (error) {
      console.error("Failed to launch game", error)
    }
  }

  const handleRegister = async () => {
    setAuthError('');
    if (!authForm.email.trim() || !authForm.phone.trim()) {
      return setAuthError('Email and phone number are both required.');
    }
    if (authForm.password !== authForm.confirmPassword) {
      return setAuthError('Passwords do not match.');
    }
    setAuthLoading(true);
    try {
      const res = await fetch(API_BASE + '/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authForm.email,
          phone: authForm.phone,
          password: authForm.password,
          confirmPassword: authForm.confirmPassword,
          referralCode: authForm.referralCode || undefined
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setAuthForm({
          ...authForm,
          identifier: authForm.email,
          password: '',
          confirmPassword: ''
        });
        setAuthError('');
        setModal('login');
      } else {
        setAuthError(data.message || 'Registration failed');
      }
    } catch (e) {
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    setAuthError('');
    if (!authForm.identifier.trim() || !authForm.password) {
      return setAuthError('Enter your email or phone number and password.');
    }
    setAuthLoading(true);
    try {
      const res = await fetch(API_BASE + '/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: authForm.identifier, password: authForm.password })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setModal(null);
        setAuthForm({ email: '', phone: '', identifier: '', password: '', confirmPassword: '', referralCode: '' });
      } else {
        setAuthError(data.message || 'Login failed');
      }
    } catch (e) {
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setView('profile');
  };

  return (
    <div className="malt-viewport">
      <div className="malt-shell">
        {!activeProvider && !promoDismissed && (
          <div className="malt-promo-bar">
            <div className="malt-promo-left">
              <span className="malt-promo-gift">🎁</span>
              <span className="malt-promo-title">Download App Bonus</span>
              <span className="malt-promo-desc">Get exclusive rewards on our app!</span>
            </div>
            <div className="malt-promo-actions">
              <a
                href="/Maltiplayx.apk"
                download="Maltiplayx.apk"
                className="malt-promo-dl-btn"
                title="Download MaltiplayX Android APK"
              >
                Download now
              </a>
              <button
                className="malt-promo-close"
                onClick={() => setPromoDismissed(true)}
                aria-label="Dismiss banner"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

                <header className="come-header">
          {activeProvider ? (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setActiveProvider(null)}
                  style={{ background: 'transparent', border: 'none', color: '#fff', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  aria-label="Back to Lobby"
                >
                  <ChevronRight style={{ transform: 'rotate(180deg)' }} />
                </button>
                <div className="come-logo" onClick={() => { setActiveProvider(null); setView('home'); }}>
                  <span>Come</span>
                </div>
              </div>
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                style={{ background: 'transparent', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {categories.find(c => c.id === activeCategory)?.label || 'Slot'} <ChevronRight size={14} style={{ transform: showCategoryDropdown ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }} />
              </button>
            </div>
          ) : (
            <>
              <div className="come-logo" onClick={() => { setMainNavTab('explore'); setView('home'); }}>
                <span>Come</span>
              </div>

              <div className="come-header-right">
                <div
                  className="come-flag-pill"
                  onClick={openDeposit}
                  title="Click to deposit funds"
                >
                  <span style={{ fontSize: '15px' }}>🇮🇳</span>
                  <span>{user ? Number(user.balance).toFixed(1) : '0.3'}</span>
                  <span style={{ fontSize: '10px', color: '#8e96b5' }}>▾</span>
                </div>

                <button
                  className="come-wallet-btn"
                  onClick={openDeposit}
                  title="Add Funds / Deposit"
                  aria-label="Deposit"
                >
                  <WalletCards size={17} />
                </button>

                <button
                  className="come-icon-btn"
                  onClick={() => alert('No new notifications')}
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="badge-dot" />
                </button>

                <div
                  className="come-avatar"
                  onClick={() => setView('profile')}
                  title="Open Profile"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'User'}&backgroundColor=f4c35a`}
                    alt="Avatar"
                  />
                </div>
              </div>
            </>
          )}

          {showCategoryDropdown && activeProvider && (
            <div style={{ position: 'absolute', top: '54px', left: 0, right: 0, background: '#0a0f2c', zIndex: 10, padding: '16px 12px', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', borderBottom: '1px solid rgba(143, 157, 215, 0.2)', boxShadow: '0 15px 30px rgba(0,0,0,0.6)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[...categories, { id: 'recent', label: 'Recent', icon: <span style={{fontSize:'14px'}}>🕒</span> }, { id: 'favorites', label: 'Favorite', icon: <span style={{fontSize:'14px', color: '#f4c35a'}}>⭐</span> }].map(cat => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setShowCategoryDropdown(false);
                        setActiveProvider(null);
                        setTimeout(() => document.getElementById(`category-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' }), 100);
                      }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '10px 4px', borderRadius: '8px', border: isActive ? 'none' : '1px solid rgba(143, 157, 215, 0.3)', background: isActive ? '#fde3a7' : 'transparent', color: isActive ? '#16142b' : '#ccd6f6', fontSize: '11px', fontWeight: 'bold', flexDirection: 'row', wordBreak: 'break-word', lineHeight: '1.2' }}
                    >
                      {(cat as any).image ? (
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ width: '100%', height: '100%', backgroundImage: `url(${(cat as any).image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        </div>
                      ) : (
                        cat.icon
                      )}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </header>

        {/* Top 5 Icon Navigation Tabs matching screenshot */}
        {!activeProvider && (
          <nav className="come-top-nav">
            {[
              { id: 'explore', label: 'Explore', icon: '🔥' },
              { id: 'games', label: 'Games', icon: '🎮' },
              { id: 'fantasy', label: 'Fantasy', icon: '🏆' },
              { id: 'casino', label: 'Casino', icon: '🎰' },
              { id: 'sports', label: 'Sports', icon: '⚽' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`come-nav-tab ${mainNavTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setMainNavTab(tab.id as any);
                  if (tab.id === 'casino') setActiveCategory('slots');
                  else if (tab.id === 'sports') setActiveCategory('sports');
                  else if (tab.id === 'games') setActiveCategory('minigames');
                  else if (tab.id === 'fantasy') setActiveCategory('aviator');
                  else setActiveCategory('hot');
                }}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        )}

        {view === 'promos'
          ? <InvitePromoPage user={user} onHome={() => setView('home')} onLogin={() => setModal('login')} onOpenDeposit={openDeposit} />
          : view === 'vip'
            ? <VipPage user={user} onHome={() => setView('home')} onLogin={() => setModal('login')} />
            : view === 'profile'
              ? <ProfilePage user={user} onHome={() => setView('home')} onLogin={() => setModal('login')} onLogout={handleLogout} onDeposit={openDeposit} onBalanceUpdate={updateWalletBalance} onOpenVip={() => setView('vip')} whatsappNumber={supportWhatsApp} />
              : view === 'fairplay'
                ? <FairPlayPage onHome={() => setView('home')} />
                : view === 'support'
                  ? <SupportPage whatsappNumber={supportWhatsApp} onHome={() => setView('home')} />
                                    : <main style={{ paddingBottom: '90px' }}>
          {!activeProvider && (
            <>
              {/* Guest Auth Bar on Page */}
              {!user && (
                <div className="malt-guest-strip">
                  <div className="malt-guest-strip-left">
                    <span className="malt-guest-chip">GUEST</span>
                    <span className="malt-guest-text">Login to play & win real cash</span>
                  </div>
                  <div className="malt-guest-strip-actions">
                    <button
                      type="button"
                      className="malt-guest-btn-login"
                      onClick={() => { setAuthError(''); setModal('login'); }}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className="malt-guest-btn-signup"
                      onClick={() => { setAuthError(''); setModal('register'); }}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}

              {mainNavTab === 'explore' && !search ? (
                <>
                  {/* Hero Promotional Auto-sliding Carousel Banner */}
                  <div
                    className="come-carousel-wrapper"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div
                      className="come-carousel-track"
                      style={{ transform: `translateX(-${heroSlide * 100}%)` }}
                    >
                      {heroBannersList.map((b) => (
                        <div
                          key={b.id}
                          className="come-carousel-slide"
                          style={{ background: b.gradient }}
                          onClick={() => handleBannerAction(b.actionType)}
                        >
                          <div className="come-hero-content">
                            <div className="come-hero-rtp" style={{ color: b.titleColor }}>
                              {b.title}
                            </div>
                            <div className="come-hero-sub">
                              {b.subtitle}
                            </div>
                            <div
                              className="come-fairplay-btn"
                              style={{
                                background: b.tagBg,
                                borderColor: b.tagBorder,
                                color: b.tagColor
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBannerAction(b.actionType);
                              }}
                            >
                              {b.tag}
                              {b.tagIcon === 'shield' && <ShieldCheck size={13} />}
                              {b.tagIcon === 'zap' && <Zap size={13} />}
                              {b.tagIcon === 'sparkles' && <Sparkles size={13} />}
                              {b.tagIcon === 'trophy' && <Trophy size={13} />}
                            </div>
                          </div>
                          <div className="come-hero-art">
                            <img
                              src={b.image}
                              alt={b.subtitle}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/welcome-banner.jpg';
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Active Dots indicator */}
                    <div className="come-carousel-dots">
                      {heroBannersList.map((_, idx) => (
                        <span
                          key={idx}
                          className={`come-carousel-dot ${heroSlide === idx ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setHeroSlide(idx);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Live Wins Section matching Screenshot */}
                  <div className="come-live-section">
                    <div className="come-section-header">
                      <h3 className="come-sec-title">
                        <span className="initial-yellow">L</span>ive wins
                      </h3>
                      <span className="come-all-bets" onClick={() => setMainNavTab('casino')}>All bets</span>
                    </div>
                    <div className="come-live-scroll">
                      {liveWinnersList.map((w, idx) => (
                        <div key={idx} className="come-win-card" onClick={() => {
                          const found = games.find(g => g.name.toLowerCase().includes(w.game.toLowerCase()));
                          if (found) launch(found);
                        }}>
                          <img src={w.image} alt={w.game} className="come-win-thumb" onError={(e) => { (e.target as HTMLImageElement).src = '/category/slot-new.png'; }} />
                          <div className="come-win-user">{w.user}</div>
                          <div className="come-win-amt">{w.amount}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recently Played matching Screenshot */}
                  <div style={{ padding: '0 14px' }}>
                    <div className="come-section-header">
                      <h3 className="come-sec-title">
                        <span className="initial-green">R</span>ecently Played
                      </h3>
                    </div>
                  </div>
                  <div className="come-game-grid">
                    {recentlyPlayedList.map(renderComeCard)}
                  </div>

                  {/* Originals - 99%RTP (8) matching Screenshot */}
                  <div style={{ padding: '0 14px', marginTop: '10px' }}>
                    <div className="come-section-header">
                      <h3 className="come-sec-title">
                        <span className="initial-yellow">O</span>riginals - 99%RTP (8)
                      </h3>
                    </div>
                  </div>
                  <div className="come-game-grid">
                    {originalsList.map(renderComeCard)}
                  </div>
                  <button className="come-load-more" onClick={() => setMainNavTab('games')}>
                    Load More ▾
                  </button>

                  {/* Casino (51) matching Screenshot */}
                  <div style={{ padding: '0 14px', marginTop: '10px' }}>
                    <div className="come-section-header">
                      <h3 className="come-sec-title">
                        <span className="initial-yellow">C</span>asino (51)
                      </h3>
                    </div>
                  </div>
                  <div className="come-game-grid">
                    {casinoList.map(renderComeCard)}
                  </div>
                  <button className="come-load-more" onClick={() => setMainNavTab('casino')}>
                    Load More ▾
                  </button>

                  {/* Free To Play (5) matching Screenshot */}
                  <div style={{ padding: '0 14px', marginTop: '10px' }}>
                    <div className="come-section-header">
                      <h3 className="come-sec-title">
                        <span className="initial-yellow">F</span>ree To Play ({freeToPlayList.length})
                      </h3>
                    </div>
                  </div>
                  <div className="come-game-grid">
                    {freeToPlayList.map(renderComeCard)}
                  </div>
                </>
              ) : null}

              {/* Game Search Bar */}
              <div className="malt-search-box" style={{ margin: '14px 14px 10px' }}>
                <Search size={18} color="#6977a4" />
                <input
                  id="game-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search working games..."
                />
                {search && (
                  <button className="malt-clear-search" onClick={() => setSearch('')}>
                    <X size={15} />
                  </button>
                )}
              </div>
            </>
          )}

          {/* Catalog & Games Display */}
          {(mainNavTab !== 'explore' || search || activeProvider) && (
            <section style={{ marginTop: activeProvider ? '10px' : '0' }}>
              {activeProvider ? (
                <div style={{ display: 'flex', gap: '12px', padding: '0 14px' }}>
                  <div ref={sidebarRef} className="category-sidebar" style={{ display: 'flex', flexDirection: 'column', width: '90px', flexShrink: 0, gap: '6px', maxHeight: 'calc(100vh - 140px)', overflowY: 'auto', paddingRight: '4px', position: 'sticky', top: '70px', zIndex: 5 }}>
                    {dynamicProviders.map(provider => (
                      <button
                        id={`provider-btn-${provider}`}
                        key={provider}
                        onClick={() => {
                          setActiveProvider(provider);
                          setProviderGameFilter('All');
                          setProviderTab('All');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 6px', background: activeProvider === provider ? 'rgba(255,255,255,0.08)' : 'transparent', border: activeProvider === provider ? '1px solid rgba(244,195,90,0.5)' : '1px solid transparent', borderRadius: '8px', color: activeProvider === provider ? '#f4c35a' : '#ccd6f6', cursor: 'pointer', textAlign: 'left', fontSize: '11px', fontWeight: 'bold' }}
                      >
                        {renderProviderLogo(provider)}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{provider}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div className="provider-category-filters" style={{ margin: '0 0 12px' }}>
                      {(['All', 'Slots', 'Aviator', 'Dragon Tiger', 'Triple 7', 'Suspended'] as const).map(filter => (
                        <button
                          key={filter}
                          type="button"
                          className={providerGameFilter === filter ? 'active' : ''}
                          onClick={() => {
                            setProviderGameFilter(filter);
                            setProviderTab('All');
                            setSearch('');
                          }}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>

                    <div className="come-game-grid" style={{ padding: 0 }}>
                      {providerGames.length ? providerGames.map(renderGameCard) : (
                        <div className="empty-state" style={{ gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center' }}>
                          <b>No games in this list</b>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="malt-catalog-header" style={{ padding: '0 14px 10px' }}>
                    <div className="malt-catalog-title-group">
                      <h2 className="malt-catalog-title">
                        {search ? `SEARCH: "${search.toUpperCase()}"` : (mainNavTab.toUpperCase() + ' GAMES')}
                      </h2>
                      <span className="malt-game-count">{filteredGames.length} GAMES</span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="come-game-grid">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="come-card">
                          <div className="come-card-thumb-wrap skeleton" />
                        </div>
                      ))}
                    </div>
                  ) : filteredGames.length ? (
                    <div className="come-game-grid">
                      {filteredGames.map(renderGameCard)}
                    </div>
                  ) : (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '40px 0', color: '#8898c6' }}>
                      <Search size={25} style={{ margin: '0 auto 10px' }} />
                      <b>No games found</b>
                    </div>
                  )}

                  {loadingMore && (
                    <div className="come-game-grid" style={{ marginTop: '10px' }}>
                      {[1, 2, 3].map((item) => (
                        <div key={`skel-${item}`} className="come-card">
                          <div className="come-card-thumb-wrap skeleton" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </main>}

        {/* 10. Floating Support Button */}
        <button
          className="malt-floating-support"
          aria-label="Open support"
          onClick={openSupport}
        >
          <Headphones size={22} />
        </button>

        {/* 11. Fixed Bottom Navigation */}
        <nav className="malt-bottom-nav">
          <button
            className={`malt-nav-btn ${view === 'home' ? 'active' : ''}`}
            onClick={() => setView('home')}
          >
            <Home size={21} />
            <span>Home</span>
          </button>
          <button
            className={`malt-nav-btn ${view === 'promos' ? 'active' : ''}`}
            onClick={() => setView('promos')}
          >
            <Gift size={21} />
            <span>Promos</span>
          </button>
          <button
            className="malt-deposit-btn"
            onClick={openDeposit}
            aria-label="Deposit"
          >
            <div className="malt-deposit-circle">
              <Zap size={23} fill="currentColor" />
            </div>
            <span className="malt-deposit-text">Deposit</span>
          </button>
          <button
            className={`malt-nav-btn ${view === 'vip' ? 'active' : ''}`}
            onClick={() => setView('vip')}
          >
            <Trophy size={21} />
            <span>VIP</span>
          </button>
          <button
            className={`malt-nav-btn ${view === 'profile' ? 'active' : ''}`}
            onClick={() => setView('profile')}
          >
            {user ? (
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #f4c35a' }}>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id || 'User'}&backgroundColor=f4c35a`}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <UserRound size={21} />
            )}
            <span>Profile</span>
          </button>
        </nav>
      </div>
      {modal && <div className="modal-backdrop" onClick={() => setModal(null)}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>
      {modal === 'login' ? <>
        <p className="eyebrow">WELCOME BACK</p><h2>Log in to play</h2><p className="modal-copy">Use the email or phone number on your account.</p>
        {authError && <p role="alert" style={{ color: '#ff7777', marginBottom: '10px' }}>{authError}</p>}
        <label>Email or phone number<input type="text" autoComplete="username" placeholder="name@example.com or phone number" value={authForm.identifier} onChange={(e) => setAuthForm({...authForm, identifier: e.target.value})} /></label>
        <label>Password<input type="password" autoComplete="current-password" placeholder="Enter your password" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} onKeyDown={(e) => { if (e.key === 'Enter') void handleLogin(); }} /></label>
        <button className="gold-button full" onClick={handleLogin} disabled={authLoading}>{authLoading ? 'Logging in...' : <>Log in <ChevronRight size={17} /></>}</button>
        <p className="modal-foot">New here? <b onClick={() => { setAuthError(''); setModal('register'); }} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Create an account</b></p>
      </> : modal === 'register' ? <>
        <p className="eyebrow">CREATE ACCOUNT</p><h2>Join Maltiplayx</h2><p className="modal-copy">Create an account to access games and your wallet.</p>
        {authError && <p role="alert" style={{ color: '#ff7777', marginBottom: '10px' }}>{authError}</p>}
        <label>Email address<input type="email" autoComplete="email" placeholder="name@example.com" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} /></label>
        <label>Phone number<input type="tel" autoComplete="tel" placeholder="e.g. +919876543210" value={authForm.phone} onChange={(e) => setAuthForm({...authForm, phone: e.target.value})} /></label>
        <label>Invite code (optional)<input type="text" placeholder="Enter your friend's code" maxLength={10} autoComplete="off" value={authForm.referralCode} onChange={(e) => setAuthForm({...authForm, referralCode: e.target.value.toUpperCase()})} /></label>
        <p className="referral-signup-note">Use a friend’s invite code to receive ₹30 after your first successful login.</p>
        <label>Password<input type="password" autoComplete="new-password" minLength={8} maxLength={128} placeholder="At least 8 characters" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} /></label>
        <label>Confirm password<input type="password" autoComplete="new-password" minLength={8} maxLength={128} placeholder="Re-enter your password" value={authForm.confirmPassword} onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})} onKeyDown={(e) => { if (e.key === 'Enter') void handleRegister(); }} /></label>
        <button className="gold-button full" onClick={handleRegister} disabled={authLoading}>{authLoading ? 'Creating...' : <>Register <ChevronRight size={17} /></>}</button>
        <p className="auth-privacy-note">Your password is securely hashed and is never visible to staff.</p>
        <p className="modal-foot">Already have an account? <b onClick={() => { setAuthError(''); setModal('login'); }} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Log in</b></p>
      </> : <>
        <DepositWorkflow onClose={() => setModal(null)} onRequestLogin={() => setModal('register')} user={user} onBalanceUpdate={updateWalletBalance} />
      </>}
      </div></div>}
    </div>
  )
}

export default App
