import { apiClient } from './client';

export interface Game {
  id: string;
  slug: string;
  name: string;
  category: string;
  providerId: string;
  thumbnail: string;
  status: string;
}

export const getGamesCatalog = (): Promise<Game[]> => {
  return apiClient.get('/games/catalog');
};

export const launchGame = (slug: string): Promise<{ gameUrl: string; token: string }> => {
  return apiClient.post(`/games/${slug}/launch`);
};
