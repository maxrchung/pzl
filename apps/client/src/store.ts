import { defineStore } from 'pinia';
import { socket } from './socket';
import { createGame, moveGroup, SecretState, snapGroup } from '@pzl/shared';
import { Vector2d } from 'konva/lib/types';
import { Notification, NotificationType } from './types';

export const useStore = defineStore('store', {
  state: () => ({
    isConnected: false,
    game: createGame(),
    secret: {
      connections: 0,
    } as SecretState,
    notification: null as Notification | null,
    theme:
      localStorage.getItem('theme') ||
      // Depending on user preference
      (window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'),
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

      socket.on('addNotification', (message, icon) => {
        this.addNotification(message, icon);
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

    addNotification(message: string, icon: string, type?: NotificationType) {
      const notification = { id: Symbol(), message, icon, type };
      this.notification = notification;
    },

    removeNotification() {
      this.notification = null;
    },

    setTheme(theme: string) {
      this.theme = theme;
      localStorage.setItem('theme', theme);
    },
  },
});
