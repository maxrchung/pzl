<template>
  <button
    v-bind="$attrs"
    class="border border-black bg-stone-100 px-3 py-2 shadow-sm hover:cursor-pointer hover:bg-stone-200"
  >
    <slot />
  </button>
</template>
