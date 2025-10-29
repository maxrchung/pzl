<script setup lang="ts">
import { useStore } from '../store';
import { ModalEmits, ModalProps } from '../types';
import ModalDialog from './ModalDialog.vue';
import { ArrowPathIcon } from '@heroicons/vue/24/solid';

const { isOpen } = defineProps<ModalProps>();
const emit = defineEmits<ModalEmits>();

const store = useStore();

const close = () => {
  emit('close');
};

const handleSuccess = () => {
  close();
  store.resetGame();
};
</script>

<template>
  <ModalDialog
    @cancel="close"
    @success="handleSuccess"
    :icon="ArrowPathIcon"
    title="Reset puzzle"
    cancel-text="Cancel"
    success-text="OK"
    :isOpen="isOpen"
    v-bind="$attrs"
  >
    <p>
      Are you sure you want to reset the puzzle? You'll lose your current
      progress.
    </p>
  </ModalDialog>
</template>
