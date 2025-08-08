<script setup lang="ts">
import FixedPanel from '../components/FixedPanel.vue';
import { useStore } from '../store';
import PrimaryButton from './PrimaryButton.vue';

const store = useStore();

const handleClick = () => {
  store.resetGame();
};
</script>

<template>
  <FixedPanel>
    <p>isConnected: {{ store.isConnected }}</p>

    <p>connections: {{ store.secret.connections }}</p>

    <PrimaryButton @click="handleClick">Reset game</PrimaryButton>
  </FixedPanel>
</template>
