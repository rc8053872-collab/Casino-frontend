import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserRound, Users, TrendingUp } from 'lucide-react';

interface GameProps {
  onClose: () => void;
}

type BetTarget = 'dragon' | 'tie' | 'tiger';

const recentResults = ['T', 'T', 'T', 'D', 'T', 'Tie', 'D', 'T', 'Tie', 'T', 'D', 'T', 'D', 'D', 'T', 'D', 'Tie'];

const fakePlayersLeft = [
  { id: 'U6389648', avatar: '👩' },
  { id: 'U6383720', avatar: '👧' },
  { id: 'U6419065', avatar: '👸' }
];
const fakePlayersRight = [
  { id: 'U7789123', avatar: '👱‍♂️' },
  { id: 'U8893452', avatar: '👲' },
  { id: 'U1123445', avatar: '🧔' }
];

const CHIP_VALUES = [10, 50, 100, 500, 1000];

const getCardFace = (value: number) => {
  if (value === 1) return 'A';
  if (value === 11) return 'J';
  if (value === 12) return 'Q';
  if (value === 13) return 'K';
  return value.toString();
};

const getSuitSymbol = (suit: string) => {
  switch(suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
    default: return '';
  }
};

const getSuitColor = (suit: string) => {
  return (suit === 'hearts' || suit === 'diamonds') ? '#ff0000' : '#000000';
};

