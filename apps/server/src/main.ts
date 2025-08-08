import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import sharp from 'sharp';
import { PORT } from './constants';
import {
  type ClientToServerEvents,
  type SecretState,
  type ServerToClientEvents,
  INITIAL_GAME_STATE,
  moveGroup,
  PieceData,
  snapGroup,
} from '@pzl/shared';
import axios from 'axios';

const httpServer = createServer();
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production' ? 'https://pzl.maxrchung.com' : '*',
  },
});

const STAGE_LENGTH = 1000;
let game = INITIAL_GAME_STATE;
let gameSides = INITIAL_GAME_STATE.sides;
let gameImageUrl = INITIAL_GAME_STATE.imageUrl;

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

  socket.on('resetGame', async () => {
    await resetGame();

    io.emit('refreshGame', game);
  });

  socket.on('updateSides', async (sides) => {
    gameSides = sides;
    await resetGame();

    io.emit('refreshGame', game);
  });

  socket.on('updateImageUrl', async (imageUrl) => {
    gameImageUrl = imageUrl;
    await resetGame();

    io.emit('refreshGame', game);
  });
});

const getImageDimensions = async (imageUrl: string) => {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const { width, height } = await sharp(response.data).metadata();

    return {
      width,
      height,
    };
  } catch (e) {
    // Might be some weird crap if it's not an image file ionno
    console.error(e);
  }

  return INITIAL_GAME_STATE.cropSize;
};

const resetGame = async () => {
  game = {
    ...INITIAL_GAME_STATE,
    data: {},
    configs: {},
    sides: gameSides,
    imageUrl: gameImageUrl,
  };

  const { data, configs, cropSize, pieceSize, sides, imageUrl } = game;

  const { width, height } = await getImageDimensions(imageUrl);

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
