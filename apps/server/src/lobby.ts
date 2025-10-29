// This is very small (max 19,683) but I think kind of fun. It'll probably take

import { customAlphabet } from 'nanoid';
import { Lobbies } from './types';

// like a thousand lobbies before regeneration gets kind of annoying? Idk.
const nanoid = customAlphabet('pzl', 9);

export const createLobbyId = (lobbies: Lobbies): string => {
  const id = nanoid();

  if (lobbies.has(id)) {
    console.log('lobby collision');

    return createLobbyId(lobbies);
  }

  return id;
};
