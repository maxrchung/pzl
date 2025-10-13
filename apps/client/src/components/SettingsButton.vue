<script setup lang="ts">
import { ArrowPathIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/solid';
import TooltipButton from './TooltipButton.vue';
import { ref } from 'vue';
import { Z_INDEX } from '../constants';
import { useStore } from '../store';

const isOpen = ref(false);
const store = useStore();

const openSettings = () => {
  isOpen.value = !isOpen.value;
};

const resetGame = () => {
  store.resetGame();
  isOpen.value = false;
};
</script>

<template>
  <div class="relative" @mouseleave="isOpen = false">
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
          'absolute top-full right-0 flex flex-col whitespace-nowrap shadow-sm transition-transform duration-1000',
          Z_INDEX.DROPDOWN,
        ]"
      >
        <li role="menuitem">
          <button
            class="flex cursor-pointer gap-2 border-b-1 border-l-1 bg-stone-100 px-3 py-2 transition-colors hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800"
            @click="resetGame"
          >
            <ArrowPathIcon class="size-6" />
            Reset game
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>
