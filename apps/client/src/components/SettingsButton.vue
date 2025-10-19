<script setup lang="ts">
import {
  ArrowPathIcon,
  PhotoIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/solid';
import TooltipButton from './TooltipButton.vue';
import { onBeforeUnmount, onMounted, Ref, ref } from 'vue';
import { Z_INDEX } from '../constants';
import MenuItem from './MenuItem.vue';
import ResetModal from './ResetModal.vue';
import ImageModal from './ImageModal.vue';

type Modal = '' | 'reset' | 'image';

const isOpen = ref(false);
const modal = ref<Modal>('');

const buttonRef = ref<Ref<{ buttonRef: HTMLButtonElement }> | null>(null);
const menuRef = ref<HTMLUListElement | null>(null);

const openModal = (id: Modal) => {
  modal.value = id;
  isOpen.value = false;
};

const closeModal = () => {
  modal.value = '';
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
      tooltip="Settings"
      id="settings"
      :isOpen="isOpen"
      @click="isOpen = !isOpen"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
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
        role="menu"
        aria-labelledby="settings"
        :aria-hidden="!isOpen"
        :class="[
          'absolute top-full right-0 flex flex-col whitespace-nowrap shadow-md transition-opacity',
          Z_INDEX.DROPDOWN,
          { 'opacity-0': !isOpen },
          { 'opacity-100': isOpen },
        ]"
      >
        <MenuItem
          :icon="ArrowPathIcon"
          title="Reset game"
          @click="openModal('reset')"
        />

        <MenuItem :icon="PhotoIcon" title="Image" @click="openModal('image')" />
      </ul>
    </Transition>

    <!-- I had an iteration where modals were inside MenuItem, but this didn't
    really work for some reason because MenuItem would get unrendered and cause
    modals to also close. -->
    <ResetModal :isOpen="modal === 'reset'" @close="closeModal" />

    <ImageModal :isOpen="modal === 'image'" @close="closeModal" />
  </div>
</template>
