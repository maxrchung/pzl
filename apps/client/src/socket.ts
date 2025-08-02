import { ClientToServerEvents, ServerToClientEvents } from '@pzl/shared';
import { io, Socket } from 'socket.io-client';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.NODE_ENV === 'production'
    ? 'https://pzl.chng.mx'
    : 'http://localhost:3000',
  {
    autoConnect: false,
  },
);
