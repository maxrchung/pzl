<template>
  <input
    type="range"
    :class="[
      'h-1 w-80 cursor-pointer appearance-none border-none bg-black dark:bg-white',
      // Some extra separation to account for slider thumb
      'mb-2.5',
    ]"
    v-bind="$attrs"
  />
</template>
