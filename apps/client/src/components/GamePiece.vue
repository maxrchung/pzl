<script setup lang="ts">
import { computed, ref } from 'vue';
import { Edge, PieceConfig, STROKE_WIDTH } from '@pzl/shared';
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
  const { cropSize, pieceSize, tabLength } = store.game;

  // Normalize tab length to actual image length
  const cropTabLength = (tabLength * cropSize.width) / pieceSize.width;

  return {
    image,
    crop: {
      height: cropSize.height + cropTabLength * 2,
      width: cropSize.width + cropTabLength * 2,
      x: pieceConfig.index.x * cropSize.width - cropTabLength,
      y: pieceConfig.index.y * cropSize.height - cropTabLength,
    },
    height: pieceSize.height + tabLength * 2,
    width: pieceSize.width + tabLength * 2,
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

const group = computed<GroupConfig>(() => {
  const {
    edge,
    pieceSize: { width, height },
    tabLength,
  } = store.game;

  return {
    ...pieceConfig,
    clipFunc: (context) => {
      const drawTop = (length: number) => {
        switch (edge) {
          case Edge.SquareTab:
            context.lineTo(length / 2 - tabLength / 2, 0);
            context.lineTo(length / 2 - tabLength / 2, -tabLength);
            context.lineTo(length / 2 + tabLength / 2, -tabLength);
            context.lineTo(length / 2 + tabLength / 2, 0);
            context.lineTo(length, 0);
            break;
          case Edge.SquareBlank:
            context.lineTo(length / 2 - tabLength / 2, 0);
            context.lineTo(length / 2 - tabLength / 2, tabLength);
            context.lineTo(length / 2 + tabLength / 2, tabLength);
            context.lineTo(length / 2 + tabLength / 2, 0);
            context.lineTo(length, 0);
            break;
          case Edge.None:
          default:
            context.lineTo(length, 0);
        }
      };

      context.save();

      // Move to top left draw start
      context.translate(tabLength, tabLength);

      // Top
      drawTop(width);

      // Right
      context.translate(width, 0);
      context.rotate(Math.PI / 2);
      drawTop(height);

      // Bottom
      context.translate(height, 0);
      context.rotate(Math.PI / 2);
      drawTop(width);

      // Left
      context.translate(width, 0);
      context.rotate(Math.PI / 2);
      drawTop(height);

      // Reset back to top left corner
      context.restore();
    },
  };
});

const pieceRef = ref();
defineExpose({ pieceRef });
</script>

<template>
  <v-group ref="pieceRef" :config="group">
    <v-image :config="piece" />
  </v-group>
</template>
