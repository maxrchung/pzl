import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@pzl/shared';
import pino from 'pino';
import { Server, Socket } from 'socket.io';

export const log = pino({
  // Removes pid and hostname fields
  base: null,
  // Removes time field
  timestamp: false,
  // Some hack to work with Railway? Idk
  // https://station.railway.com/questions/railway-is-overriding-pino-s-log-level-e7c3e6be#tr0v
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

export const logArgs = (args: unknown[]) => {
  if (!args) return;
  if (!Array.isArray(args)) return;

  const filter = args.filter(
    (arg) => Boolean(arg) && typeof arg !== 'function',
  );
  if (filter.length === 0) return;

  return filter;
};

/** Patch io.to for logging */
export const logEmit = (
  io: Server<ClientToServerEvents, ServerToClientEvents, never, SocketData>,
) => {
  const _to = io.to.bind(io);
  io.to = (roomId: string) => {
    const room = _to(roomId);

    const _emit = room.emit.bind(room);
    room.emit = (event, ...args) => {
      log.info({
        network: 'emit',
        event,
        args: event !== 'refreshGame' ? logArgs(args) : undefined,
        lobbyId: roomId,
      });

      return _emit(event, ...args);
    };

    return room;
  };
};

/** Patch socket.to for logging */
export const logBroadcast = (
  socket: Socket<ClientToServerEvents, ServerToClientEvents, never, SocketData>,
) => {
  const _to = socket.to.bind(socket);
  socket.to = (roomId: string) => {
    const room = _to(roomId);

    const _emit = room.emit.bind(room);
    room.emit = (event, ...args) => {
      if (event !== 'moveGroup') {
        log.info({
          network: 'broadcast',
          event,
          args: logArgs(args),
          lobbyId: roomId,
        });
      }

      return _emit(event, ...args);
    };

    return room;
  };
};

export const logIncoming = (
  socket: Socket<ClientToServerEvents, ServerToClientEvents, never, SocketData>,
) => {
  socket.onAny((event, ...args) => {
    // Don't log this as it'll be too noisy
    if (event === 'moveGroup') return;

    log.info({
      network: 'incoming',
      event,
      args: logArgs(args),
      socketId: socket.id,
      lobbyId: socket.data.lobbyId,
    });
  });
};

export const logOutgoing = (
  socket: Socket<ClientToServerEvents, ServerToClientEvents, never, SocketData>,
) => {
  socket.onAnyOutgoing((event, ...args) => {
    if (event === 'moveGroup') return;

    log.info({
      network: 'outgoing',
      event,
      args: event !== 'refreshGame' ? logArgs(args) : undefined,
      socketId: socket.id,
      lobbyId: socket.data.lobbyId,
    });
  });
};
