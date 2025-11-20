<script setup lang="ts">
import { computed, ref } from 'vue';
import { Edge, PieceConfig } from '@pzl/shared';
import { useStore } from '../store';
import { ImageConfig } from 'konva/lib/shapes/Image';
import { GroupConfig } from 'konva/lib/Group';
import { ShapeConfig } from 'konva/lib/Shape';
import { Context } from 'konva/lib/Context';
import { STROKE_WIDTH } from '../constants';

interface Props {
  image: HTMLImageElement;
  pieceConfig: PieceConfig;
}

const { image, pieceConfig } = defineProps<Props>();

const store = useStore();
const theme = computed(() => store.theme);

const piece = computed<ImageConfig>(() => {
  const {
    cropSize,
    pieceSize,
    tabLength,
    sides: { columns, rows },
  } = store.game;
  const {
    index: { x, y },
  } = pieceConfig;

  // On iOS, it seems the browser/device does not allow you to render an
  // image out of bounds and/or there's really unpredicatable weird
  // behavior. So we calculate the offsets explicitly.
  const offset = {
    top: y === 0 ? 0 : 1,
    right: x === columns - 1 ? 0 : 1,
    left: x === 0 ? 0 : 1,
    bottom: y === rows - 1 ? 0 : 1,
  };

  // Normalize tab length to actual image length
  const cropTabLength = (tabLength * cropSize.width) / pieceSize.width;

  return {
    image,
    crop: {
      height:
        cropSize.height +
        offset.top * cropTabLength +
        offset.bottom * cropTabLength,
      width:
        cropSize.width +
        offset.left * cropTabLength +
        offset.right * cropTabLength,
      x: pieceConfig.index.x * cropSize.width - offset.left * cropTabLength,
      y: pieceConfig.index.y * cropSize.height - offset.top * cropTabLength,
    },
    height:
      pieceSize.height + offset.top * tabLength + offset.bottom * tabLength,
    width: pieceSize.width + offset.left * tabLength + offset.right * tabLength,
    x: offset.left ? 0 : tabLength,
    y: offset.top ? 0 : tabLength,
  };
});

const drawPath = (
  context: Context,
  width: number,
  height: number,
  tabLength: number,
  edges: PieceConfig['edges'],
) => {
  const drawTop = (length: number, edge: Edge) => {
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

  // Move to top left draw start
  context.translate(tabLength, tabLength);

  // Top
  drawTop(width, edges.top);

  // Right
  context.translate(width, 0);
  context.rotate(Math.PI / 2);
  drawTop(height, edges.right);

  // Bottom
  context.translate(height, 0);
  context.rotate(Math.PI / 2);
  drawTop(width, edges.bottom);

  // Left
  context.translate(width, 0);
  context.rotate(Math.PI / 2);
  drawTop(height, edges.left);
};

const group = computed<GroupConfig>(() => {
  const {
    pieceSize: { width, height },
    tabLength,
  } = store.game;
  const { edges } = pieceConfig;

  return {
    ...pieceConfig,
    clipFunc: (context) => {
      // Save current context transform
      context.save();

      drawPath(context, width, height, tabLength, edges);

      // Reset transforms
      context.restore();
    },
  };
});

const border = computed<ShapeConfig>(() => {
  return {
    ...pieceConfig, // I think the `id` is needed
    stroke: theme.value === 'dark' ? 'white' : 'black',
    strokeWidth: STROKE_WIDTH,
    strokeScaleEnabled: false,
    perfectDrawEnabled: false,
    shadowForStrokeEnabled: false,
    shadowEnabled: false,
    dashEnabled: false,
    hitStrokeWidth: 0,
    sceneFunc: (context, shape) => {
      const {
        pieceSize: { width, height },
        tabLength,
      } = store.game;
      const { edges } = pieceConfig;

      context.beginPath();

      drawPath(context, width, height, tabLength, edges);

      context.closePath();
      context.strokeShape(shape);
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
  <v-shape :config="border" />
</template>
