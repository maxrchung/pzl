import { Game } from '@pzl/shared';

export interface Lobby {
  game: Game;
  partial: Partial<Game>;
}

export type Lobbies = Map<string, Lobby>;
