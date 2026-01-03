<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/solid';
import PzlIcon from '../components/PzlIcon.vue';
import { useStore } from '../store';

const store = useStore();
store.leaveLobby();

const handleClick = () => {
  store.createLobby();
};

const sizes = [4, 8, 16, 32, 64, 128];
const sizeOffset = sizes[sizes.length - 1] / 2;

const colors = [
  'hsl(0, 100%, 50%)',
  'hsl(30, 100%, 50%)',
  'hsl(60, 100%, 50%)',
  'hsl(90, 100%, 50%)',
  'hsl(120, 100%, 50%)',
  'hsl(150, 100%, 50%)',
  'hsl(180, 100%, 50%)',
  'hsl(210, 100%, 50%)',
  'hsl(240, 100%, 50%)',
  'hsl(270, 100%, 50%)',
  'hsl(300, 100%, 50%)',
  'hsl(330, 100%, 50%)',
];

const count = 10000;

const configs = [];
for (let i = 0; i < count; ++i) {
  const size = sizes[Math.floor(Math.random() * sizes.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const x = Math.random() * (1024 + sizeOffset) - sizeOffset;
  const y = Math.random() * (512 + sizeOffset) - sizeOffset;

  const config = { size, color, x, y };
  configs.push(config);
}
</script>

<template>
  <div
    class="flex h-screen w-screen flex-col items-center justify-center gap-2 bg-white transition dark:bg-black"
  >
    <div class="flex items-center gap-1">
      <PzlIcon class="size-6 rotate-180" />

      <!-- Translate a bit to center better -->
      <h1 class="-translate-y-0.5 text-2xl">pzl</h1>
    </div>

    <p class="px-3 text-center">
      Multiplayer online real-time co-op no-talking custom jigsaw puzzle web
      game
    </p>

    <button
      class="left- mt-2 flex cursor-pointer gap-2 border bg-stone-100 px-3 py-2 shadow-md transition hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800"
      @click="handleClick"
    >
      <PlusIcon class="size-6" /> Create new puzzle
    </button>

    <div
      :style="{
        position: 'relative',
        width: '1024px',
        height: '512px',
      }"
    >
      <PlusIcon
        v-for="(config, index) in configs"
        :key="index"
        :style="{
          position: 'absolute',
          left: config.x + 'px',
          top: config.y + 'px',
          width: config.size + 'px',
          height: config.size + 'px',
          color: config.color,
        }"
      />
    </div>
  </div>
</template>
