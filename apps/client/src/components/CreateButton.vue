<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/solid';
import TooltipButton from './TooltipButton.vue';

const handleClick = async () => {};
</script>

<template>
  <TooltipButton tooltip="Create new lobby" @click="handleClick">
    <PlusIcon class="size-6" />
  </TooltipButton>
</template>
