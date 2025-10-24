<script setup lang="ts">
import { computed, FunctionalComponent, ref, watch } from 'vue';
import { useStore } from '../store';
import {
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  ExclamationTriangleIcon,
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
    ExclamationTriangleIcon,
    MoonIcon,
    PhotoIcon,
    PzlIcon,
    SunIcon,
  };
const FADE_DURATION_IN_MS = 150;
const ACTIVE_DURATION_IN_MS = 2000;

const store = useStore();
const visible = ref(false);
// For now I'm only planning to display one message at a time
const notification = computed(() => store.notification);

let timeout = 0;

watch(notification, (notification) => {
  if (notification) {
    visible.value = true;
    clearTimeout(timeout);

    if (!notification.isPermanent) {
      timeout = window.setTimeout(() => {
        store.removeNotification();
      }, FADE_DURATION_IN_MS + ACTIVE_DURATION_IN_MS);
    }
  } else {
    visible.value = false;
  }
});
</script>

<template>
  <slot />

  <div
    :class="[
      'fixed top-4 right-0 left-0 flex justify-center px-5',
      // I don't know about this one lol
      'pointer-events-none',
      Z_INDEX.NOTIFICATION,
    ]"
  >
    <Transition
      enter-active-class="ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="visible && notification"
        :key="notification.id"
        role="status"
        aria-live="polite"
        :class="[
          'absolute flex max-w-sm justify-between gap-2 border bg-white px-3 py-2 shadow-lg transition dark:bg-black',
          // Does this work and will it matter? ionno
          'pointer-events-auto',
          {
            'border-red-500 dark:border-red-500': notification.type === 'error',
          },
          {
            'border-black dark:border-white':
              !notification.type || notification.type === 'info',
          },
          `duration-${FADE_DURATION_IN_MS}`,
        ]"
      >
        <component
          :is="ICONS[notification.icon] || InformationCircleIcon"
          :class="[
            'size-6 shrink-0',
            { 'text-red-500': notification.type === 'error' },
          ]"
        />
        {{ notification.message }}
      </div>
    </Transition>
  </div>
</template>
