<script setup lang="ts">
import { useStore } from '../store';
import FixedPanel from '../components/FixedPanel.vue';
import PrimaryButton from '../components/PrimaryButton.vue';

const store = useStore();
</script>

<template>
  <FixedPanel>
    <div class="flex gap-2">
      <PrimaryButton @click="store.connectSocket">Connect</PrimaryButton>

      <PrimaryButton @click="store.disconnectSocket">Disconnect</PrimaryButton>
    </div>

    <p>isConnected: {{ store.isConnected }}</p>
  </FixedPanel>
</template>
