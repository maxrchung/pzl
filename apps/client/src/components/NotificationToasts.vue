<script setup lang="ts">
import { computed, FunctionalComponent } from 'vue';
import { useStore } from '../store';
import {
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  InformationCircleIcon,
  MoonIcon,
  PhotoIcon,
  SunIcon,
} from '@heroicons/vue/24/solid';
import PzlIcon from './PzlIcon.vue';
import { Z_INDEX } from '../constants';

// lol
const ICONS: { [componentName: string]: FunctionalComponent | typeof PzlIcon } =
  {
    ArrowPathIcon,
    ArrowsPointingOutIcon,
    MoonIcon,
    PhotoIcon,
    PzlIcon,
    SunIcon,
  };
const FADE_DURATION_IN_MS = 150;

const store = useStore();
// For now I'm only planning to display one message at a time
const notifications = computed(() => store.notifications);
</script>

<template>
  <slot />

  <TransitionGroup
    tag="ul"
    enter-active-class="ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <li
      v-for="notification in notifications"
      :key="notification.id"
      role="status"
      aria-live="polite"
      :class="[
        'fixed top-4 left-1/2 flex -translate-x-1/2 justify-between gap-2 border bg-white px-3 py-2 shadow-lg transition dark:border-white dark:bg-black',
        `duration-${FADE_DURATION_IN_MS}`,
        Z_INDEX.TOOLTIP,
      ]"
    >
      <component
        :is="ICONS[notification.icon] || InformationCircleIcon"
        class="size-6 shrink-0"
      />
      {{ notification.message }}
    </li>
  </TransitionGroup>
</template>
