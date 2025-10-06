<template>
  <button
    v-bind="$attrs"
    class="border-3 border-black bg-slate-100 px-3 py-2 shadow-sm hover:cursor-pointer hover:bg-slate-200"
  >
    <slot />
  </button>
</template>
