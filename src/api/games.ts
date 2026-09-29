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

// New function to launch GameCloud specifically
export const launchGameCloud = (userId: string, gameCode: string): Promise<{ launchUrl: string }> => {
  return apiClient.post(`/gamecloud/play`, { userId, gameCode });
};
