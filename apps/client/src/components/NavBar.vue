<script setup lang="ts">
import PzlIcon from './PzlIcon.vue';
import ThemeButton from './ThemeButton.vue';
import CreateButton from './CreateButton.vue';
import SettingsButton from './SettingsButton.vue';
import { Z_INDEX } from '../constants';
import { useRoute } from 'vue-router';
import GitHubButton from './GitHubButton.vue';

const route = useRoute();
</script>

<template>
  <Transition
    enter-active-class="ease-out"
    enter-from-class="opacity-0 -translate-y-10"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-10"
  >
    <nav
      v-if="route.path !== '/'"
      :class="[
        'fixed top-0 right-0 left-0 flex h-10 items-center justify-between border-b-1 bg-stone-50 shadow-sm transition dark:border-b-white dark:bg-stone-950',
        Z_INDEX.NAVBAR,
      ]"
    >
      <RouterLink to="/" class="flex items-center gap-1 pl-2">
        <PzlIcon class="size-6 rotate-180" />

        <!-- Translate a bit to center better -->
        <h1 class="-translate-y-0.5 text-2xl">pzl</h1>
      </RouterLink>

      <div class="flex">
        <GitHubButton />

        <CreateButton />

        <ThemeButton />

        <SettingsButton />
      </div>
    </nav>
  </Transition>
</template>
