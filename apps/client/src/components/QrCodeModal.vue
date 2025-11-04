<script setup lang="ts">
import { ModalEmits, ModalProps } from '../types';
import ModalDialog from './ModalDialog.vue';
import { QrCodeIcon } from '@heroicons/vue/24/solid';
import QrcodeVue from 'qrcode.vue';

const { isOpen } = defineProps<ModalProps>();
const emit = defineEmits<ModalEmits>();

const close = () => {
  emit('close');
};

const url = window.location.href;
const imageSettings = {
  src: '/favicon.svg',
  width: 60,
  height: 60,
};
</script>

<template>
  <ModalDialog
    @cancel="close"
    @success="close"
    :icon="QrCodeIcon"
    title="QR code"
    success-text="Back"
    :isOpen="isOpen"
    v-bind="$attrs"
  >
    <div class="bg-white p-2.5">
      <QrcodeVue :value="url" :size="300" :image-settings="imageSettings" />
    </div>
  </ModalDialog>
</template>
