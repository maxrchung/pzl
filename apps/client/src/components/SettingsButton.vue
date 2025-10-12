<script setup lang="ts">
import { WrenchScrewdriverIcon } from '@heroicons/vue/24/solid';
import NavButton from './NavButton.vue';
import { ref } from 'vue';

const isOpen = ref(false);

const handleClick = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <NavButton tooltip="Open settings..." @click="handleClick" :isOpen="isOpen">
    <WrenchScrewdriverIcon class="size-6" />
  </NavButton>
</template>
