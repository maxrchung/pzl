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
import { getLobbyId as createLobbyId } from './lobby';

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

const log = (socket: Socket, message: string) => {
  console.log(`${socket.id} ${message}`);
};

const resetGame = (lobby: Lobby) => {
  lobby.game = createGame(lobby.partial);
};

io.on('connection', (socket) => {
  log(socket, 'Connected');

  socket.on('disconnect', (reason) => {
    log(socket, `Disconnected: ${reason}`);
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
    log(socket, 'Snap group');

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

      io.to(lobbyId).emit('addNotification', {
        message: `Puzzle solved in ${time}`,
        icon: 'PzlIcon',
        isPermanent: true,
      });
    }

    socket.to(lobbyId).emit('snapGroup', fromGroupId, toGroupId);
  });

  socket.on('resetGame', async () => {
    log(socket, 'Reset game');

    const lobbyId = socket.data.lobbyId;
    if (!lobbyId) return;

    const lobby = lobbies.get(lobbyId);
    if (!lobby) return;

    resetGame(lobby);

    io.to(lobbyId).emit('refreshGame', lobby.game);
    io.to(lobbyId).emit('addNotification', {
      message: 'Game reset',
      icon: 'ArrowPathIcon',
    });
  });

  socket.on('updateSides', async (columns, rows) => {
    log(socket, 'Update sides');

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
    log(socket, 'Presign');

    const presign = await createPresign(contentType);
    callback(presign);
  });

  socket.on('updateImage', async (key, height, width) => {
    log(socket, 'Update image');

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
    log(socket, 'Create lobby');

    const lobbyId = createLobbyId(lobbies);
    const lobby = {
      game: createGame(),
      partial: {},
    };
    lobbies.set(lobbyId, lobby);

    socket.emit('refreshGame', lobby.game);
    callback(lobbyId);
  });

  socket.on('joinLobby', (lobbyId, callback) => {
    log(socket, 'Join lobby');

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
    const lobbyId = socket.data.lobbyId;
    if (!lobbyId) return;

    socket.leave(lobbyId);
    socket.data.lobbyId = undefined;
  });
});

// Clean up lobby
io.of('/').adapter.on('leave-room', (roomId) => {
  const lobby = lobbies.get(roomId);
  if (!lobby) return;

  // Use a timeout so that we cleanup only after a certain period has passed. If
  // we immediately cleanup, that could be problematic if you for example just
  // did a refresh of your page.

  const timeout = setTimeout(
    () => {
      const room = io.of('/').adapter.rooms.get(roomId);
      if (!room) return;
      if (room.size > 0) return;

      console.log(roomId, 'clean up');

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
