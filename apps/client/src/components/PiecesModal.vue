<script setup lang="ts">
import { ModalEmits, ModalProps } from '../types';
import ModalDialog from './ModalDialog.vue';
import {
  ArrowsPointingOutIcon,
  ViewColumnsIcon,
} from '@heroicons/vue/24/solid';
import NumberInput from './NumberInput.vue';
import RangeInput from './RangeInput.vue';

const { isOpen } = defineProps<ModalProps>();
const emit = defineEmits<ModalEmits>();

const close = () => {
  emit('close');
};

const handleSuccess = () => {
  close();
};
</script>

<template>
  <ModalDialog
    @cancel="close"
    @success="handleSuccess"
    :icon="ArrowsPointingOutIcon"
    title="Pieces"
    cancel-text="Cancel"
    success-text="Save"
    :isOpen="isOpen"
    v-bind="$attrs"
  >
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <label for="columns-number" class="flex gap-2"
            ><ViewColumnsIcon class="size-6" /> Columns</label
          >
          <NumberInput
            id="columns-number"
            name="columns-number"
            min="1"
            max="50"
            class="bg-stone border px-3 py-1 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800"
          />
        </div>

        <RangeInput
          name="columns-range"
          min="1"
          max="50"
          class="h-1 w-80 cursor-pointer appearance-none border-none bg-black dark:bg-white"
        />
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <label for="rows-number" class="flex gap-2"
            ><ViewColumnsIcon class="size-6 rotate-90" /> Rows</label
          >
          <NumberInput
            id="rows-number"
            name="rows-number"
            min="1"
            max="50"
            class="bg-stone border px-3 py-1 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800"
          />
        </div>

        <RangeInput
          name="rows-range"
          min="1"
          max="50"
          :class="[
            'h-1 w-80 cursor-pointer appearance-none border-none bg-black dark:bg-white',
            // Some extra separation to account for slider thumb
            'mb-3',
          ]"
        />
      </div>
    </div>
  </ModalDialog>
</template>
