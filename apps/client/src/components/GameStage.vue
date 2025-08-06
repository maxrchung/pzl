<script setup lang="ts">
import type { IRect, KonvaNodeEvent, Vector2d } from 'konva/lib/types';
import { computed, ComputedRef } from 'vue';
import { useImage } from 'vue-konva';
import { PiecesMap } from '@pzl/shared';
import { KonvaEventObject } from 'konva/lib/Node';
import { useStore } from '../store';

const stageConfig = {
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: true,
};

const [image] = useImage('/image.jpg');

const store = useStore();

const pieces: ComputedRef<PiecesMap> = computed(() => {
  if (!image) {
    return {};
  }

  const { data, cropSize, pieceSize } = store.game;

  const piecesMap: PiecesMap = Object.fromEntries(
    Object.entries(data).map(([groupId, pieces]) => [
      groupId,
      pieces.map((piece) => ({
        ...piece,
        image: image.value ?? undefined,
        crop: {
          height: cropSize.height,
          width: cropSize.width,
          x: piece.index.x * cropSize.width,
          y: piece.index.y * cropSize.height,
        },
        height: pieceSize.height,
        width: pieceSize.width,
        draggable: true,
      })),
    ]),
  );

  return piecesMap;
});

const pieceSize = computed(() => store.game.pieceSize);
const configs = computed(() => store.game.configs);

const distanceSquared = (a: Vector2d, b: Vector2d) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = dx * dx + dy * dy;
  return distance;
};

const snapBounds = 100;
const snap = (a: Vector2d, b: Vector2d) => {
  const hasSnap = distanceSquared(a, b) < snapBounds;
  return hasSnap;
};

const snapLeftRight = (a: IRect, b: IRect) => {
  const left: Vector2d = {
    x: a.x + a.width,
    y: a.y + a.height / 2,
  };

  const right: Vector2d = {
    x: b.x,
    y: b.y + a.height / 2,
  };

  return snap(left, right);
};

const snapTopBottom = (a: IRect, b: IRect) => {
  const top: Vector2d = {
    x: a.x + a.width / 2,
    y: a.y + a.height,
  };

  const bottom: Vector2d = {
    x: b.x + b.width / 2,
    y: b.y,
  };

  return snap(top, bottom);
};

const hasSnap = (
  a: IRect,
  aX: number,
  aY: number,
  b: IRect,
  bX: number,
  bY: number,
) => {
  if (aX < bX) {
    return snapLeftRight(a, b);
  } else if (aX > bX) {
    return snapLeftRight(b, a);
  } else if (aY < bY) {
    return snapTopBottom(a, b);
  } else if (aY > bY) {
    return snapTopBottom(b, a);
  }

  return false;
};

const handleDragEnd = (
  e: KonvaEventObject<KonvaNodeEvent.dragend>,
  groupId: string | number,
) => {
  const target = e.target;
  const layer = target.getLayer();
  if (!layer) return;

  for (const piece of pieces.value[groupId]) {
    if (!piece) continue;

    const curr = layer.findOne(`#${piece.id}`);
    if (!curr) continue;

    const currRect = curr.getClientRect();
    const currX = piece.index.x;
    const currY = piece.index.y;

    for (const otherGroupId in pieces.value) {
      if (otherGroupId === groupId) continue;

      for (const piece of pieces.value[otherGroupId]) {
        const otherX = piece.index.x;
        const otherY = piece.index.y;
        const diffX = Math.abs(currX - otherX);
        const diffY = Math.abs(currY - otherY);

        // Only do collision test if pieces are directly adjacent
        if (!(diffX === 1 && diffY === 0) && !(diffX === 0 && diffY === 1))
          continue;

        const other = layer.findOne(`#${piece.id}`);
        if (!other) continue;

        const otherRect = other.getClientRect();

        if (hasSnap(currRect, currX, currY, otherRect, otherX, otherY)) {
          const base = pieces.value[otherGroupId][0];

          // Move all pieces to other group
          for (const piece of pieces.value[groupId]) {
            const copy = {
              ...piece,
              groupId: otherGroupId,
              x: (piece.index.x - base.index.x) * pieceSize.value.width,
              y: (piece.index.y - base.index.y) * pieceSize.value.height,
            };

            pieces.value[otherGroupId].push(copy);
          }

          delete pieces.value[groupId];

          return;
        }
      }
    }
  }
};
</script>

<template>
  <v-stage ref="stage" :config="stageConfig">
    <v-layer ref="layer">
      <v-group
        v-for="(pieces, groupId) in pieces"
        :key="groupId"
        :config="configs[groupId]"
        @dragend="
          (e: KonvaEventObject<KonvaNodeEvent.dragend>) =>
            handleDragEnd(e, groupId)
        "
      >
        <v-image v-for="piece in pieces" :key="piece.id" :config="piece" />
      </v-group>
    </v-layer>
  </v-stage>
</template>
