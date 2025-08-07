import { Vector2d } from 'konva/lib/types.js';
import { GameState } from './types.js';

/** Given a config map, updates it in place with a new position. Shared with both client/server.  */
export const moveGroup = (
  game: GameState,
  groupId: string,
  position: Vector2d,
) => {
  if (!game.configs[groupId]) {
    return;
  }

  game.configs[groupId].x = position.x;
  game.configs[groupId].y = position.y;
};
