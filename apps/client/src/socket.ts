import { io } from 'socket.io-client';

export const socket = io(
  process.env.NODE_ENV === 'production'
    ? 'https://pzl.chng.mx'
    : 'http://localhost:3000',
  {
    autoConnect: false,
  },
);
