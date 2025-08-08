<script setup lang="ts">
import FixedPanel from '../components/FixedPanel.vue';
import { useStore } from '../store';
import PrimaryButton from './PrimaryButton.vue';
import PrimaryInput from './PrimaryInput.vue';

const store = useStore();

const handleClick = () => {
  store.resetGame();
};

const handleSidesChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const sides = Number(target.value);

  store.updateSides(sides);
};

const handleImageUrlChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const imageUrl = target.value;

  store.updateImageUrl(imageUrl);
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
        :min="1"
        :value="store.game.sides"
        @input="handleSidesChange"
      />
    </p>

    <p>
      imageUrl:
      <PrimaryInput
        :value="store.game.imageUrl"
        @change="handleImageUrlChange"
      />
    </p>
  </FixedPanel>
</template>
