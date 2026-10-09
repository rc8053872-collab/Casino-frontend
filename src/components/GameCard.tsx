import React, { useState } from 'react';
import { Play, Star } from 'lucide-react';
import { Game } from '../api/games';
import { getGameLogo } from '../utils/getGameLogo';

interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onLaunch: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, isFavorite, onToggleFavorite, onLaunch }) => {
  const [imgError, setImgError] = useState(false);
  const fallbackImg = '/category/slot-new.png'; // A clean existing placeholder
  
  const isPending = game.status === 'INACTIVE' || game.status === 'INTEGRATION_PENDING' || !game.isActive;
  
  const logoSrc = imgError ? fallbackImg : getGameLogo(game);

  return (
    <article 
      className={`game-card ${isPending ? 'game-card-disabled' : ''}`} 
      onClick={() => {
        if (!isPending) onLaunch(game);
      }}
      style={{ cursor: isPending ? 'not-allowed' : 'pointer' }}
    >
      <div className="game-image">
        <img 
          src={logoSrc} 
          alt={game.name} 
          onError={() => setImgError(true)} 
          loading="lazy"
          style={{ objectFit: 'cover', opacity: isPending ? 0.6 : 1, color: 'transparent' }}
        />
        <div className="image-shade" />
        
        {isPending && (
          <div className="pending-badge" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 10, textAlign: 'center', width: '80%' }}>
            COMING SOON
          </div>
        )}
        
        {!isPending && (
          <span className="play-icon"><Play size={24} fill="currentColor" /></span>
        )}
        
        <span className="provider-label">{game.provider || game.providerId}</span>
        
        <button 
          className={`favorite ${isFavorite ? 'selected' : ''}`} 
          onClick={(event) => { 
            event.stopPropagation(); 
            onToggleFavorite(game.id); 
          }} 
          aria-label={`Favorite ${game.name}`}
          style={{ zIndex: 11 }}
        >
          <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="game-name" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 8px' }}>
        <b style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.name}</b>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{game.provider || game.providerId} • {game.category}</span>
      </div>
    </article>
  );
};
