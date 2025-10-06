import { defineStore } from 'pinia';
import { socket } from './socket';
import {
  createGame,
  Notification,
  moveGroup,
  SecretState,
  snapGroup,
} from '@pzl/shared';
import { Vector2d } from 'konva/lib/types';
import { nanoid } from 'nanoid';
import { NOTIFICATION_DURATION_IN_MS } from './constants';

export const useStore = defineStore('store', {
  state: () => ({
    isConnected: false,
    game: createGame(),
    secret: {
      connections: 0,
    } as SecretState,
    notifications: [] as Notification[],
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

      socket.on('addNotification', (message) => {
        this.notifications.push({ id: nanoid(), message });
        setTimeout(this.removeNotification, NOTIFICATION_DURATION_IN_MS);
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

    updateSides(sides: number) {
      socket.emit('updateSides', sides);
    },

    updateImage(key: string, height: number, width: number) {
      socket.emit('updateImage', key, height, width);
    },

    removeNotification() {
      this.notifications.shift();
    },
  },
});
