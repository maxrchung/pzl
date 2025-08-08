import { ConfigMap, GameState, DataMap } from './types.js';

const DEFAULT_IMAGE_URL =
  'https://raw.githubusercontent.com/maxrchung/dotfiles/refs/heads/master/daBOiindaMrrr.jpg';

export const INITIAL_GAME_STATE: GameState = {
  sides: 5,
  imageUrl: DEFAULT_IMAGE_URL,
  data: {} as DataMap,
  configs: {} as ConfigMap,
  cropSize: { height: 1, width: 1 },
  pieceSize: { height: 1, width: 1 },
};
