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
const url = ref('');
const imgRef = ref<HTMLImageElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const isProcessing = ref(false);

const reset = () => {
  emit('close');
  file.value = null;
  if (url.value) {
    URL.revokeObjectURL(url.value);
  }
  url.value = '';
};

const handleChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const firstFile = target.files?.[0];

  if (!imgRef.value) return;
  if (!firstFile) {
    return;
  }

  // To avoid layout shift, test with a new Image first
  const image = new Image();

  if (url.value) {
    URL.revokeObjectURL(url.value);
  }
  url.value = URL.createObjectURL(firstFile);
  image.src = url.value;

  try {
    await image.decode();

    imgRef.value.src = url.value;
    await imgRef.value.decode();
    file.value = firstFile;
  } catch (error) {
    // If we error, don't save the file

    console.error(error);
    store.addNotification(
      'Image failed to load',
      'ExclamationTriangleIcon',
      'error',
    );
  }
};

const handleSuccess = async () => {
  if (!file.value || !imgRef.value) {
    // In this case, nothing was selected. We proceed and keep the existing
    // image as is.
    reset();
    return;
  }

  try {
    isProcessing.value = true;

    const presign = await axios.post(`${SERVER_URL}/presign`, {
      type: file.value.type,
    });
    const { url, fields } = presign.data;

    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value as string);
    }
    formData.append('file', file.value);
    await axios.post(url, formData);

    const key = fields.key;
    const { naturalHeight, naturalWidth } = imgRef.value;
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
    title="Image"
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
        :class="[
          'max-h-[384px] max-w-full self-center border object-contain transition',
        ]"
      />

      <div class="flex items-center gap-2 whitespace-nowrap">
        <button
          :disabled="isProcessing"
          class="cursor-pointer self-start border bg-stone-100 px-3 py-2 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800"
          @click="inputRef?.click()"
        >
          Change image
        </button>

        <span v-if="!!file?.name" class="truncate">
          {{ file?.name }}
        </span>
      </div>

      <input
        ref="inputRef"
        accept="image/*"
        type="file"
        id="file"
        :hidden="true"
        @change="handleChange"
      />
    </div>
  </ModalDialog>
</template>
