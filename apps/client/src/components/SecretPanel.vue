<script setup lang="ts">
import FixedPanel from '../components/FixedPanel.vue';
import { useStore } from '../store';
import PrimaryButton from './PrimaryButton.vue';
import PrimaryInput from './PrimaryInput.vue';

const store = useStore();

console.log(store.game);
console.log(store.game.sides);

const handleClick = () => {
  store.resetGame();
};

const handleSidesChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const sides = Number(target.value);
  store.updateSides(sides);
};
</script>

<template>
  <FixedPanel>
    <p>isConnected: {{ store.isConnected }}</p>

    <p>connections: {{ store.secret.connections }}</p>

    <PrimaryButton @click="handleClick">Reset game</PrimaryButton>

    <p>
      sides:
      <PrimaryInput
        type="number"
        :value="store.game.sides"
        @change="handleSidesChange"
      />
    </p>
  </FixedPanel>
</template>
