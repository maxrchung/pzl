import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import sharp from 'sharp';
import { PORT } from './constants';
import type {
  ClientToServerEvents,
  ConfigMap,
  PieceConfig,
  PiecesMap,
  ServerToClientEvents,
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
    socket.emit('refreshSecret', { connections: io.sockets.sockets.size });
  };

  console.log(`Client connected: ${socket.id}`);
  socket.emit('refreshGame', pieces, configs);
  refreshSecret(socket);

  socket.on('disconnect', (reason) => {
    console.log(`Client ${socket.id} disconnected: ${reason}`);
  });

  socket.on('refreshSecret', () => {
    refreshSecret(socket);
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

const sides = 5;
const stageLength = 1000;

const pieces: PiecesMap = {};
const configs: ConfigMap = {};

httpServer.listen(PORT, async () => {
  console.log(`Server listening on port: ${PORT}`);

  const { width, height } = await getImageDimensions();

  const cropWidth = width / sides;
  const cropHeight = height / sides;

  const isWidthLarger = width >= height;
  const ratio = width / height;

  const pieceLength = stageLength / sides;
  const pieceWidth = isWidthLarger ? pieceLength : stageLength * ratio;
  const pieceHeight = isWidthLarger ? pieceLength / ratio : stageLength;

  const getInitialPosition = () => {
    const x = Math.random() * (stageLength - pieceWidth);
    const y = Math.random() * (stageLength - pieceHeight);

    return { x, y };
  };

  let id = 0;

  for (let i = 0; i < sides; ++i) {
    for (let j = 0; j < sides; ++j) {
      const stringId = (id++).toString();

      const piece: PieceConfig = {
        id: stringId,
        groupId: stringId,
        // image is required in ImageConfig but we can't set it on the server
        // because it's an HTML element
        image: undefined,
        crop: {
          height: cropHeight,
          width: cropWidth,
          x: j * cropWidth,
          y: i * cropHeight,
        },
        width: pieceWidth,
        height: pieceHeight,
        pieceX: j,
        pieceY: i,
        draggable: true,
      };

      pieces[stringId] = [piece];
      configs[stringId] = getInitialPosition();
    }
  }
});
