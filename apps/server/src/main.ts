import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import sharp from 'sharp';
import { PORT } from './constants';
import {
  type ClientToServerEvents,
  type SecretState,
  type ServerToClientEvents,
  GameState,
  INITIAL_GAME_STATE,
  moveGroup,
  PieceData,
  snapGroup,
} from '@pzl/shared';
import path from 'path';

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production' ? 'https://pzl.maxrchung.com' : '*',
  },
});

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
    snapGroup(game, fromGroupId, toGroupId);

    socket.broadcast.emit('snapGroup', fromGroupId, toGroupId);
  });

  socket.on('resetGame', () => {
    resetGame();

    io.emit('refreshGame', game);
  });

  socket.on('updateSides', (newSides) => {
    resetGame({ sides: newSides });

    io.emit('refreshGame', game);
  });
});

const getImageDimensions = async () => {
  const imagePath = path.join(__dirname, 'image.jpg');
  const { width, height } = await sharp(imagePath).metadata();

  return {
    width,
    height,
  };
};

const STAGE_LENGTH = 1000;
let game = INITIAL_GAME_STATE;

const resetGame = async (settings?: Partial<GameState>) => {
  game = {
    ...INITIAL_GAME_STATE,
    ...settings,
  };

  const { data, configs, cropSize, pieceSize, sides } = game;

  const { width, height } = await getImageDimensions();

  cropSize.height = height / sides;
  cropSize.width = width / sides;

  const isWidthLarger = width >= height;
  const ratio = width / height;

  const pieceLength = STAGE_LENGTH / sides;
  pieceSize.width = isWidthLarger ? pieceLength : STAGE_LENGTH * ratio;
  pieceSize.height = isWidthLarger ? pieceLength / ratio : STAGE_LENGTH;

  const getInitialPosition = () => {
    const x = Math.random() * (STAGE_LENGTH - pieceSize.width);
    const y = Math.random() * (STAGE_LENGTH - pieceSize.height);

    return { x, y };
  };

  let id = 0;

  for (let i = 0; i < sides; ++i) {
    for (let j = 0; j < sides; ++j) {
      const stringId = (id++).toString();

      const piece: PieceData = {
        id: 'p' + stringId,
        groupId: stringId,
        index: {
          x: j,
          y: i,
        },
      };

      data[stringId] = [piece];
      configs[stringId] = getInitialPosition();
    }
  }
};

httpServer.listen(PORT, async () => {
  console.log(`Server listening on port: ${PORT}`);

  await resetGame();
});
