import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
  createGame,
  DEFAULT_IMAGE_KEY,
  moveGroup,
  SERVER_CORS,
  SERVER_PORT,
  snapGroup,
  SocketData,
} from '@pzl/shared';
import {
  createPresign,
  deleteAllUploads,
  deleteUpload,
  getImageUrl,
} from './s3';
import { Lobbies, Lobby } from './types';
import { createLobbyId } from './lobby';

const lobbies: Lobbies = new Map();

const server = createServer();
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  never,
  SocketData
>(server, {
  cors: SERVER_CORS,
});

const log = (socket: Socket, message: string, data?: string) => {
  console.log(
    JSON.stringify({
      message,
      ...(data && { data }),
      socketId: socket.id,
      ...(socket.data.lobbyId && { lobbyId: socket.data.lobbyId }),
    }),
  );
};

const resetGame = (lobby: Lobby) => {
  lobby.game = createGame(lobby.partial);
};

io.on('connection', (socket) => {
  log(socket, 'connection');

  socket.on('disconnect', (reason) => {
    log(socket, `disconnect ${reason}`);
  });

  socket.on('moveGroup', (groupId, position) => {
    // Logging this would probably be too noisy

    const lobbyId = socket.data.lobbyId;
    if (!lobbyId) return;

    const game = lobbies.get(lobbyId)?.game;
    if (!game) return;

    moveGroup(game, groupId, position);

    socket.to(lobbyId).emit('moveGroup', groupId, position);
  });

  socket.on('snapGroup', (fromGroupId, toGroupId) => {
    log(socket, 'snapGroup');

    const lobbyId = socket.data.lobbyId;
    if (!lobbyId) return;

    const game = lobbies.get(lobbyId)?.game;
    if (!game) return;

    snapGroup(game, fromGroupId, toGroupId);

    // lil optimization??? idk
    let groups = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _key in game.data) {
      groups++;
      if (groups > 1) {
        break;
      }
    }

    if (groups === 1) {
      const totalMilliseconds = Date.now() - game.resetTime;
      const totalSeconds = Math.floor(totalMilliseconds / 1000);

      // TypeScript is missing DurationFormat definition, but it exists in Node
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const time = new (Intl as any).DurationFormat('en', {
        style: 'long',
      }).format({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });

      log(socket, 'solved', time);

      io.to(lobbyId).emit('addNotification', {
        message: `Puzzle solved in ${time}`,
        icon: 'PzlIcon',
        isPermanent: true,
      });
    }

    socket.to(lobbyId).emit('snapGroup', fromGroupId, toGroupId);
  });

  socket.on('resetGame', async () => {
    log(socket, 'resetGame');

    const lobbyId = socket.data.lobbyId;
    if (!lobbyId) return;

    const lobby = lobbies.get(lobbyId);
    if (!lobby) return;

    resetGame(lobby);

    io.to(lobbyId).emit('refreshGame', lobby.game);
    io.to(lobbyId).emit('addNotification', {
      message: 'Puzzle reset',
      icon: 'ArrowPathIcon',
    });
  });

  socket.on('updateSides', async (columns, rows) => {
    log(socket, 'updateSides', `${columns}x${rows}`);

    const lobbyId = socket.data.lobbyId;
    if (!lobbyId) return;

    const lobby = lobbies.get(lobbyId);
    if (!lobby) return;

    lobby.partial.sides = { columns, rows };
    resetGame(lobby);

    io.to(lobbyId).emit('refreshGame', lobby.game);
    io.to(lobbyId).emit('addNotification', {
      message: `Pieces changed to ${columns}x${rows}`,
      icon: 'ArrowsPointingOutIcon',
    });
  });

  socket.on('presign', async (contentType, callback) => {
    log(socket, 'presign', contentType);

    const presign = await createPresign(contentType);
    callback(presign);
  });

  socket.on('updateImage', async (key, height, width) => {
    log(socket, 'updateImage', `${key} ${width}x${height}`);

    const lobbyId = socket.data.lobbyId;
    if (!lobbyId) return;

    const lobby = lobbies.get(lobbyId);
    if (!lobby) return;

    const oldKey = lobby.game.imageKey;

    lobby.partial.imageSize = { height, width };
    lobby.partial.imageKey = key;
    lobby.partial.imageUrl = getImageUrl(key);
    resetGame(lobby);

    io.to(lobbyId).emit('refreshGame', lobby.game);
    io.to(lobbyId).emit('addNotification', {
      message: 'Image changed',
      icon: 'PhotoIcon',
    });

    // Make sure we keep default file
    if (oldKey !== DEFAULT_IMAGE_KEY) {
      // Probably best to delete after we send notify clients
      deleteUpload(oldKey);
    }
  });

  socket.on('createLobby', (callback) => {
    const lobbyId = createLobbyId(lobbies);
    const lobby = {
      game: createGame(),
      partial: {},
    };
    lobbies.set(lobbyId, lobby);

    log(socket, 'createLobby', lobbyId);

    socket.emit('refreshGame', lobby.game);
    callback(lobbyId);
  });

  socket.on('joinLobby', (lobbyId, callback) => {
    log(socket, 'joinLobby', lobbyId);

    const lobby = lobbies.get(lobbyId);
    if (!lobby) {
      callback(false);
      return;
    }

    // Leave existing and go to new room
    if (socket.data.lobbyId) {
      socket.leave(socket.data.lobbyId);
    }
    socket.data.lobbyId = lobbyId;
    socket.join(lobbyId);
    clearTimeout(lobby.cleanupTimeout);

    socket.emit('refreshGame', lobby.game);
    callback(true);
  });

  socket.on('leaveLobby', () => {
    log(socket, 'leaveLobby');

    const lobbyId = socket.data.lobbyId;
    if (!lobbyId) return;

    socket.leave(lobbyId);
    socket.data.lobbyId = undefined;
  });
});

// Clean up lobby
io.of('/').adapter.on('leave-room', (roomId, socketId) => {
  console.log(
    JSON.stringify({ message: 'leave-room', lobbyId: roomId, socketId }),
  );

  const lobby = lobbies.get(roomId);
  if (!lobby) return;

  const room = io.of('/').adapter.rooms.get(roomId);
  if (!room) return;
  if (room.size > 0) return;

  // Use a timeout so that we cleanup only after a certain period has passed. If
  // we immediately cleanup, that could be problematic if you for example just
  // did a refresh of your page.

  const timeout = setTimeout(
    () => {
      console.log(
        JSON.stringify({ message: 'cleanup', lobbyId: roomId, socketId }),
      );

      const imageKey = lobby.game.imageKey;
      // Make sure we keep default file
      if (imageKey !== DEFAULT_IMAGE_KEY) {
        // Probably best to delete after we send notify clients
        deleteUpload(imageKey);
      }

      lobbies.delete(roomId);
    },
    1000 * 60 * 10, // Allow 1 hour of inactivity
  );
  lobby.cleanupTimeout = timeout;
});

server.listen(SERVER_PORT, async () => {
  console.log(`Server listening on port: ${SERVER_PORT}`);

  // Clear all objects at start
  // TODO: This probably won't work when there are multiple servers possible
  await deleteAllUploads();
});
