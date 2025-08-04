import { defineStore } from 'pinia';
import { socket } from './socket';
import { ConfigMap, PiecesMap, SecretState } from '@pzl/shared';

export const useStore = defineStore('store', {
  state: () => ({
    isConnected: false,
    game: {
      pieces: {} as PiecesMap,
      configs: {} as ConfigMap,
    },
    secret: {
      connections: 0,
    } as SecretState,
  }),
  actions: {
    bindEvents() {
      socket.on('connect', () => {
        this.isConnected = true;
      });

      socket.on('disconnect', () => {
        this.isConnected = false;
      });

      socket.on('refreshSecret', (secret) => {
        this.secret = secret;
      });

      socket.on('refreshGame', (pieces, configs) => {
        this.game.pieces = pieces;
        this.game.configs = configs;
      });
    },

    connectSocket() {
      socket.connect();
    },

    disconnectSocket() {
      socket.disconnect();
    },

    refreshSecret() {
      socket.emit('refreshSecret');
    },
  },
});
