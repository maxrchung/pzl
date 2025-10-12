<script setup lang="ts">
import { SunIcon, MoonIcon } from '@heroicons/vue/24/solid';
import { computed } from 'vue';
import { useStore } from '../store';
import NavButton from './NavButton.vue';

const store = useStore();
const theme = computed(() => store.theme);

const handleClick = () =>
  store.setTheme(theme.value === 'light' ? 'dark' : 'light');
</script>

<template>
  <NavButton tooltip="Change theme" @click="handleClick">
    <span v-if="theme === 'light'"><SunIcon class="size-6" /></span>
    <span v-else-if="theme === 'dark'"><MoonIcon class="size-6" /></span>
  </NavButton>
</template>
