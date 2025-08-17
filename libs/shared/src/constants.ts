import { ConfigMap, GameState, DataMap } from './types.js';

export const SERVER_PORT = 3000;

export const SERVER_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://pzl-377786463713.us-west1.run.app'
    : `http://localhost:${SERVER_PORT}`;

export const DEFAULT_IMAGE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://pzl-377786463713.us-west1.run.app/uploads/default.jpg'
    : `http://localhost:${SERVER_PORT}/uploads/default.jpg`;

export const INITIAL_GAME_STATE: GameState = {
  sides: 5,
  imageUrl: DEFAULT_IMAGE_URL,
  data: {} as DataMap,
  configs: {} as ConfigMap,
  cropSize: { height: 1, width: 1 },
  pieceSize: { height: 1, width: 1 },
};

/** Length of the default stage that server maintains */
export const STAGE_LENGTH = 1000;
