<script setup lang="ts">
import { computed, ref } from 'vue';
import { PieceConfig, STROKE_WIDTH } from '@pzl/shared';
import { useStore } from '../store';
import { ImageConfig } from 'konva/lib/shapes/Image';
import { GroupConfig } from 'konva/lib/Group';

interface Props {
  image: HTMLImageElement;
  pieceConfig: PieceConfig;
}

const { image, pieceConfig } = defineProps<Props>();

const store = useStore();
const theme = computed(() => store.theme);

const piece = computed<ImageConfig>(() => {
  const { cropSize, pieceSize } = store.game;

  return {
    image,
    crop: {
      height: cropSize.height,
      width: cropSize.width,
      x: pieceConfig.index.x * cropSize.width,
      y: pieceConfig.index.y * cropSize.height,
    },
    height: pieceSize.height,
    width: pieceSize.width,
    stroke: theme.value === 'dark' ? 'white' : 'black',
    strokeWidth: STROKE_WIDTH,
    strokeScaleEnabled: true,
    perfectDrawEnabled: false,
    shadowForStrokeEnabled: false,
    shadowEnabled: false,
    dashEnabled: false,
    hitStrokeWidth: 0,
  };
});

const group = computed<GroupConfig>(() => ({
  ...pieceConfig,
  clipFunc: (context) => {
    const width = store.game.pieceSize.width;
    const height = store.game.pieceSize.height;

    context.lineTo(width, 0);
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.lineTo(0, 0);
  },
}));

const pieceRef = ref();
defineExpose({ pieceRef });
</script>

<template>
  <v-group ref="pieceRef" :config="group">
    <v-image :config="piece" />
  </v-group>
</template>
