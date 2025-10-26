<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/solid';
import PzlIcon from '../components/PzlIcon.vue';
import { useStore } from '../store';

const store = useStore();
store.leaveLobby();

const handleClick = () => {
  store.createLobby();
};
</script>

<template>
  <div
    class="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-white transition dark:bg-black"
  >
    <div class="flex items-center gap-1 pl-2">
      <PzlIcon class="size-6 rotate-180" />

      <!-- Translate a bit to center better -->
      <h1 class="-translate-y-0.5 text-2xl">pzl</h1>
    </div>

    <p class="px-3">
      Multiplayer online real-time co-op custom jigsaw puzzle web game
    </p>

    <button
      class="flex cursor-pointer gap-2 border bg-stone-100 px-3 py-2 shadow-md hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800"
      @click="handleClick"
    >
      <PlusIcon class="size-6" /> Create new lobby
    </button>
  </div>
</template>
