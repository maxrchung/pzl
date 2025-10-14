<script setup lang="ts">
import { WrenchScrewdriverIcon } from '@heroicons/vue/24/solid';
import TooltipButton from './TooltipButton.vue';
import { ref } from 'vue';
import { Z_INDEX } from '../constants';
import ResetItem from './ResetItem.vue';

const isOpen = ref(false);

const toggleSettings = () => {
  isOpen.value = !isOpen.value;
};

const closeSettings = () => {
  isOpen.value = false;
};
</script>

<template>
  <div class="relative">
    <TooltipButton
      tooltip="Open settings..."
      :is-open="isOpen"
      @click="toggleSettings"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      id="Open settings... button"
      :class="{
        'border-b-transparent': isOpen,
      }"
    >
      <WrenchScrewdriverIcon class="size-6" />
    </TooltipButton>

    <!-- Even though it's just an opacity transition, this is needed for
    handling v-if as expected -->
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
        :aria-hidden="!isOpen"
        :class="[
          'absolute top-full right-0 flex flex-col whitespace-nowrap shadow-md',
          Z_INDEX.DROPDOWN,
          { 'opacity-0': !isOpen },
          { 'opacity-100': isOpen },
        ]"
      >
        <ResetItem :close-settings="closeSettings" />
      </ul>
    </Transition>
  </div>
</template>
