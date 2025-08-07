<script setup lang="ts">
import { computed, ref } from 'vue';
import { PieceData } from '@pzl/shared';
import { useStore } from '../store';

interface GamePieceProps {
  image: HTMLImageElement;
  data: PieceData;
}

const { image, data } = defineProps<GamePieceProps>();

const imageRef = ref();

const store = useStore();

const piece = computed(() => {
  const { cropSize, pieceSize } = store.game;

  return {
    ...data,
    image,
    crop: {
      height: cropSize.height,
      width: cropSize.width,
      x: data.index.x * cropSize.width,
      y: data.index.y * cropSize.height,
    },
    height: pieceSize.height,
    width: pieceSize.width,
  };
});

defineExpose({ imageRef });
</script>

<template>
  <v-image ref="imageRef" :key="piece.id" :config="piece" />
</template>
