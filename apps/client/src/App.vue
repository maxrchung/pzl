<script setup lang="ts">
import KonvaTest from './KonvaTest.vue';
import { socket } from './socket';
import { useStore } from './store';

const store = useStore();

// remove any existing listeners (after a hot module replacement)
socket.off();

store.bindEvents();
</script>

<template>
  <button @click="store.connect">Connect</button>
  <button @click="store.disconnect">Disconnect</button>
  <p>isConnected: {{ store.isConnected }}</p>

  <KonvaTest />
</template>