export function DragonTigerGame({ onClose }: GameProps) {
  const [activeChip, setActiveChip] = useState<number>(10);
  
  // Game State
  const [userBalance, setUserBalance] = useState<number>(68330);
  const [timer, setTimer] = useState<number>(12);
  
  // Betting State
  interface ChipBet {
    id: string;
    amount: number;
    target: BetTarget;
    startX: string;
    startY: string;
    endX: string;
    endY: string;
  }
  const [placedChips, setPlacedChips] = useState<ChipBet[]>([]);
  const [zoneTotals, setZoneTotals] = useState<Record<BetTarget, number>>({ dragon: 0, tie: 0, tiger: 0 });
  const [userBets, setUserBets] = useState<Record<BetTarget, number>>({ dragon: 0, tie: 0, tiger: 0 });
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [winningSide, setWinningSide] = useState<BetTarget | null>(null);

  // Card State
  interface PlayingCard {
    value: number; // 1-13
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  }
  const [dragonCard, setDragonCard] = useState<PlayingCard | null>(null);
  const [tigerCard, setTigerCard] = useState<PlayingCard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const generateRandomCard = (): PlayingCard => {
    const suits: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    return {
      value: Math.floor(Math.random() * 13) + 1,
      suit: suits[Math.floor(Math.random() * suits.length)]
    };
  };

  type GamePhase = 'intro' | 'betting' | 'stop' | 'reveal' | 'result';
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [showStartBetting, setShowStartBetting] = useState(false);

  // Main Game Loop
  useEffect(() => {
    document.body.classList.add('game-active');

    let timeoutId: ReturnType<typeof setTimeout>;

    if (gamePhase === 'intro') {
      // Show VS screen for 2s, then move to betting
      timeoutId = setTimeout(() => {
        setGamePhase('betting');
        setTimer(15);
        setShowStartBetting(true);
        setTimeout(() => setShowStartBetting(false), 1500); // Hide "Start Betting" after 1.5s
      }, 2000);
    } 
    else if (gamePhase === 'betting') {
      // Countdown timer
      if (timer > 0) {
        timeoutId = setTimeout(() => {
          setTimer(prev => prev - 1);
        }, 1000);
      } else {
        setGamePhase('stop');
      }
    }
    else if (gamePhase === 'stop') {
      // Show "Stop Betting" for 1.5s, then reveal
      timeoutId = setTimeout(() => {
        setGamePhase('reveal');
      }, 1500);
    }
    else if (gamePhase === 'reveal') {
      // Reveal cards
      const dCard = generateRandomCard();
      const tCard = generateRandomCard();
      
      setDragonCard(dCard);
      setTigerCard(tCard);
      setIsFlipped(true);

      timeoutId = setTimeout(() => {
        setGamePhase('result');
      }, 1000);
    }
    else if (gamePhase === 'result') {
      // Evaluate winner and show result
      let winner: BetTarget = 'tie';
      if (dragonCard && tigerCard) {
        if (dragonCard.value > tigerCard.value) winner = 'dragon';
        else if (tigerCard.value > dragonCard.value) winner = 'tiger';
      }
      
      let winAmount = 0;
      if (userBets[winner] > 0) {
          winAmount = winner === 'tie' ? userBets[winner] * 9 : userBets[winner] * 2;
      }

      setWinningSide(winner);
      if (winAmount > 0) {
        setUserBalance(b => b + winAmount);
        setWinMessage(`You won ${winAmount}!`);
      } else {
        setWinMessage(`${winner.toUpperCase()} WINS!`);
      }

      timeoutId = setTimeout(() => {
        // Reset for next round
        setIsFlipped(false);
        setWinMessage(null);
        setWinningSide(null);
        setTimeout(() => {
          setDragonCard(null);
          setTigerCard(null);
          setPlacedChips([]);
          setZoneTotals({ dragon: 0, tie: 0, tiger: 0 });
          setUserBets({ dragon: 0, tie: 0, tiger: 0 });
          setGamePhase('intro');
        }, 600); // wait for unflip
      }, 4000);
    }

    return () => {
      clearTimeout(timeoutId);
      document.body.classList.remove('game-active');
    };
  }, [gamePhase, timer]); // Fixed: removed dragonCard, tigerCard, userBets to prevent infinite loops

  // Fake Players Simulation
  useEffect(() => {
    if (gamePhase !== 'betting') return;

    const interval = setInterval(() => {
      const targets: BetTarget[] = ['dragon', 'tiger', 'tie'];
      // ... fake players logic ...
      const randomTarget = targets[Math.floor(Math.random() * targets.length)];
      const randomAmount = CHIP_VALUES[Math.floor(Math.random() * 3)]; // Fake players use smaller chips mostly

      // Pick a random avatar position
      const randomAvatarIndex = Math.floor(Math.random() * 4) + 1;
      const startEl = document.querySelector(`.avatar-${randomAvatarIndex}`);
      const targetEl = document.querySelector(`.${randomTarget}-zone`);
      
      if (startEl && targetEl) {
        const startRect = startEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        
        // Add random scatter to target
        const endX = targetRect.left + (Math.random() * (targetRect.width - 20)) + 'px';
        const endY = targetRect.top + (Math.random() * (targetRect.height - 20)) + 'px';
        
        const newChip: ChipBet = {
          id: Math.random().toString(36).substr(2, 9),
          amount: randomAmount,
          target: randomTarget,
          startX: `${startRect.left + 20}px`,
          startY: `${startRect.top + 20}px`,
          endX,
          endY
        };

        setPlacedChips(prev => [...prev, newChip]);
        setZoneTotals(prev => ({
          ...prev,
          [randomTarget]: prev[randomTarget] + randomAmount
        }));
      }

    }, 400); // Fake bet every 400ms

    return () => clearInterval(interval);
  }, [gamePhase]);

  const placeBet = (target: BetTarget) => {
    if (timer <= 3 || userBalance < activeChip) return; 
    
    setUserBalance(prev => prev - activeChip);
    
    const newChip: ChipBet = {
      id: `user-${Date.now()}`,
      amount: activeChip,
      target,
      startX: '0vw',
      startY: '50vh', // From bottom
      endX: `${Math.random() * 60 + 20}%`,
      endY: `${Math.random() * 60 + 20}%`,
    };
    
    setPlacedChips(prev => [...prev, newChip]);
    setZoneTotals(prev => ({ ...prev, [target]: prev[target] + activeChip }));
    setUserBets(prev => ({ ...prev, [target]: prev[target] + activeChip }));
  };

  const renderChips = (target: BetTarget) => {
    return placedChips.filter(c => c.target === target).map(c => (
      <div 
        key={c.id} 
        className={`chip chip-${c.amount} flying-chip`}
        style={{
          '--start-x': c.startX,
          '--start-y': c.startY,
          left: c.endX,
          top: c.endY
        } as React.CSSProperties}
      >
        <div className="chip-inner">
          <strong>{c.amount >= 1000 ? (c.amount/1000)+'K' : c.amount}</strong>
        </div>
      </div>
    ));
  };

  const renderCard = (cardData: PlayingCard | null, className: string) => {
    return (
      <div className={`game-card ${className} ${isFlipped ? 'flipped' : ''}`}>
        <div className="card-inner">
          <div className="card-front"></div>
          <div className="card-back">
            {cardData && (
              <div className="playing-card-face" style={{ color: getSuitColor(cardData.suit) }}>
                <div className="card-top-left">
                  <span>{getCardFace(cardData.value)}</span>
                  <span className="suit">{getSuitSymbol(cardData.suit)}</span>
                </div>
                <div className="card-center-suit">
                  {getSuitSymbol(cardData.suit)}
                </div>
                <div className="card-bottom-right">
                  <span>{getCardFace(cardData.value)}</span>
                  <span className="suit">{getSuitSymbol(cardData.suit)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dragon-tiger-container">
      {/* Background Graphics */}
      <div className="dragon-graphic" />
      <div className="game-cards-wrapper">
        {renderCard(dragonCard, 'dragon-game-card')}
        <div className="vs-graphic">VS</div>
        {renderCard(tigerCard, 'tiger-game-card')}
      </div>
      <div className="tiger-graphic" />

      {/* Phase Overlays */}
      {gamePhase === 'intro' && (
        <div className="phase-overlay intro-overlay">
          <img src="/assets/dragon-win.jpg" alt="Dragon" className="intro-dragon slide-in-left" />
          <div className="intro-vs zoom-in">VS</div>
          <img src="/assets/tiger-win.jpg" alt="Tiger" className="intro-tiger slide-in-right" />
        </div>
      )}

      {showStartBetting && (
        <div className="phase-overlay flash-text-overlay">
          <h1 className="flash-text place-bet-glow">PlaceYourBet</h1>
        </div>
      )}

      {gamePhase === 'stop' && (
        <div className="stop-betting-alert">
          Stop Betting
        </div>
      )}

      {winMessage && (
        <div className="win-message-overlay">
          <h2>{winMessage}</h2>
        </div>
      )}

      {/* Top Bar (Back Button only now) */}
      <div className="dt-top-bar">
        <button className="back-btn" onClick={onClose}>
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Left Players */}
      <div className="players-col left">
        <div className="version-info">
          version:202206301200<br/>ID:
        </div>
        
        <div className="top-player-container">
          <div className="crown">👑</div>
          <div className="avatar-ring top-player">
             <div className="avatar-inner" style={{ fontSize: '5vmin' }}>👨🏻</div>
          </div>
          <div className="balance-pill">
            <span className="coin-icon">🪙</span> {userBalance.toLocaleString()}
          </div>
        </div>

        {fakePlayersLeft.map((p, i) => (
          <div key={i} className="player-list-item">
            <div className="player-id">{p.id}</div>
            <div className="avatar-ring">
              <div className="avatar-inner" style={{ fontSize: '3.5vmin' }}>{p.avatar}</div>
            </div>
          </div>
        ))}
        
        <div className="green-user-btn"><Users size={28} color="#fff" /></div>
      </div>

      {/* Right Players */}
      <div className="players-col right">
        <div className="lanterns">🏮</div>
        {fakePlayersRight.map((p, i) => (
          <div key={i} className="player-list-item">
            <div className="player-id">{p.id}</div>
            <div className="avatar-ring right-ring">
              <div className="avatar-inner" style={{ fontSize: '3.5vmin' }}>{p.avatar}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Betting Board Panel */}
      <div className="dt-board-panel">
        <div className="board-lantern left-lantern" />
        <div className="board-lantern right-lantern" />
        
        <div className="timer-pill">
          {timer > 3 ? `Start Betting ${timer}` : `Stop Betting`}
        </div>
        
        <div className="dt-history">
          {recentResults.map((res, i) => (
            <div key={i} className={`history-dot ${res.toLowerCase()}`}>
              {res === 'Tie' ? 'Tie' : res}
            </div>
          ))}
          <button className="trend-btn"><TrendingUp size={16} /></button>
          <div className="diamonds-icon">
            <div className="diamond"></div><div className="diamond"></div>
            <div className="diamond"></div><div className="diamond"></div>
          </div>
        </div>

        <div className="dt-board">
          {/* Left Column */}
          <div className="board-col">
            <div className={`bet-zone dragon-zone ${winningSide === 'dragon' ? 'winner' : ''}`} onClick={() => placeBet('dragon')}>
              <div className="zone-bg dragon-bg" />
              {winningSide === 'dragon' && (
                <div className="winner-bg-overlay" style={{backgroundImage: 'url(/assets/dragon-win.jpg)'}}></div>
              )}
              <div className="zone-content">
                <h3>Dragon</h3>
                <span>1:1</span>
              </div>
              {zoneTotals.dragon > 0 && <div className="bet-amount">{zoneTotals.dragon}</div>}
              {renderChips('dragon')}
            </div>
          </div>
          
          {/* Center Column */}
          <div className="board-col center-col">
            <div className={`bet-zone tie-zone ${winningSide === 'tie' ? 'winner' : ''}`} onClick={() => placeBet('tie')}>
              <div className="zone-content">
                <h3>Tie</h3>
                <span>8:1</span>
              </div>
              {zoneTotals.tie > 0 && <div className="bet-amount">{zoneTotals.tie}</div>}
              {renderChips('tie')}
            </div>
            <div className="stats-bar">
              <div className="stats-row">
                <div className="star-icon">⭐</div> Rate:75%
              </div>
              <div className="progress-bar">
                <div className="progress-node dragon-node">D</div>
                <div className="progress-line"></div>
                <div className="progress-node tiger-node">T</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="board-col">
            <div className={`bet-zone tiger-zone ${winningSide === 'tiger' ? 'winner' : ''}`} onClick={() => placeBet('tiger')}>
              <div className="zone-bg tiger-bg" />
              {winningSide === 'tiger' && (
                <div className="winner-bg-overlay" style={{backgroundImage: 'url(/assets/tiger-win.jpg)'}}></div>
              )}
              <div className="zone-content">
                <h3>Tiger</h3>
                <span>1:1</span>
              </div>
              {zoneTotals.tiger > 0 && <div className="bet-amount">{zoneTotals.tiger}</div>}
              {renderChips('tiger')}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dt-footer">
        <div className="chips-container">
          {CHIP_VALUES.map((val) => (
            <button 
              key={val} 
              className={`chip chip-${val} ${activeChip === val ? 'active' : ''}`}
              onClick={() => setActiveChip(val)}
            >
              <div className="chip-inner">
                <strong>{val}</strong>
                <small>CHIP</small>
              </div>
            </button>
          ))}
          <div className="next-arrow">›</div>
        </div>
        
        <div className="footer-actions">
          <button className="continue-btn">Continue</button>
          <button className="shop-btn">
            <span className="shop-icon">🛒</span>
            <small>SHOP</small>
          </button>
        </div>
      </div>
    </div>
  );
}
