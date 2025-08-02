<script setup lang="ts">
import { onUnmounted } from 'vue';
import { useStore } from '../store';
import SecretPanel from '../components/SecretPanel.vue';

const store = useStore();

store.connectSocket();

// Refresh every second for updates
store.resetSecret();
const intervalId = setInterval(() => {
  store.resetSecret();
}, 1000);

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<template>
  <SecretPanel />
</template>
