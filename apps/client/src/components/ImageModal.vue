<script setup lang="ts">
import { ref } from 'vue';
import { SERVER_URL } from '../constants';
import { useStore } from '../store';
import { ModalEmits, ModalProps } from '../types';
import ModalDialog from './ModalDialog.vue';
import { PhotoIcon } from '@heroicons/vue/24/solid';
import axios from 'axios';

const { isOpen } = defineProps<ModalProps>();
const emit = defineEmits<ModalEmits>();

const store = useStore();
const file = ref<File | null>(null);
const imgRef = ref<HTMLImageElement | null>(null);
const isProcessing = ref(false);

const reset = () => {
  emit('close');
  file.value = null;
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const firstFile = target.files?.[0];

  if (!imgRef.value) return;
  if (!firstFile) {
    file.value = null;
    imgRef.value.src = '';
    return;
  }

  // To avoid layout shift, test with a separate image
  const image = new Image();
  const url = URL.createObjectURL(firstFile);
  image.src = url;

  try {
    await image.decode();

    imgRef.value.src = url;
    await imgRef.value.decode();
    file.value = firstFile;
  } catch (error) {
    file.value = null;
    imgRef.value.src = '';

    console.error(error);
    store.addNotification('Image failed to load', 'ExclamationTriangleIcon');
  } finally {
    URL.revokeObjectURL(url);
  }
};

const handleSuccess = async () => {
  if (!file.value || !imgRef.value) {
    store.addNotification(
      'Image needs to be selected',
      'ExclamationTriangleIcon',
    );
    return;
  }

  // Probably good enough indicator ?
  const { complete, naturalHeight, naturalWidth } = imgRef.value;
  if (!complete || !naturalHeight || !naturalWidth) {
    store.addNotification('Image failed to load', 'ExclamationTriangleIcon');
    return;
  }

  try {
    isProcessing.value = true;

    const presign = await axios.get(`${SERVER_URL}/presign`);
    const { url, fields } = presign.data;

    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value as string);
    }
    formData.append('file', file.value);
    await axios.post(url, formData);

    const key = fields.key;
    store.updateImage(key, naturalHeight, naturalWidth);
    reset();
  } catch (error) {
    console.error(error);
    store.addNotification('Image failed to save', 'ExclamationTriangleIcon');
  } finally {
    isProcessing.value = false;
  }
};
</script>

<template>
  <ModalDialog
    @cancel="reset"
    @success="handleSuccess"
    :icon="PhotoIcon"
    title="Change image"
    cancel-text="Cancel"
    success-text="Save"
    :isOpen="isOpen"
    :isProcessing="isProcessing"
    v-bind="$attrs"
  >
    <div class="flex flex-col gap-3">
      <img
        ref="imgRef"
        alt="Preview"
        :src="store.game.imageUrl"
        :class="['max-h-[320px] max-w-full border object-contain transition']"
      />

      <input
        accept="image/*"
        type="file"
        id="file"
        @change="handleFileChange"
        class="cursor-pointer file:cursor-pointer file:border file:bg-stone-100 file:px-3 file:py-2 hover:file:bg-stone-200 dark:file:bg-stone-900 dark:hover:file:bg-stone-800"
      />
    </div>
  </ModalDialog>
</template>
