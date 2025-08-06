<script setup lang="ts">
import type { IRect, Vector2d } from 'konva/lib/types';
import { computed, ComputedRef } from 'vue';
import { useImage } from 'vue-konva';
import { ConfigMap, PiecesMap } from '@pzl/shared';
import { useStore } from '../store';
import { Group } from 'konva/lib/Group';
import { Image } from 'konva/lib/shapes/Image';
import { throttle } from '../throttle';

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
      })),
    ]),
  );

  return piecesMap;
});

const groupRefs: Record<string, Group | null> = {};
const pieceRefs: Record<string, Image | null> = {};

const configs = computed(() => {
  const configMap: ConfigMap = Object.fromEntries(
    Object.entries(store.game.configs).map(([groupId, config]) => [
      groupId,
      {
        ...config,
        id: `g${groupId}`,
        draggable: true,
      },
    ]),
  );

  return configMap;
});

const pieceSize = computed(() => store.game.pieceSize);

const THROTTLE_DELAY_IN_MS = 100;

const handleDragMove = throttle((groupId: string) => {
  const group = groupRefs[groupId];
  if (!group) {
    return;
  }

  store.moveGroup(groupId, group.position());
}, THROTTLE_DELAY_IN_MS);

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

const handleDragEnd = (groupId: string) => {
  for (const piece of pieces.value[groupId]) {
    if (!piece) continue;

    const curr = pieceRefs[piece.id];
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

        const other = pieceRefs[piece.id];
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
        @dragmove="handleDragMove(groupId)"
        @dragend="() => handleDragEnd(groupId)"
        :ref="(el: any) => (groupRefs[groupId] = el?.getNode())"
      >
        <v-image
          v-for="piece in pieces"
          :key="piece.id"
          :config="piece"
          :ref="(el: any) => (groupRefs[piece.id] = el?.getNode())"
        />
      </v-group>
    </v-layer>
  </v-stage>
</template>
