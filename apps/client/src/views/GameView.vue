<script setup lang="ts">
import { useRoute } from 'vue-router';
import GameStage from '../components/GameStage.vue';
import { useStore } from '../store';
import { watchEffect } from 'vue';

const route = useRoute();
const store = useStore();

// Reload whenever path changes, e.g. new lobby
watchEffect(() => {
  store.emptyGame();
  store.joinLobby(route.params.id as string);
});
</script>

<template>
  <GameStage />
</template>
