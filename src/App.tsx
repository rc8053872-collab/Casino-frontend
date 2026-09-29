import { useEffect, useMemo, useState } from 'react'
import { Bell, ChevronRight, Gift, Headphones, Home, LayoutGrid, Play, Search, ShieldCheck, Sparkles, Star, Trophy, UserRound, X, Zap, ArrowLeft, BadgeDollarSign, CalendarDays, ClipboardList, Coins, Fish, RefreshCcw, Spade, WalletCards } from 'lucide-react'
import { Category, Game, mockGameProvider } from './services/gameProvider'
import { DragonTigerGame } from './DragonTigerGame'

const winners = [
  { user: 'm***r', game: 'Neon Reels', amount: '$2,480.00', time: '2m ago' },
  { user: 'a***n', game: 'Royal Baccarat', amount: '$1,120.00', time: '4m ago' },
  { user: 'j***e', game: 'Moon Princess', amount: '$864.00', time: '8m ago' },
]

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
    {tab === 'VIP' && <section className="vip-panel"><div className="vip-level-card"><div><p>Current level</p><h2>VIP <em>0</em></h2><span>Bet 1,000.00 to enjoy member benefits</span></div><div className="vip-medal">0<small>VIP</small></div></div><div className="vip-heading"><Trophy size={18} /> VIP reward list <Trophy size={18} /></div><div className="vip-switch"><button>VIP reward</button><button className="active">Rules</button></div><div className="rules-copy">{['From 00:00 on the 27th to 23:59:59 on the 27th of each month, please click the Receive button at the top of the VIP page to receive your rewards.', 'Customers who join OrbitPlay and upgrade to VIP 3 or above can enjoy bonus every month.', 'After placing a bet, the system will be updated every 10 minutes.', 'Promotion criteria: If you meet the VIP promotion requirements, you can be promoted to the corresponding VIP level and receive the corresponding promotion bonus.'].map((rule, index) => <p key={rule}><b>{index + 1}.</b> {rule}</p>)}</div></section>}
    {(tab === 'Rebate' || tab === 'Unclaimed') && <section className="empty-promos"><BadgeDollarSign size={42} /><h2>{tab === 'Rebate' ? 'Rebate rewards are on the way' : 'Nothing unclaimed yet'}</h2><p>Complete a promotion or mission and your rewards will appear here.</p><button className="gold-button" onClick={() => setTab('Event')}>Explore promotions <ChevronRight size={15} /></button></section>}
  </main>
}

