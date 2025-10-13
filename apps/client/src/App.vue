<script setup lang="ts">
import { socket } from './socket';
import { useStore } from './store';
import NotificationToasts from './components/NotificationToasts.vue';
import { computed } from 'vue';

const store = useStore();
const isDark = computed(() => store.theme === 'dark');

// remove any existing listeners (after a hot module replacement)
socket.off();

store.bindEvents();
</script>

<template>
  <div
    :class="['font-serif transition-colors dark:text-white', { dark: isDark }]"
  >
    <NotificationToasts>
      <RouterView />
    </NotificationToasts>
  </div>
</template>
