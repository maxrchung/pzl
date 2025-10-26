import { defineStore } from 'pinia';
import { socket } from './socket';
import {
  createEmptyGame,
  moveGroup,
  Notification,
  snapGroup,
} from '@pzl/shared';
import { Vector2d } from 'konva/lib/types';
import axios from 'axios';
import router from './router';

export const useStore = defineStore('store', {
  state: () => ({
    isConnected: false,
    game: createEmptyGame(),
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

      socket.on('refreshGame', (game) => {
        this.game = game;
      });

      socket.on('moveGroup', (groupId, position) => {
        moveGroup(this.game, groupId, position);
      });

      socket.on('snapGroup', (fromGroupId, toGroupId) => {
        snapGroup(this.game, fromGroupId, toGroupId);
      });

      socket.on('addNotification', (notification) => {
        this.addNotification(notification);
      });
    },

    connectSocket() {
      socket.connect();
    },

    disconnectSocket() {
      socket.disconnect();
    },

    moveGroup(groupId: string, position: Vector2d) {
      // It may seem weird to update the position locally since it's already
      // handled by Konva drag, but it's needed to resolve some weird
      // situations. For example, if you move a group and then reset game, you
      // may notice that the group's X position keeps its position before reset.
      // The reason this happens is because the group never received any config
      // changes, so when reset game happens, it may update the X config value
      // to 0 again. If the X config value was 0 before, then Konva thinks
      // nothing's changed.
      moveGroup(this.game, groupId, position);

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

    updateSides(columns: number, rows: number) {
      socket.emit('updateSides', columns, rows);
    },

    // Updating image is a bit special because we're using presign. Presign lets
    // a client upload (with restrictions). It's lighter on the server since the
    // client is responsible for uploading now.
    async updateImage(file: File, height: number, width: number) {
      return new Promise<void>((resolve) => {
        socket.emit('presign', file.type, async (presign) => {
          const { url, fields } = presign;

          const formData = new FormData();
          for (const [key, value] of Object.entries(fields)) {
            formData.append(key, value as string);
          }
          formData.append('file', file);
          await axios.post(url, formData);

          const key = fields.key;
          socket.emit('updateImage', key, height, width);

          resolve();
        });
      });
    },

    addNotification(notification: Notification) {
      this.notification = {
        ...notification,
        id: Symbol(),
      };
    },

    removeNotification() {
      this.notification = null;
    },

    setTheme(theme: string) {
      this.theme = theme;
      localStorage.setItem('theme', theme);
    },

    createLobby() {
      socket.emit('createLobby', (lobbyId) => {
        router.push(`/${lobbyId}`);

        this.addNotification({
          message: 'New lobby created',
          icon: 'PlusIcon',
        });
      });
    },

    joinLobby(lobbyId: string) {
      socket.emit('joinLobby', lobbyId, (ok) => {
        if (!ok) {
          this.addNotification({
            message:
              "Lobby couldn't load. It may have expired or doesn't exist.",
            icon: 'ExclamationTriangleIcon',
            type: 'error',
            isPermanent: true,
          });

          router.push('/');
        }
      });
    },

    leaveLobby() {
      socket.emit('leaveLobby');
    },

    emptyGame() {
      this.game = createEmptyGame();
    },
  },
});
