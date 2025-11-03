<script setup lang="ts">
import { computed, ref } from 'vue';
import { PieceData } from '@pzl/shared';
import { useStore } from '../store';
import { ImageConfig } from 'konva/lib/shapes/Image';

interface Props {
  image: HTMLImageElement;
  data: PieceData;
}

const { image, data } = defineProps<Props>();

const imageRef = ref();

const store = useStore();
const theme = computed(() => store.theme);

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
    stroke: theme.value === 'dark' ? 'white' : 'black',
    strokeWidth: 2,
    strokeScaleEnabled: false,
    perfectDrawEnabled: false,
    shadowForStrokeEnabled: false,
    shadowEnabled: false,
    dashEnabled: false,
    hitStrokeWidth: 0,
  } as ImageConfig;
});

defineExpose({ imageRef });
</script>

<template>
  <v-image ref="imageRef" :key="piece.id" :config="piece" />
</template>
