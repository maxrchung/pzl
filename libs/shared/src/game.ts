import {
  DEFAULT_IMAGE_KEY,
  DEFAULT_IMAGE_SIZE,
  DEFAULT_IMAGE_URL,
  DEFAULT_SIDES,
  STAGE_LENGTH,
  STROKE_WIDTH,
} from './constants';
import { ConfigMap, DataMap, Game, PieceData } from './types';
import { Vector2d } from 'konva/lib/types';

// For client so nothing displays
export const createEmptyGame = () =>
  createGame({ sides: { columns: 0, rows: 0 } });

export const createGame = (partial?: Partial<Game>) => {
  const game: Game = {
    resetTime: Date.now(),
    imageKey: DEFAULT_IMAGE_KEY,
    imageUrl: DEFAULT_IMAGE_URL,
    imageSize: DEFAULT_IMAGE_SIZE,
    sides: DEFAULT_SIDES,
    cropSize: { height: 1, width: 1 },
    pieceSize: { height: 1, width: 1 },
    data: {} as DataMap,
    configs: {} as ConfigMap,
    ...partial,
  };

  const {
    data,
    configs,
    sides: { columns, rows },
    imageSize: { width, height },
    cropSize,
    pieceSize,
  } = game;

  if (columns === 0 || rows === 0) {
    return game;
  }

  cropSize.height = height / rows;
  cropSize.width = width / columns;

  const isWidthLarger = width >= height;
  const ratio = width / height;

  const pieceWidth = STAGE_LENGTH / columns;
  const pieceHeight = STAGE_LENGTH / rows;
  pieceSize.width = isWidthLarger ? pieceWidth : pieceWidth * ratio;
  pieceSize.height = isWidthLarger ? pieceHeight / ratio : pieceHeight;

  const getPosition = () => {
    const x = Math.random() * (STAGE_LENGTH - pieceSize.width);
    const y = Math.random() * (STAGE_LENGTH - pieceSize.height);

    return { x, y };
  };

  let id = 0;

  for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < columns; ++j) {
      const stringId = (id++).toString();

      const piece: PieceData = {
        id: stringId,
        groupId: stringId,
        index: {
          x: j,
          y: i,
        },
      };

      data[stringId] = [piece];
      configs[stringId] = getPosition();
    }
  }

  return game;
};

/** Given a config map, updates it in place with a new position. Shared with both client/server.  */
export const moveGroup = (game: Game, groupId: string, position: Vector2d) => {
  if (!game.configs[groupId]) return;

  game.configs[groupId].x = position.x;
  game.configs[groupId].y = position.y;
};

export const snapGroup = (
  game: Game,
  fromGroupId: string,
  toGroupId: string,
) => {
  // Maybe a simple safe guard against weird race conditions
  if (!game.data[fromGroupId] || !game.data[toGroupId]) return;
  const base = game.data[toGroupId].find((data) => data.id === data.groupId);
  if (!base) return;

  const pieceSize = game.pieceSize;

  // Move all pieces to other group
  for (const data of game.data[fromGroupId]) {
    const copy = {
      ...data,
      groupId: toGroupId,
      x: (data.index.x - base.index.x) * (pieceSize.width + STROKE_WIDTH / 2),
      y: (data.index.y - base.index.y) * (pieceSize.height + STROKE_WIDTH / 2),
    };

    game.data[toGroupId].push(copy);
  }

  delete game.data[fromGroupId];
};
