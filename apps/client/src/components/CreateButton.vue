<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/solid';
import TooltipButton from './TooltipButton.vue';
import { useStore } from '../store';

const store = useStore();

const handleClick = async () => {
  store.createLobby();
};
</script>

<template>
  <TooltipButton tooltip="Create new lobby" @click="handleClick">
    <PlusIcon class="size-6" />
  </TooltipButton>
</template>
