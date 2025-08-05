import { ConfigMap, GameState, DataMap } from './types.js';

export const INITIAL_GAME_STATE: GameState = {
  data: {} as DataMap,
  configs: {} as ConfigMap,
  cropSize: { height: 1, width: 1 },
  pieceSize: { height: 1, width: 1 },
};
