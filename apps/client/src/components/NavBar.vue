<script setup lang="ts">
import { SunIcon, MoonIcon, PuzzlePieceIcon } from '@heroicons/vue/24/solid';
import { computed } from 'vue';
import { useStore } from '../store';

const store = useStore();
const theme = computed(() => store.theme);

const handleThemeClick = () =>
  store.setTheme(theme.value === 'light' ? 'dark' : 'light');
</script>

<template>
  <nav
    class="fixed top-0 right-0 left-0 flex h-10 items-center justify-between border-b-1 bg-slate-50 transition-colors dark:border-b-white dark:bg-slate-950"
  >
    <div class="flex items-center gap-1 pl-2">
      <PuzzlePieceIcon class="size-6 rotate-180" />

      <!-- Translate a bit to center better -->
      <h1 class="-translate-y-0.5 text-2xl">pzl</h1>
    </div>
    <button
      aria-label="Toggle theme"
      @click="handleThemeClick"
      class="flex size-10 shrink-0 cursor-pointer items-center justify-center self-start border-b-1 border-l-1 bg-slate-100 shadow-sm transition-colors hover:bg-slate-200 dark:border-l-white dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <span v-if="theme === 'light'"><SunIcon class="size-6" /></span>
      <span v-else-if="theme === 'dark'"><MoonIcon class="size-6" /></span>
    </button>
  </nav>
</template>
