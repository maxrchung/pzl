import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { PORT } from './constants';

import type { ClientToServerEvents, ServerToClientEvents } from '@pzl/shared';

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production' ? 'https://pzl.maxrchung.com' : '*',
  },
});

const refreshSecret = (socket: Socket) => {
  socket.emit('refreshSecret', { connections: io.sockets.sockets.size });
};

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.emit('refreshGame');
  refreshSecret(socket);

  socket.on('disconnect', (reason) => {
    console.log(`Client ${socket.id} disconnected: ${reason}`);
  });

  socket.on('refreshSecret', () => {
    refreshSecret(socket);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
