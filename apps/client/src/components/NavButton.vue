<script setup lang="ts">
interface Props {
  tooltip: string;
}

const { tooltip } = defineProps<Props>();
</script>

<template>
  <button
    :aria-label="tooltip"
    :aria-describedby="`${tooltip} tooltip`"
    v-bind="$attrs"
    type="button"
    class="group relative flex size-10 shrink-0 cursor-pointer items-center justify-center self-start border-b-1 border-l-1 bg-stone-100 shadow-sm transition-colors hover:bg-stone-200 dark:border-l-white dark:bg-stone-900 dark:hover:bg-stone-800"
  >
    <slot />

    <!-- Focus visible ensures tooltip only appears on keyboard navigation and not on mobile press -->
    <div
      :id="`${tooltip} tooltip`"
      role="tooltip"
      class="pointer-events-none absolute top-full right-2.5 mt-4 border-1 bg-white px-3 py-2 whitespace-nowrap opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-black"
    >
      {{ tooltip }}

      <!-- Caret -->
      <div
        class="absolute -top-1.75 right-0.5 size-3 rotate-45 border-t border-l bg-white transition dark:bg-black"
      />
    </div>
  </button>
</template>
