<script setup lang="ts">
import { ref } from 'vue';
import { Z_INDEX } from '../constants';

interface Props {
  tooltip: string;
  isOpen?: boolean;
}

// Flag so that after click we don't display the tooltip. This feels kind of
// more intuitive to me?
const isClick = ref(false);
const { tooltip, isOpen = false } = defineProps<Props>();

const buttonRef = ref();
defineExpose({ buttonRef });
</script>

<template>
  <button
    ref="buttonRef"
    :aria-label="tooltip"
    v-bind="$attrs"
    type="button"
    @mouseleave="isClick = false"
    @click="isClick = true"
    :class="[
      'group relative flex size-10 shrink-0 cursor-pointer items-center justify-center self-start border-b-1 border-l-1 transition-colors hover:bg-stone-200 dark:border-l-white dark:hover:bg-stone-800',
      { 'bg-stone-100 dark:bg-stone-900': !isOpen },
      { 'bg-stone-200 dark:bg-stone-800': isOpen },
    ]"
  >
    <slot />

    <div
      aria-hidden="true"
      :class="[
        'pointer-events-none absolute top-full right-2.5 mt-4 border-1 bg-white px-3 py-2 whitespace-nowrap opacity-0 shadow-lg transition dark:bg-black',
        Z_INDEX.TOOLTIP,
        // Focus visible ensures tooltip only appears on keyboard navigation and not on mobile press
        {
          'group-hover:opacity-100 group-focus-visible:opacity-100':
            !isOpen && !isClick,
        },
      ]"
    >
      {{ tooltip }}

      <!-- Caret -->
      <div
        class="absolute -top-1.75 right-0.5 size-3 rotate-45 border-t border-l bg-white transition dark:bg-black"
      />
    </div>
  </button>
</template>
