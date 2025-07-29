import { createServer } from 'http';
import { Server } from 'socket.io';
import { PORT } from './constants';

import type { ClientToServerEvents, ServerToClientEvents } from '@pzl/shared';

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production' ? 'https://pzl.maxrchung.com' : '*',
  },
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(`Client ${socket.id} disconnected: ${reason}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port; ${PORT}`);
});
