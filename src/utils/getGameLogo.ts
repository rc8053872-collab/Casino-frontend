export function getGameLogo(game: any): string {
  const cb = '?v=3';
  const thumbnail = typeof game.thumbnail === 'string' && game.thumbnail.trim()
    ? game.thumbnail.trim()
    : typeof game.image === 'string'
      ? game.image.trim()
      : '';
  const normalizedName = typeof game.name === 'string' ? game.name.toLowerCase().trim() : '';
  const isArcade = game.category?.toUpperCase() === 'ARCADE';
  const isSlot = /^slots?$/i.test(game.category || '');
  const isGeneratedPlaceholder = /\/game-assets\/[^/]+\/(?:thumbnail|banner)\.webp(?:[?#]|$)/i.test(thumbnail);
  if (game.slug === 'dragon-tiger-joker') {
    return `/game-art/${encodeURIComponent(game.slug)}.webp?v=4`;
  }
  if (normalizedName === 'aviator') {
    return `/icons/aviator.jpg?v=4`;
  }
  if (/^dragon[\s-]*tiger$/i.test(normalizedName)) {
    return `/icons/dragon.jpg?v=4`;
  }
  if (game.slug === 'aviator-extra-bet-jdb') {
    return `/game-art/${encodeURIComponent(game.slug)}.webp${cb}`;
  }
  if ((isArcade || isSlot) && game.slug) {
    return `/game-art/${encodeURIComponent(game.slug)}.webp${cb}`;
  }

  const artworkFor = (files: string[]) => {
    const hash = normalizedName.split('').reduce((value: number, char: string) => (value * 31 + char.charCodeAt(0)) >>> 0, 7);
    return `/${files[hash % files.length]}${cb}`;
  };

  const getArcadeArtwork = (name: string) => {
    if (/dragon[\s-]*tiger/.test(name)) return `/icons/dragon_main.jpg${cb}`;
    if (name === 'beach penalties') return `/game-assets/beach-penalties-expanse/card.webp${cb}`;
    if (name === 'beer tycoon') return `/game-assets/beer-tycoon-jdb/card.webp${cb}`;
    if (/fish|prawn|crab/.test(name)) return `/icons/fishing-cover.webp${cb}`;
    if (/aviator/.test(name)) return `/icons/aviator_main.jpg${cb}`;
    if (/mine|plinko|tower/.test(name)) {
      return artworkFor(['icons/games/diamond-treasure.webp', 'icons/games/3-arcane-cauldrons.webp', 'icons/games/3-big-barrels-aztec.webp']);
    }
    if (/roulette|black jack|pokdeng|sic bo|hilo|dice|mahjong|baccarat|teen patti|acey deucey|5pk/.test(name)) {
      return artworkFor(['icons/games/handicap-baccarat.webp', 'icons/roulette_main.jpg', 'icons/games/lil-greedy.webp']);
    }
    if (/crash|heli/.test(name)) {
      return artworkFor(['icons/games/3-arcane-cauldrons.webp', 'icons/games/3-big-barrels-aztec.webp', 'icons/games/3-power-dragons.webp']);
    }
    if (/scratch|fruit|bubble gum|candy|chilli|chili/.test(name)) {
      return artworkFor(['icons/games/candy-superwin.webp', 'icons/games/3-bunny-pots.webp', 'icons/games/gu-gu-gu-2m.webp']);
    }
    if (/penalty|soccer|racing|derby|sport|basketball|cricket|football/.test(name)) {
      return artworkFor(['icons/games/3-power-dragons.webp', 'icons/games/3-african-drums.webp', 'icons/games/3-big-barrels-aztec.webp']);
    }
    if (/chicken|bird|animal|hunter|monkey|king kong/.test(name)) {
      return artworkFor(['icons/games/gu-gu-gu-2m.webp', 'icons/games/3-bunny-pots.webp', 'icons/games/3-power-dragons.webp']);
    }
    if (/money|lucky|loot|tycoon|coin|lotto|caishen|gold|treasure|bounty/.test(name)) {
      return artworkFor(['icons/games/25-coins-santas-jackpot.webp', 'icons/games/diamond-treasure.webp', 'icons/games/lil-greedy.webp', 'icons/games/3-big-barrels-aztec.webp']);
    }
    return artworkFor(['icons/games/3-arcane-cauldrons.webp', 'icons/games/3-bunny-pots.webp', 'icons/games/3-african-drums.webp', 'icons/games/3-big-barrels-aztec.webp', 'icons/games/3-power-dragons.webp']);
  };

  if (isArcade && (!thumbnail || isGeneratedPlaceholder)) {
    return getArcadeArtwork(normalizedName);
  }

  if (!thumbnail) {
    if (game.category === 'live' || game.category === 'table' || game.category === 'cards') {
      return `/icons/handicap-baccarat.webp${cb}`;
    }
    if (game.category === 'sports' || game.category === 'esports') {
      return `/icons/3-power-dragons.webp${cb}`;
    }
    return '/category/slot-new.png';
  }

  const normalizedThumbnail = /^https?:\/\//i.test(thumbnail) || thumbnail.startsWith('/')
    ? thumbnail
    : thumbnail.includes('/')
      ? `/${thumbnail}`
      : `/icons/${thumbnail}`;

  if (normalizedThumbnail === '/icons/aviator.png') {
    return `/icons/aviator_main.jpg${cb}`;
  }

  return normalizedThumbnail.includes('?') ? normalizedThumbnail : `${normalizedThumbnail}${cb}`;
}
