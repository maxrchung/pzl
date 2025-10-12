<script setup lang="ts">
import PzlIcon from './PzlIcon.vue';
import ThemeButton from './ThemeButton.vue';
import SettingsButton from './SettingsButton.vue';
</script>

<template>
  <nav
    class="fixed top-0 right-0 left-0 flex h-10 items-center justify-between border-b-1 bg-stone-50 shadow-sm transition-colors dark:border-b-white dark:bg-stone-950"
  >
    <div class="flex items-center gap-1 pl-2">
      <PzlIcon class="size-6 rotate-180" />

      <!-- Translate a bit to center better -->
      <h1 class="-translate-y-0.5 text-2xl">pzl</h1>
    </div>

    <div class="flex">
      <ThemeButton />

      <SettingsButton />
    </div>
  </nav>
</template>
