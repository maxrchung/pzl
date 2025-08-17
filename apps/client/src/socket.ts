import {
  ClientToServerEvents,
  SERVER_URL,
  ServerToClientEvents,
} from '@pzl/shared';
import { io, Socket } from 'socket.io-client';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
  io(SERVER_URL);
