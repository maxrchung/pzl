<script setup lang="ts">
import { socket } from './socket';
import { useStore } from './store';
import NotificationMessages from './components/NotificationMessages.vue';

const store = useStore();

// remove any existing listeners (after a hot module replacement)
socket.off();

store.bindEvents();
</script>

<template>
  <NotificationMessages>
    <RouterView />
  </NotificationMessages>
</template>
