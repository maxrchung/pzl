import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import {
  type ClientToServerEvents,
  type SecretState,
  type ServerToClientEvents,
  createGame,
  DEFAULT_IMAGE_KEY,
  GameState,
  moveGroup,
  SERVER_CORS,
  SERVER_PORT,
  snapGroup,
} from '@pzl/shared';
import {
  createPresign,
  deleteAllUploads,
  deleteUpload,
  getImageUrl,
} from './s3';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors(SERVER_CORS));

const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: SERVER_CORS,
});

let game = createGame();

const partial: Partial<GameState> = {
  sides: game.sides,
  imageKey: game.imageKey,
  imageUrl: game.imageUrl,
  imageSize: game.imageSize,
};

io.on('connection', (socket) => {
  const refreshSecret = (socket: Socket) => {
    const secret: SecretState = {
      connections: io.sockets.sockets.size,
    };

    socket.emit('refreshSecret', secret);
  };

  console.log(`Client connected: ${socket.id}`);
  socket.emit('refreshGame', game);
  refreshSecret(socket);

  socket.on('disconnect', (reason) => {
    console.log(`Client ${socket.id} disconnected: ${reason}`);
  });

  socket.on('refreshSecret', () => {
    refreshSecret(socket);
  });

  socket.on('moveGroup', (groupId, position) => {
    moveGroup(game, groupId, position);

    socket.broadcast.emit('moveGroup', groupId, position);
  });

  socket.on('snapGroup', (fromGroupId, toGroupId) => {
    console.log('Snap group');

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
      io.emit('addNotification', 'Puzzle solved!', 'PzlIcon');
    }

    socket.broadcast.emit('snapGroup', fromGroupId, toGroupId);
  });

  socket.on('resetGame', async () => {
    await resetGame();

    io.emit('refreshGame', game);
    io.emit('addNotification', 'Game reset', 'ArrowPathIcon');
  });

  socket.on('updateSides', async (columns, rows) => {
    console.log('Update sides');

    partial.sides = { columns, rows };
    await resetGame();

    io.emit('refreshGame', game);
    io.emit(
      'addNotification',
      `Sides changed to ${columns}x${rows}`,
      'ArrowsPointingOutIcon',
    );
  });

  socket.on('updateImage', async (key, height, width) => {
    console.log('Update image');

    const oldKey = game.imageKey;

    partial.imageSize = { height, width };
    partial.imageKey = key;
    partial.imageUrl = getImageUrl(key);
    await resetGame();

    io.emit('refreshGame', game);
    io.emit('addNotification', 'Image changed', 'PhotoIcon');

    // Make sure we keep default file
    if (oldKey !== DEFAULT_IMAGE_KEY) {
      // Probably best to only delete after people get the new update
      await deleteUpload(oldKey);
    }
  });
});

const resetGame = async () => {
  console.log('Game reset');

  game = createGame(partial);
};

server.listen(SERVER_PORT, async () => {
  console.log(`Server listening on port: ${SERVER_PORT}`);

  // Clear all objects at start
  // TODO: This probably won't work when there are multiple servers possible
  await deleteAllUploads();

  await resetGame();
});

app.post('/presign', async (request, response) => {
  console.log('Presign');

  const { type } = request.body;
  const presign = await createPresign(type);

  response.json(presign);
});
