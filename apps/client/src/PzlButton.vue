<template>
  <button
    v-bind="$attrs"
    class="border-3 border-black bg-slate-100 p-2 hover:cursor-pointer hover:bg-slate-300"
  >
    <slot />
  </button>
</template>
