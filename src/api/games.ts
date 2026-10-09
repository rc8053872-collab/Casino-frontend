import { apiClient } from './client';

export interface Game {
  id: string;
  slug: string;
  name: string;
  provider: string; // new field, replaces providerId for display
  providerId?: string; // legacy fallback
  gameUid?: string;
  vendorId?: string;
  category: string;
  subCategory?: string;
  thumbnail?: string;
  banner?: string;
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  launchType?: string;
  mode?: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CatalogResponse {
  games: Game[];
  pagination: PaginationInfo;
}

export const getGamesCatalog = (params?: Record<string, any>): Promise<CatalogResponse> => {
  return apiClient.get('/games/catalog', { params });
};

export const getProviders = (): Promise<string[]> => {
  return apiClient.get('/games/providers');
};

export const launchGame = (slug: string): Promise<{ gameUrl: string; token: string }> => {
  return apiClient.post(`/games/${slug}/launch`);
};

// New function to launch GameCloud specifically
export const launchGameCloud = (userId: string, gameCode: string): Promise<{ launchUrl: string }> => {
  return apiClient.post(`/gamecloud/play`, { userId, gameCode });
};
