<script setup lang="ts">
import { useStore } from '../store';
import PrimaryButton from './PrimaryButton.vue';
import PrimaryInput from './PrimaryInput.vue';
import FileInput from './FileInput.vue';
import HorizontalRule from './HorizontalRule.vue';
import { SERVER_URL } from '../constants';

const store = useStore();

const handleClick = () => {
  store.resetGame();
};

const handleSidesChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const sides = Number(target.value);

  store.updateSides(sides);
};

const handleImageChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    return;
  }

  const { height, width } = await createImageBitmap(file);

  const presign = await fetch(`${SERVER_URL}/presign`);
  const { url, fields } = await presign.json();

  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value as string);
  }
  formData.append('file', file);

  const post = { method: 'POST', body: formData };
  await fetch(url, post);

  const key = fields.key;
  store.updateImage(key, height, width);
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

      <p>imageUrl: {{ store.game.imageUrl }}</p>

      <img class="max-h-96 max-w-96" :src="store.game.imageUrl" />
      <FileInput accept="image/*" type="file" @change="handleImageChange" />
    </div>
  </div>
</template>
