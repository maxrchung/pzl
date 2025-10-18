<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  icon: Component;
  title: string;
}

const { icon, title } = defineProps<Props>();
</script>

<template>
  <li role="menuitem">
    <button
      :class="[
        'flex w-full cursor-pointer gap-2 border-b-1 border-l-1 bg-stone-100 px-3 py-2 transition hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800',
      ]"
      v-bind="$attrs"
    >
      <Component :is="icon" class="size-6" />
      {{ title }}
    </button>
  </li>
</template>
