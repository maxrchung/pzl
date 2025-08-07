import { GameState } from './types.js';

export const snapGroup = (
  game: GameState,
  fromGroupId: string,
  toGroupId: string,
) => {
  // Maybe a simple safe guard against weird race conditions
  if (!game.data[fromGroupId] || !game.data[toGroupId]) {
    return;
  }

  const pieceSize = game.pieceSize;
  const base = game.data[toGroupId][0];

  // Move all pieces to other group
  for (const data of game.data[fromGroupId]) {
    const copy = {
      ...data,
      groupId: toGroupId,
      x: (data.index.x - base.index.x) * pieceSize.width,
      y: (data.index.y - base.index.y) * pieceSize.height,
    };

    game.data[toGroupId].push(copy);
  }

  delete game.data[fromGroupId];
};
