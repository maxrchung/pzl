<script setup lang="ts">
import PzlButton from './PzlButton.vue';
import PzlStage from './PzlStage.vue';
import { socket } from './socket';
import { useStore } from './store';

const store = useStore();

// remove any existing listeners (after a hot module replacement)
socket.off();

store.bindEvents();
</script>

<template>
  <PzlStage />

  <div class="fixed top-4 left-4 border-3 border-black bg-white p-4">
    <div class="flex flex-col gap-2">
      <div class="flex gap-2">
        <PzlButton @click="store.connect"> Connect </PzlButton>

        <PzlButton @click="store.disconnect">Disconnect</PzlButton>
      </div>

      <p>isConnected: {{ store.isConnected }}</p>
    </div>
  </div>
</template>
