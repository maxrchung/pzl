<script setup lang="ts">
import { ModalEmits, ModalProps } from '../types';
import ModalDialog from './ModalDialog.vue';
import {
  ArrowsPointingOutIcon,
  ChevronDownIcon,
  SwatchIcon,
  ViewColumnsIcon,
} from '@heroicons/vue/24/solid';
import NumberInput from './NumberInput.vue';
import RangeInput from './RangeInput.vue';
import { Ref, ref } from 'vue';
import { useStore } from '../store';
import { Edge } from '@pzl/shared';

const { isOpen } = defineProps<ModalProps>();
const emit = defineEmits<ModalEmits>();

const store = useStore();

const columnValue = ref(store.game.sides.columns);
const rowValue = ref(store.game.sides.rows);
const edgeValue = ref(store.game.edge);

const handleChange = (reference: Ref<number>) => (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  if (!value) return;

  const num = parseInt(value, 10);
  if (isNaN(num)) return;

  if (num < 1) {
    reference.value = 1;
    return;
  }

  if (num > 50) {
    reference.value = 50;
    return;
  }

  reference.value = num;
};
const handleColumnChange = handleChange(columnValue);
const handleRowChange = handleChange(rowValue);

const handleEdgeChange = (event: Event) => {
  // TS safe... probably because select constrains the value
  const value = (event.target as HTMLSelectElement).value;
  if (!value) return;

  const number = Number(value);
  if (isNaN(number)) return;

  edgeValue.value = number;
};

const close = () => {
  emit('close');
};

const handleSuccess = () => {
  store.updatePieces(columnValue.value, rowValue.value, edgeValue.value);
  close();
};
</script>

<template>
  <ModalDialog
    @cancel="close"
    @success="handleSuccess"
    :icon="ArrowsPointingOutIcon"
    title="Change pieces"
    cancel-text="Cancel"
    success-text="Save"
    :isOpen="isOpen"
    v-bind="$attrs"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <label for="outline" class="flex gap-2"
            ><SwatchIcon class="size-6" /> Design</label
          >

          <div class="relative">
            <select
              name="design"
              @change="handleEdgeChange"
              :value="edgeValue"
              class="cursor-pointer appearance-none border bg-stone-100 py-1.25 pr-7 pl-3 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800"
            >
              <option :value="Edge.None">Straight</option>
              <option :value="Edge.SquareTab">Square</option>
            </select>

            <ChevronDownIcon
              class="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2"
            />
          </div>
        </div>
      </div>

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
            class="bg-stone border bg-stone-100 px-3 py-1 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800"
            @change="handleColumnChange"
            :value="columnValue"
          />
        </div>

        <RangeInput
          name="columns-range"
          min="1"
          max="50"
          step="1"
          inputmode="numeric"
          class="h-1 w-80 cursor-pointer appearance-none border-none bg-black dark:bg-white"
          @input="handleColumnChange"
          :value="columnValue"
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
            step="1"
            class="bg-stone border bg-stone-100 px-3 py-1 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800"
            @change="handleRowChange"
            :value="rowValue"
          />
        </div>

        <RangeInput
          name="rows-range"
          min="1"
          max="50"
          :class="[
            'h-1 w-80 cursor-pointer appearance-none border-none bg-black dark:bg-white',
          ]"
          @input="handleRowChange"
          :value="rowValue"
        />
      </div>
    </div>
  </ModalDialog>
</template>
