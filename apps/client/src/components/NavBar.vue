<script setup lang="ts">
import { SunIcon, MoonIcon } from '@heroicons/vue/24/solid';
import { computed } from 'vue';
import { useStore } from '../store';
import PzlIcon from './PzlIcon.vue';

const store = useStore();
const theme = computed(() => store.theme);

const handleThemeClick = () =>
  store.setTheme(theme.value === 'light' ? 'dark' : 'light');
</script>

<template>
  <nav
    class="fixed top-0 right-0 left-0 flex h-10 items-center justify-between border-b-1 bg-stone-50 transition-colors dark:border-b-white dark:bg-stone-950"
  >
    <div class="flex items-center gap-1 pl-2">
      <PzlIcon class="size-6 rotate-180" />

      <!-- Translate a bit to center better -->
      <h1 class="-translate-y-0.5 text-2xl">pzl</h1>
    </div>

    <button
      aria-label="Change theme"
      aria-describedby="theme-tooltip"
      @click="handleThemeClick"
      type="button"
      class="group relative flex size-10 shrink-0 cursor-pointer items-center justify-center self-start border-b-1 border-l-1 bg-stone-100 shadow-sm transition-colors hover:bg-stone-200 dark:border-l-white dark:bg-stone-900 dark:hover:bg-stone-800"
    >
      <span v-if="theme === 'light'"><SunIcon class="size-6" /></span>
      <span v-else-if="theme === 'dark'"><MoonIcon class="size-6" /></span>

      <!-- Focus visible ensures tooltip only appears on keyboard navigation and not on mobile press -->
      <div
        id="theme-tooltip"
        role="tooltip"
        class="pointer-events-none absolute top-full right-2.5 mt-4 border-1 bg-white px-3 py-2 whitespace-nowrap opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-black"
      >
        Change theme

        <!-- Caret -->
        <div
          class="absolute -top-1.75 right-0.5 size-3 rotate-45 border-t border-l bg-white transition dark:bg-black"
        />
      </div>
    </button>
  </nav>
</template>
