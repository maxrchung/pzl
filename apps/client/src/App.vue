<script setup lang="ts">
import { socket } from './socket';
import { useStore } from './store';
import NotificationMessages from './components/NotificationMessages.vue';
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
    <NotificationMessages>
      <RouterView />
    </NotificationMessages>
  </div>
</template>
