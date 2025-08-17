import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import sharp from 'sharp';
import {
  type ClientToServerEvents,
  type SecretState,
  type ServerToClientEvents,
  DEFAULT_IMAGE_URL,
  INITIAL_GAME_STATE,
  moveGroup,
  PieceData,
  SERVER_PORT,
  SERVER_URL,
  snapGroup,
  STAGE_LENGTH,
} from '@pzl/shared';
import axios from 'axios';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const app = express();
const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: '*',
  },
});

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
    data: {}, // Have to make sure to wipe objects
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
  pieceSize.width = isWidthLarger ? pieceLength : pieceLength * ratio;
  pieceSize.height = isWidthLarger ? pieceLength / ratio : pieceLength;

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

  console.log('Game reset');
};

server.listen(SERVER_PORT, async () => {
  console.log(`Server listening on port: ${SERVER_PORT}`);

  await resetGame();
});

const uploadsDirectory = path.join(__dirname, 'uploads');

app.use('/uploads', express.static(uploadsDirectory));

const upload = multer({
  dest: uploadsDirectory,
  limits: {
    // 10 MB
    fileSize: 10_000_000,
  },
});

app.post('/upload', upload.single('image'), async (request) => {
  if (!request.file?.filename) {
    return;
  }

  const oldImageUrl = new URL(game.imageUrl);

  // Keep default image so dev server reload doesn't break
  if (oldImageUrl.href !== DEFAULT_IMAGE_URL) {
    const oldImagePath = path.join(__dirname, oldImageUrl.pathname);
    fs.unlink(oldImagePath, (error) => {
      if (error) {
        throw error;
      }
    });
  }

  const newImageUrl = new URL(
    path.join('uploads', request.file.filename),
    SERVER_URL,
  );

  gameImageUrl = newImageUrl.href;

  await resetGame();

  io.emit('refreshGame', game);
});
