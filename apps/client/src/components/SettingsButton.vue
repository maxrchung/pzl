<script setup lang="ts">
import { ArrowPathIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/solid';
import TooltipButton from './TooltipButton.vue';
import { ref } from 'vue';
import { Z_INDEX } from '../constants';
import { useStore } from '../store';

const isOpen = ref(false);
const store = useStore();
const buttonRef = ref<InstanceType<typeof TooltipButton> | null>(null);
const itemsRef = ref<HTMLButtonElement[]>([]);

const setItemsRef = (button: HTMLButtonElement) => {
  debugger;
  if (!button) return;
  itemsRef.value.push(button);
};

const openSettings = () => {
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    const firstItem = itemsRef.value[0];
    if (firstItem) {
      firstItem.focus();
    }
  } else {
    buttonRef.value?.buttonRef.focus();
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (!isOpen.value) return;

  const items = itemsRef.value;
  const activeIndex = items.indexOf(
    document.activeElement as HTMLButtonElement,
  );

  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      e.preventDefault();
      if (activeIndex === -1) {
        items[0].focus();
        break;
      }

      const nextIndex = (activeIndex + 1) % items.length;
      items[nextIndex].focus();
      break;

    case 'ArrowUp':
    case 'ArrowLeft':
      e.preventDefault();
      if (activeIndex === -1) {
        items[items.length - 1].focus();
        break;
      }

      const prevIndex = (activeIndex - 1) % items.length;
      items[prevIndex].focus();
      break;

    case 'Home':
      e.preventDefault();
      items[0].focus();
      break;

    case 'End':
      e.preventDefault();
      items[items.length - 1].focus();
      break;

    case 'Escape':
      e.preventDefault();
      isOpen.value = false;
      buttonRef.value?.buttonRef.focus();
      break;
  }
};

const resetGame = () => {
  store.resetGame();
  isOpen.value = false;
};
</script>

<template>
  <div class="relative" @mouseleave="isOpen = false" @keydown="handleKeyDown">
    <TooltipButton
      tooltip="Open settings..."
      :isOpen="isOpen"
      @click="openSettings"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      id="Open settings... button"
      :class="{
        'border-b-transparent': isOpen,
      }"
      ref="buttonRef"
    >
      <WrenchScrewdriverIcon class="size-6" />
    </TooltipButton>

    <Transition
      enter-active-class="ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <ul
        v-if="isOpen"
        id="Settings menu"
        role="menu"
        aria-labelledby="Open settings... button"
        :class="[
          'absolute top-full right-0 flex flex-col whitespace-nowrap shadow-sm',
          Z_INDEX.DROPDOWN,
        ]"
      >
        <li role="menuitem">
          <button
            class="flex cursor-pointer gap-2 border-b-1 border-l-1 bg-stone-100 px-3 py-2 transition hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800"
            @click="resetGame"
            ref="setItemsRef"
          >
            <ArrowPathIcon class="size-6" />
            Reset game
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>
