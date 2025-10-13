<script setup lang="ts">
import { computed, FunctionalComponent, ref, watchEffect } from 'vue';
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
const ACTIVE_DURATION_IN_MS = 2000;

const store = useStore();
// Indicates when Transition should run
const visible = ref(false);
// For now I'm only planning to display one message at a time
const notification = computed(() => store.notifications[0]);

let timeout: number = 0;

// Watch when notifications changes
watchEffect(() => {
  // If there are multiple notifications, get rid of current and proceed to next
  if (store.notifications.length >= 2) {
    window.clearTimeout(timeout);
    visible.value = false;
  }

  // Otherwise if there is a first notification, show it and get rid of it
  else if (notification.value) {
    visible.value = true;

    // Hide after fade-in + visible duration
    timeout = window.setTimeout(() => {
      visible.value = false;
    }, FADE_DURATION_IN_MS + ACTIVE_DURATION_IN_MS);
  }
});

const handleAfterLeave = () => {
  store.removeNotification();
};
</script>

<template>
  <slot />

  <Transition
    enter-active-class="ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
    @after-leave="handleAfterLeave"
  >
    <div
      v-if="visible && notification"
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
    </div>
  </Transition>
</template>
