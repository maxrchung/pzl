<script setup lang="ts">
import { useRoute } from 'vue-router';
import GameStage from '../components/GameStage.vue';
import { useStore } from '../store';

const route = useRoute();
const store = useStore();

store.joinLobby(route.params.id as string);
</script>

<template>
  <GameStage />
</template>
