<script setup lang="ts">
import {
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  PhotoIcon,
  QrCodeIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/solid';
import TooltipButton from './TooltipButton.vue';
import { onBeforeUnmount, onMounted, Ref, ref } from 'vue';
import { Z_INDEX } from '../constants';
import MenuItem from './MenuItem.vue';
import QrCodeModal from './QrCodeModal.vue';
import ResetModal from './ResetModal.vue';
import ImageModal from './ImageModal.vue';
import PiecesModal from './PiecesModal.vue';
import CopyItem from './CopyItem.vue';

type Modal = '' | 'qrcode' | 'reset' | 'image' | 'pieces';

const isOpen = ref(false);
const modal = ref<Modal>('');

/** Instead of ensuring each modal cleans up for itself, we just increment this
 * to force a new modal to be made */
const modalKey = ref(0);

const buttonRef = ref<Ref<{ buttonRef: HTMLButtonElement }> | null>(null);
const menuRef = ref<HTMLUListElement | null>(null);

const openModal = (id: Modal) => {
  modal.value = id;
  isOpen.value = false;
  ++modalKey.value;
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
      tooltip="Open settings..."
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
        <CopyItem @click="isOpen = false" />

        <MenuItem
          :icon="QrCodeIcon"
          title="QR code..."
          @click="openModal('qrcode')"
        />

        <MenuItem
          :icon="ArrowPathIcon"
          title="Reset puzzle..."
          @click="openModal('reset')"
        />

        <MenuItem
          :icon="ArrowsPointingOutIcon"
          title="Change pieces..."
          @click="openModal('pieces')"
        />

        <MenuItem
          :icon="PhotoIcon"
          title="Change image..."
          @click="openModal('image')"
        />
      </ul>
    </Transition>

    <!-- I had an iteration where modals were inside MenuItem, but this didn't
    really work for some reason because MenuItem would get unrendered and cause
    modals to also close -->
    <QrCodeModal
      :isOpen="modal === 'qrcode'"
      @close="closeModal"
      :key="modalKey"
    />

    <ResetModal
      :isOpen="modal === 'reset'"
      @close="closeModal"
      :key="modalKey"
    />

    <PiecesModal
      :isOpen="modal === 'pieces'"
      @close="closeModal"
      :key="modalKey"
    />

    <ImageModal
      :isOpen="modal === 'image'"
      @close="closeModal"
      :key="modalKey"
    />
  </div>
</template>
