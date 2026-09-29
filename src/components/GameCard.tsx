import React from 'react';
import { Play, Star } from 'lucide-react';
import { Game } from '../api/games';

interface GameCardProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onLaunch: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, isFavorite, onToggleFavorite, onLaunch }) => {
  return (
    <article className="game-card" onClick={() => onLaunch(game)}>
      <div className="game-image">
        <img src={game.thumbnail || 'https://images.unsplash.com/photo-1518893883800-45cd0954574b?auto=format&fit=crop&w=700&q=80'} alt={game.name} />
        <div className="image-shade" />
        <span className="provider-label">{game.providerId}</span>
        
        <button 
          className={`favorite ${isFavorite ? 'selected' : ''}`} 
          onClick={(event) => { 
            event.stopPropagation(); 
            onToggleFavorite(game.id); 
          }} 
          aria-label={`Favorite ${game.name}`}
        >
          <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        
        <span className="play-icon"><Play size={16} fill="currentColor" /></span>
      </div>
      <div className="game-name">
        <b>{game.name}</b>
        <span>{game.category}</span>
      </div>
    </article>
  );
};