function App() {
  const [categories, setCategories] = useState<Category[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [activeCategory, setActiveCategory] = useState('hot')
  const [favorites, setFavorites] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'login' | 'deposit' | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'home' | 'promos' | 'dragon-tiger'>('home')

  useEffect(() => {
    mockGameProvider.getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    mockGameProvider.getGames(activeCategory).then((result) => {
      setGames(result)
      setLoading(false)
    })
  }, [activeCategory])

  const filteredGames = useMemo(() => games.filter((game) => game.name.toLowerCase().includes(search.toLowerCase())), [games, search])

  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  const launch = async (game: Game) => {
    if (game.name === 'Dragon Tiger') {
      setView('dragon-tiger')
      return
    }
    const session = await mockGameProvider.launchGame(game.id)
    window.alert(`Demo session ready for ${game.name}\n${session.sessionUrl}`)
  }

  if (view === 'dragon-tiger') {
    return <DragonTigerGame onClose={() => setView('home')} />
  }

  return (
    <div className="viewport">
      <div className="app-shell">
        <div className="promo-strip"><Gift size={16} /><span>Welcome bonus: <b>100% up to $500</b></span><button onClick={() => setModal('deposit')}>Claim now <ChevronRight size={14} /></button><button className="icon-button close-promo" aria-label="Close promotion"><X size={15} /></button></div>
        <header className="header">
          <div className="brand"><span className="brand-mark"><Sparkles size={19} /></span><span>ORBIT<span className="brand-accent">PLAY</span></span></div>
          <div className="header-actions"><button className="icon-button"><Bell size={19} /></button><button className="icon-button" onClick={() => document.getElementById('game-search')?.focus()}><Search size={20} /></button><button className="login-button" onClick={() => setModal('login')}>Log in</button></div>
        </header>

        {view === 'promos' ? <PromoPage onOpenDeposit={() => setModal('deposit')} /> : <main className="main-content">
          <section className="hero-banner">
            <div className="hero-copy"><p className="eyebrow"><Zap size={13} /> LIMITED TIME EVENT</p><h1>Play bold.<br /><em>Win brighter.</em></h1><p className="hero-description">Your next lucky moment is waiting in the Orbit.</p><button className="gold-button" onClick={() => setModal('deposit')}>Play now <ChevronRight size={17} /></button></div>
            <div className="hero-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="hero-coin">✦</div><div className="hero-star star-one">✦</div><div className="hero-star star-two">✧</div></div>
          </section>

          <div className="announcement"><div className="announcement-icon"><Bell size={14} /></div><span>Congratulations to <b>m***r</b> for winning <strong>$2,480.00</strong></span><ChevronRight size={15} /></div>

          <section className="section-block winners-section"><div className="section-heading"><div><p className="eyebrow">LIVE ACTIVITY</p><h2>Recent winners</h2></div><button className="text-button">View all <ChevronRight size={15} /></button></div><div className="winner-row">{winners.map((winner) => <div className="winner-card" key={winner.user}><div className="winner-avatar">{winner.user.charAt(0).toUpperCase()}</div><div className="winner-info"><b>{winner.user}</b><span>{winner.game}</span></div><div className="winner-amount"><b>{winner.amount}</b><span>{winner.time}</span></div></div>)}</div></section>

          <section className="quick-actions"><button onClick={() => setModal('deposit')}><span className="quick-icon gold"><Gift size={19} /></span><span>Promos</span></button><button><span className="quick-icon blue"><Trophy size={19} /></span><span>VIP club</span></button><button><span className="quick-icon pink"><Headphones size={19} /></span><span>Support</span></button><button><span className="quick-icon green"><ShieldCheck size={19} /></span><span>Fair play</span></button></section>

          <section className="section-block games-section"><div className="section-heading"><div><p className="eyebrow">EXPLORE THE LOBBY</p><h2>Games for you</h2></div><button className="text-button">All games <ChevronRight size={15} /></button></div><div className="search-wrap"><Search size={17} /><input id="game-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search games" />{search && <button className="clear-search" onClick={() => setSearch('')}><X size={14} /></button>}</div><div className="category-tabs">{categories.map((category) => <button className={activeCategory === category.id ? 'active' : ''} onClick={() => setActiveCategory(category.id)} key={category.id}><span>{category.icon}</span>{category.label}</button>)}</div>{loading ? <div className="game-grid">{[1, 2, 3, 4].map((item) => <div className="game-card skeleton" key={item} />)}</div> : filteredGames.length ? <div className="game-grid">{filteredGames.map((game) => <article className="game-card" key={game.id} onClick={() => launch(game)}><div className="game-image"><img src={game.image} alt="" /><div className="image-shade" /><span className="provider-label">{game.provider}</span><button className={`favorite ${favorites.includes(game.id) ? 'selected' : ''}`} onClick={(event) => { event.stopPropagation(); toggleFavorite(game.id) }} aria-label={`Favorite ${game.name}`}><Star size={16} fill={favorites.includes(game.id) ? 'currentColor' : 'none'} /></button>{(game.isHot || game.isNew) && <span className="game-tag">{game.isNew ? 'NEW' : 'HOT'}</span>}<span className="play-icon"><Play size={16} fill="currentColor" /></span></div><div className="game-name"><b>{game.name}</b><span>{game.category}</span></div></article>)}</div> : <div className="empty-state"><Search size={25} /><b>No games found</b><span>Try a different name or category.</span></div>}</section>
        </main>}

        <nav className="bottom-nav"><button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}><Home size={20} /><span>Home</span></button><button className={view === 'promos' ? 'active' : ''} onClick={() => setView('promos')}><Gift size={20} /><span>Promos</span><i>2</i></button><button className="deposit-nav" onClick={() => setModal('deposit')}><span><Zap size={21} fill="currentColor" /></span><small>Deposit</small></button><button onClick={() => setView('promos')}><Trophy size={20} /><span>VIP</span></button><button onClick={() => setModal('login')}><UserRound size={20} /><span>Profile</span></button></nav>
        <button className="floating-support" aria-label="Open support"><Headphones size={20} /><span>Live help</span></button>
      </div>
      {modal && <div className="modal-backdrop" onClick={() => setModal(null)}><div className="modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setModal(null)}><X size={18} /></button>{modal === 'login' ? <><p className="eyebrow">WELCOME BACK</p><h2>Ready to play?</h2><p className="modal-copy">Log in to access your balance, favorites, and VIP rewards.</p><label>Email or username<input placeholder="you@example.com" /></label><label>Password<input type="password" placeholder="••••••••" /></label><button className="gold-button full" onClick={() => setModal(null)}>Log in <ChevronRight size={17} /></button><p className="modal-foot">New here? <b onClick={() => setModal(null)}>Create an account</b></p></> : <><div className="deposit-symbol"><Gift size={26} /></div><p className="eyebrow">WELCOME OFFER</p><h2>Start with more.</h2><p className="modal-copy">Demo mode is active. A secure wallet provider can be connected here later.</p><div className="offer-row"><span>100% match bonus</span><b>Up to $500</b></div><button className="gold-button full" onClick={() => setModal(null)}>Explore demo games <ChevronRight size={17} /></button></>}</div></div>}
    </div>
  )
}

export default App