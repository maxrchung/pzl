import {
  DEFAULT_IMAGE_KEY,
  DEFAULT_IMAGE_SIZE,
  DEFAULT_IMAGE_URL,
  DEFAULT_SIDES,
  STAGE_LENGTH,
} from './constants';
import { Edge, Game, PieceConfig } from './types';
import { Vector2d } from 'konva/lib/types';

export const createGame = (partial?: Partial<Game>) => {
  const game: Game = {
    resetTime: Date.now(),
    imageKey: DEFAULT_IMAGE_KEY,
    imageUrl: DEFAULT_IMAGE_URL,
    imageSize: DEFAULT_IMAGE_SIZE,
    sides: DEFAULT_SIDES,
    cropSize: { height: 1, width: 1 },
    pieceSize: { height: 1, width: 1 },
    pieceConfigs: {},
    groupConfigs: {},
    edge: Edge.JigsawTab,
    tabLength: 0,
    ...partial,
  };

  const {
    pieceConfigs,
    groupConfigs,
    sides: { columns, rows },
    imageSize: { width, height },
    cropSize,
    pieceSize,
    edge,
  } = game;

  // Little hack for empty game
  if (columns === 0 || rows === 0) return game;

  cropSize.height = height / rows;
  cropSize.width = width / columns;

  const isWidthLarger = width >= height;
  const ratio = width / height;

  const pieceWidth = STAGE_LENGTH / columns;
  const pieceHeight = STAGE_LENGTH / rows;
  pieceSize.width = isWidthLarger ? pieceWidth : pieceWidth * ratio;
  pieceSize.height = isWidthLarger ? pieceHeight / ratio : pieceHeight;

  game.tabLength = Math.min(pieceSize.width, pieceSize.height) / 5;

  const getPosition = () => {
    const x = Math.random() * (STAGE_LENGTH - pieceSize.width);
    const y = Math.random() * (STAGE_LENGTH - pieceSize.height);

    return { x, y };
  };

  const getEdges = (i: number, j: number): PieceConfig['edges'] => {
    const edges = {
      top:
        // Note: Accounting for column/row indexing
        i === 0 ? 0 : pieceConfigs[(i - 1) * columns + j][0].edges.bottom * -1,
      right: j === columns - 1 ? 0 : Math.random() > 0.5 ? +edge : -edge,
      bottom: i === rows - 1 ? 0 : Math.random() > 0.5 ? +edge : -edge,
      left: j === 0 ? 0 : pieceConfigs[i * columns + j - 1][0].edges.right * -1,
    };

    return edges;
  };

  let id = 0;
  for (let i = 0; i < rows; ++i) {
    for (let j = 0; j < columns; ++j) {
      const stringId = (id++).toString();

      const piece: PieceConfig = {
        id: stringId,
        groupId: stringId,
        index: {
          x: j,
          y: i,
        },
        edges: getEdges(i, j),
      };

      pieceConfigs[stringId] = [piece];
      groupConfigs[stringId] = getPosition();
    }
  }

  return game;
};

// For client so nothing displays
export const createEmptyGame = () =>
  createGame({ sides: { columns: 0, rows: 0 } });

/** Given a config map, updates it in place with a new position. Shared with both client/server.  */
export const moveGroup = (game: Game, groupId: string, position: Vector2d) => {
  if (!game.groupConfigs[groupId]) return;

  game.groupConfigs[groupId].x = position.x;
  game.groupConfigs[groupId].y = position.y;
};

export const snapGroup = (
  game: Game,
  fromGroupId: string,
  toGroupId: string,
) => {
  // Maybe a simple safe guard against weird race conditions
  if (!game.pieceConfigs[fromGroupId] || !game.pieceConfigs[toGroupId]) return;

  const pieceSize = game.pieceSize;
  const base = game.pieceConfigs[toGroupId][0];

  // Move all pieces to other group
  for (const piece of game.pieceConfigs[fromGroupId]) {
    const copy = {
      ...piece,
      groupId: toGroupId,
      x: (piece.index.x - base.index.x) * pieceSize.width,
      y: (piece.index.y - base.index.y) * pieceSize.height,
    };

    game.pieceConfigs[toGroupId].push(copy);
  }

  delete game.pieceConfigs[fromGroupId];
};
