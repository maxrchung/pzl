<script setup lang="ts">
import { WrenchScrewdriverIcon } from '@heroicons/vue/24/solid';
import TooltipButton from './TooltipButton.vue';
import { onBeforeUnmount, onMounted, Ref, ref } from 'vue';
import { Z_INDEX } from '../constants';
import ResetItem from './ResetItem.vue';

const isOpen = ref(false);
const buttonRef = ref<Ref<{ buttonRef: HTMLButtonElement }> | null>(null);
const menuRef = ref<HTMLUListElement | null>(null);

const toggleSettings = () => {
  isOpen.value = !isOpen.value;
};

const closeSettings = () => {
  isOpen.value = false;
};

// Handler to close settings menu when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (!isOpen.value) return;

  const target = event.target;
  if (!(target instanceof Element)) return;

  // In theory I wouldn't think this block necessary, but removing this block
  // for some reason makes it so that clicking the button sometimes doesn't
  // allow you to open the settings. There's probably some competing setter
  // where we try to open but then this handler fires and immediately closes.
  const button = buttonRef.value?.buttonRef;
  if (!button) return;
  if (button.contains(target)) return;

  const menu = menuRef.value;
  if (!menu) return;
  if (menu.contains(target)) return;

  const isModal = target.closest('#modals');
  if (isModal) return;

  isOpen.value = false;
}

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() =>
  document.removeEventListener('click', handleClickOutside),
);
</script>

<template>
  <div class="relative">
    <TooltipButton
      ref="buttonRef"
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
        ref="menuRef"
        v-if="isOpen"
        id="Settings menu"
        role="menu"
        aria-labelledby="Open settings... button"
        :aria-hidden="!isOpen"
        :class="[
          'absolute top-full right-0 flex flex-col whitespace-nowrap shadow-md transition-opacity',
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
