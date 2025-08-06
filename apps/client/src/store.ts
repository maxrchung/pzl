import { defineStore } from 'pinia';
import { socket } from './socket';
import { INITIAL_GAME_STATE, SecretState } from '@pzl/shared';
import { Vector2d } from 'konva/lib/types';

export const useStore = defineStore('store', {
  state: () => ({
    isConnected: false,
    game: INITIAL_GAME_STATE,
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

      socket.on('refreshGame', (game) => {
        this.game = game;
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

    moveGroup(groupId: string, position: Vector2d) {
      socket.emit('moveGroup', groupId, position);
    },
  },
});
