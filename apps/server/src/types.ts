import { Game } from '@pzl/shared';

export interface Lobby {
  game: Game;
  partial: Partial<Game>;
  cleanupTimeout?: NodeJS.Timeout;
}

export type Lobbies = Map<string, Lobby>;
