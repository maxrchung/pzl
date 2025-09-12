import { ClientToServerEvents, ServerToClientEvents } from '@pzl/shared';
import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from './constants';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(SERVER_URL);
