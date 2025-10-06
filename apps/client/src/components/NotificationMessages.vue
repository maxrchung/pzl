<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../store';

const FADE_IN_MS = 150;
const TOP_OFFSET_IN_PX = 8;
const TOP_POSITION = 24;

const store = useStore();
const notifications = computed(() => store.notifications);

const getTop = (index: number, length: number) => {
  const reversedIndex = length - 1 - index;
  const top = TOP_POSITION + reversedIndex * TOP_OFFSET_IN_PX;
  console.log(top);

  return top + 'px';
};
</script>

<template>
  <slot />

  <TransitionGroup
    tag="ul"
    :enter-active-class="`transition-all duration-${FADE_IN_MS} ease-out`"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    :leave-active-class="`transition-all duration-${FADE_IN_MS} ease-in`"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <li
      v-for="(notification, index) in notifications"
      :key="notification.id"
      role="status"
      aria-live="polite"
      class="fixed left-1/2 flex -translate-x-1/2 justify-between gap-2 border-3 bg-white px-3 py-2 shadow-lg"
      :style="{ top: getTop(index, notifications.length) }"
    >
      {{ notification.message }}
    </li>
  </TransitionGroup>
</template>
