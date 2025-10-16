<script setup lang="ts">
import { useStore } from '../store';
import ModalDialog from './ModalDialog.vue';
import { ArrowPathIcon } from '@heroicons/vue/24/solid';

interface Props {
  isOpen: boolean;
}

const { isOpen } = defineProps<Props>();
const emit = defineEmits<{ (e: 'close'): void }>();

const store = useStore();

const handleCancel = () => {
  emit('close');
};

const handleSuccess = () => {
  emit('close');
  store.resetGame();
};
</script>

<template>
  <ModalDialog
    @success="handleSuccess"
    @cancel="handleCancel"
    :icon="ArrowPathIcon"
    title="Reset game"
    body="Are you sure you want to reset the game? You will lose your current progress."
    cancel-text="Cancel"
    success-text="OK"
    :isOpen="isOpen"
    v-bind="$attrs"
  />
</template>
