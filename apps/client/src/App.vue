<script setup lang="ts">
import { socket } from './socket';
import { useStore } from './store';
import NotificationToast from './components/NotificationToast.vue';
import { computed } from 'vue';
import NavBar from './components/NavBar.vue';

const store = useStore();
const isDark = computed(() => store.theme === 'dark');

// remove any existing listeners (after a hot module replacement)
socket.off();

store.bindEvents();
</script>

<template>
  <div
    :class="[
      'overscroll-none font-serif transition-colors dark:text-white',
      { dark: isDark },
    ]"
  >
    <NotificationToast>
      <RouterView />

      <NavBar />

      <div id="modals" />
    </NotificationToast>
  </div>
</template>
