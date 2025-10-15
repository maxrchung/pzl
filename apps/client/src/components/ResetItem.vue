<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from '../store';
import ModalDialog from './ModalDialog.vue';
import { ArrowPathIcon } from '@heroicons/vue/24/solid';

const store = useStore();

const isOpen = ref(false);

const handleClick = () => {
  isOpen.value = true;
};

const handleCancel = () => {
  isOpen.value = false;
};

const handleSuccess = () => {
  isOpen.value = false;
  store.resetGame();
};
</script>

<template>
  <li role="menuitem">
    <button
      class="flex cursor-pointer gap-2 border-b-1 border-l-1 bg-stone-100 px-3 py-2 transition hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800"
      @click="handleClick"
      v-bind="$attrs"
    >
      <ArrowPathIcon class="size-6" />
      Reset game...
    </button>

    <ModalDialog
      @success="handleSuccess"
      @cancel="handleCancel"
      :icon="ArrowPathIcon"
      title="Reset game"
      body="Are you sure you want to reset the game? You will lose your current progress."
      cancel-text="Cancel"
      success-text="OK"
      :isOpen="isOpen"
    />
  </li>
</template>
