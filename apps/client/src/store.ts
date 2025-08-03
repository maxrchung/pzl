import { defineStore } from 'pinia';
import { socket } from './socket';
import { SecretState } from '@pzl/shared';

export const useStore = defineStore('store', {
  state: () => ({
    isConnected: false,
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

      socket.on('refreshSecret', (data) => {
        this.secret = data;
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
