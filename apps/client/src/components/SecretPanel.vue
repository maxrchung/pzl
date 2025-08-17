<script setup lang="ts">
import { useStore } from '../store';
import PrimaryButton from './PrimaryButton.vue';
import PrimaryInput from './PrimaryInput.vue';
import FileInput from './FileInput.vue';
import HorizontalRule from './HorizontalRule.vue';
import { SERVER_URL } from '@pzl/shared';

const store = useStore();

const handleClick = () => {
  store.resetGame();
};

const handleSidesChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const sides = Number(target.value);

  store.updateSides(sides);
};

const handleImageUrlChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const imageUrl = target.value;

  store.updateImageUrl(imageUrl);
};

const handleImageChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  fetch(`${SERVER_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
};
</script>

<template>
  <div class="p-8">
    <div
      class="flex w-full flex-col items-start gap-4 border-3 border-black bg-white p-6"
    >
      <p>isConnected: {{ store.isConnected }}</p>
      <HorizontalRule />

      <p>connections: {{ store.secret.connections }}</p>
      <HorizontalRule />

      <PrimaryButton @click="handleClick">Reset game</PrimaryButton>
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

      <p>
        imageUrl:
        <PrimaryInput
          class="w-96"
          :value="store.game.imageUrl"
          @change="handleImageUrlChange"
        />
      </p>

      <img class="max-h-96 max-w-96" :src="store.game.imageUrl" />
      <FileInput accept="image/*" type="file" @change="handleImageChange" />
    </div>
  </div>
</template>
