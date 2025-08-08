import { defineStore } from 'pinia';
import { socket } from './socket';
import {
  INITIAL_GAME_STATE,
  moveGroup,
  SecretState,
  snapGroup,
} from '@pzl/shared';
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

      socket.on('moveGroup', (groupId, position) => {
        moveGroup(this.game, groupId, position);
      });

      socket.on('snapGroup', (fromGroupId, toGroupId) => {
        snapGroup(this.game, fromGroupId, toGroupId);
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

    snapGroup(fromGroupId: string, toGroupId: string) {
      // Snap immediately on client side and broadcast to rest
      snapGroup(this.game, fromGroupId, toGroupId);
      socket.emit('snapGroup', fromGroupId, toGroupId);
    },

    resetGame() {
      socket.emit('resetGame');
    },
  },
});
