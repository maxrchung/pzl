<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useStore } from '../store';
import { XMarkIcon } from '@heroicons/vue/24/outline';

const FADE_DURATION = 150;
const ACTIVE_DURATION = 2000;

const store = useStore();
// Indicates when Transition should run
const visible = ref(false);
// For now I'm only planning to display one message at a time
const notification = computed(() => store.notifications[0]);

let timeout: number = 0;

// Watch when notification changes different
watch(notification, (newValue) => {
  if (newValue) {
    visible.value = true;

    // Hide after fade-in + visible duration
    timeout = window.setTimeout(() => {
      visible.value = false;
    }, FADE_DURATION + ACTIVE_DURATION);
  }
});

const handleAfterLeave = () => {
  store.removeNotification();
};

const handleDismiss = () => {
  window.clearTimeout(timeout);
  visible.value = false;
};
</script>

<template>
  <slot />

  <Transition
    :enter-active-class="`transition-all duration-${FADE_DURATION} ease-out`"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    :leave-active-class="`transition-all duration-${FADE_DURATION} ease-in`"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
    @after-leave="handleAfterLeave"
  >
    <div
      v-if="visible && notification"
      role="status"
      aria-live="polite"
      class="fixed top-4 left-1/2 flex -translate-x-1/2 justify-between gap-2 border-3 bg-white px-3 py-2 shadow-lg"
    >
      <div class="self-center">
        {{ notification.message }}
      </div>

      <button
        v-if="notification.allowDismiss"
        class="flex size-8 shrink-0 cursor-pointer items-center justify-center self-start border-3 bg-slate-100 shadow-sm hover:bg-slate-200"
      >
        <XMarkIcon class="size-6" @click="handleDismiss" />
      </button>
    </div>
  </Transition>
</template>
