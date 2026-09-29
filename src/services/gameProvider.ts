export type Category = {
  id: string
  label: string
  icon: string
}

export type Game = {
  id: string
  name: string
  provider: string
  category: string
  image: string
  accent: string
  isHot?: boolean
  isNew?: boolean
}

export interface GameProvider {
  getCategories(): Promise<Category[]>
  getGames(category?: string): Promise<Game[]>
  launchGame(gameId: string): Promise<{ sessionUrl: string }>
}

const categories: Category[] = [
  { id: 'hot', label: 'Hot', icon: '✦' },
  { id: 'slots', label: 'Slots', icon: '▦' },
  { id: 'live', label: 'Live', icon: '◉' },
  { id: 'sports', label: 'Sports', icon: '◒' },
  { id: 'table', label: 'Table', icon: '♠' },
  { id: 'fishing', label: 'Fishing', icon: '♨' },
  { id: 'lottery', label: 'Lottery', icon: '◇' },
]

const games: Game[] = [
  { id: 'neon-reels', name: 'Neon Reels', provider: 'Orbit Studio', category: 'slots', image: 'https://images.unsplash.com/photo-1518893883800-45cd0954574b?auto=format&fit=crop&w=700&q=80', accent: '#f5b83d', isHot: true },
  { id: 'dragon-tiger', name: 'Dragon Tiger', provider: 'Royal Table', category: 'table', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=700&q=80', accent: '#e74b62', isHot: true },
  { id: 'lucky-nines', name: 'Lucky Nines', provider: 'Golden Game', category: 'slots', image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=700&q=80', accent: '#49d7b0', isNew: true },
  { id: 'moon-princess', name: 'Moon Princess', provider: 'Lunar Play', category: 'slots', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80', accent: '#7d77ff', isNew: true },
  { id: 'royal-baccarat', name: 'Royal Baccarat', provider: 'Live Lounge', category: 'live', image: 'https://images.unsplash.com/photo-1605870445919-838d190e8e1b?auto=format&fit=crop&w=700&q=80', accent: '#e5a743', isHot: true },
  { id: 'turbo-football', name: 'Turbo Football', provider: 'Orbit Sports', category: 'sports', image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=700&q=80', accent: '#28b6d8' },
  { id: 'deep-sea', name: 'Deep Sea Riches', provider: 'Aqua Works', category: 'fishing', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80', accent: '#3bd0e6' },
  { id: 'wild-west', name: 'Wild West Gold', provider: 'Golden Game', category: 'slots', image: 'https://images.unsplash.com/photo-1518623380242-d992d3c57b37?auto=format&fit=crop&w=700&q=80', accent: '#e9893c' },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockGameProvider: GameProvider = {
  async getCategories() {
    await delay(180)
    return categories
  },
  async getGames(category = 'hot') {
    await delay(260)
    return category === 'hot' ? games.filter((game) => game.isHot || game.isNew) : games.filter((game) => game.category === category)
  },
  async launchGame(gameId) {
    await delay(350)
    return { sessionUrl: `/demo/game/${gameId}` }
  },
}