<script setup lang="ts">
import { useStore } from '../store';
import PrimaryInput from './PrimaryInput.vue';
import HorizontalRule from './HorizontalRule.vue';

const store = useStore();

const handleSidesChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const sides = Number(target.value);

  store.updateSides(sides);
};
</script>

<template>
  <div class="p-8">
    <div
      class="flex w-full flex-col items-start gap-4 border border-black bg-white p-6 shadow-md"
    >
      <p>isConnected: {{ store.isConnected }}</p>
      <HorizontalRule />

      <p>connections: {{ store.secret.connections }}</p>
      <HorizontalRule />

      <p>
        sides:
        <PrimaryInput
          type="number"
          :min="1"
          :value="store.game.sides"
          @input="handleSidesChange"
        />
      </p>
      <HorizontalRule />

      <p>imageUrl: {{ store.game.imageUrl }}</p>

      <img class="max-h-96 max-w-96" :src="store.game.imageUrl" />
    </div>
  </div>
</template>
