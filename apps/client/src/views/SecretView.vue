<script setup lang="ts">
import { useStore } from '../store';
import SecretPanel from '../components/SecretPanel.vue';
import { SECRET_INTERVAL_IN_MS } from '../constants';

const store = useStore();

// Refresh every second for updates
setInterval(() => {
  store.refreshSecret();
}, SECRET_INTERVAL_IN_MS);
</script>

<template>
  <SecretPanel />
</template>
