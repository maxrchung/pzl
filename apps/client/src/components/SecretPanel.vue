<script setup lang="ts">
import FixedPanel from '../components/FixedPanel.vue';
import { useStore } from '../store';

const store = useStore();
</script>

<template>
  <FixedPanel>
    <p>isConnected: {{ store.isConnected }}</p>

    <p>connections: {{ store.secret.connections }}</p>
  </FixedPanel>
</template>
