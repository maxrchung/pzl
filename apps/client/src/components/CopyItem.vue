<script setup lang="ts">
import { LinkIcon } from '@heroicons/vue/24/solid';
import MenuItem from './MenuItem.vue';
import { useStore } from '../store';

const store = useStore();

const handleClick = () => {
  navigator.clipboard.writeText(window.location.href);

  store.addNotification({
    icon: 'LinkIcon',
    message: 'Lobby link copied to clipboard',
  });
};
</script>

<template>
  <MenuItem
    :icon="LinkIcon"
    title="Copy link"
    @click="handleClick"
    v-bind="$attrs"
  />
</template>
