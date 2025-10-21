<script setup lang="ts">
import { ArrowPathIcon, XMarkIcon } from '@heroicons/vue/24/solid';
import { Z_INDEX } from '../constants';
import { FocusTrap } from 'focus-trap-vue';
import type { Component } from 'vue';

interface Props {
  isOpen: boolean;
  isProcessing?: boolean;
  icon: Component;
  title: string;
  cancelText: string;
  successText: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const { isOpen, isProcessing, onSuccess, onCancel, cancelText, successText } =
  defineProps<Props>();
</script>

<template>
  <Teleport to="#modals">
    <FocusTrap :active="isOpen">
      <Transition
        enter-active-class="ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          role="dialog"
          aria-labelledby="modal-title"
          :aria-modal="isOpen"
          :class="[
            'fixed inset-0 flex items-center justify-center transition-opacity',
            Z_INDEX.MODAL,
          ]"
        >
          <div
            class="fixed inset-0 bg-black opacity-80 transition dark:bg-white"
            @click="!isProcessing && onCancel()"
            :aria-disabled="isProcessing"
          />

          <div
            :class="[
              'mx-5 flex max-w-lg flex-col border-1 bg-stone-50 shadow-lg dark:bg-stone-950',
              // I don't really get it but without this min-w-0 then something
              // something flex content blah blah. Basically I ran into an issue
              // with long file names on small screens.
              'min-w-0',
              Z_INDEX.MODAL,
            ]"
          >
            <header class="flex justify-between">
              <div class="flex items-center gap-2 border-b-black px-3">
                <Component :is="icon" class="size-6" />
                <h2 class="text-xl" id="modal-title">{{ title }}</h2>
              </div>

              <button
                :class="[
                  'flex shrink-0 cursor-pointer bg-stone-100 p-2 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800',
                ]"
                type="button"
                @click="onCancel"
                :disabled="isProcessing"
              >
                <XMarkIcon class="size-6 shrink-0" />
              </button>
            </header>

            <div class="px-3 pt-2 pb-4">
              <slot />
            </div>

            <footer class="flex justify-end">
              <button
                class="cursor-pointer bg-stone-100 px-3 py-2 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800"
                type="button"
                @click="onCancel"
                :disabled="isProcessing"
              >
                {{ cancelText }}
              </button>

              <button
                class="flex cursor-pointer gap-2 border-t border-l bg-stone-100 px-3 py-2 hover:bg-stone-200 disabled:cursor-wait disabled:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 dark:disabled:bg-stone-800"
                type="button"
                @click="onSuccess"
                :disabled="isProcessing"
              >
                <ArrowPathIcon
                  v-if="isProcessing"
                  class="size-6 animate-spin"
                />

                {{ successText }}
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </FocusTrap>
  </Teleport>
</template>
