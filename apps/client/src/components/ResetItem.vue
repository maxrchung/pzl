<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from '../store';
import ModalDialog from './ModalDialog.vue';
import { ArrowPathIcon } from '@heroicons/vue/24/solid';

const emit = defineEmits<{ (e: 'close'): void }>();

const store = useStore();
const isOpen = ref(false);

const handleCancel = () => {
  emit('close');
  isOpen.value = false;
};

const handleSuccess = () => {
  emit('close');
  isOpen.value = false;
  store.resetGame();
};
</script>

<template>
  <li role="menuitem">
    <button
      :class="[
        'flex cursor-pointer gap-2 border-b-1 border-l-1 px-3 py-2 transition hover:bg-stone-200 dark:hover:bg-stone-800',
        { 'bg-stone-100 dark:bg-stone-900': !isOpen },
        { 'bg-stone-200 dark:bg-stone-800': isOpen },
      ]"
      @click="isOpen = true"
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
