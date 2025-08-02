<script setup lang="ts">
import { socket } from './socket';
import { useStore } from './store';

const store = useStore();

// remove any existing listeners (after a hot module replacement)
socket.off();

store.bindEvents();
</script>

<template>
  <RouterView />
</template>
