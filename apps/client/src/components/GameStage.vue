<script setup lang="ts">
import type { IRect, Vector2d } from 'konva/lib/types';
import { computed } from 'vue';
import { useImage } from 'vue-konva';
import { useStore } from '../store';
import { Group } from 'konva/lib/Group';
import { Image } from 'konva/lib/shapes/Image';
import GamePiece from './GamePiece.vue';
import GameGroup from './GameGroup.vue';

const stageConfig = {
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: true,
};

const [image] = useImage('/image.jpg');

const store = useStore();
const data = computed(() => store.game.data);
const pieceSize = computed(() => store.game.pieceSize);

const groupRefs: Record<string, Group | null> = {};
const pieceRefs: Record<string, Image | null> = {};

const THROTTLE_DELAY_IN_MS = 100;
const lastThrottle = 0;

const handleDragMove = (groupId: string, force: boolean = false) => {
  const now = Date.now();
  if (!force && now < lastThrottle + THROTTLE_DELAY_IN_MS) {
    return;
  }

  const group = groupRefs[groupId];
  if (!group) {
    return;
  }

  store.moveGroup(groupId, group.position());
};

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
  // Ensure end position is updated
  handleDragMove(groupId, true);

  for (const piece of data.value[groupId]) {
    if (!piece) continue;

    const curr = pieceRefs[piece.id];
    if (!curr) continue;

    const currRect = curr.getClientRect();
    const currX = piece.index.x;
    const currY = piece.index.y;

    for (const otherGroupId in data.value) {
      if (otherGroupId === groupId) continue;

      for (const piece of data.value[otherGroupId]) {
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
          const base = data.value[otherGroupId][0];

          // Move all pieces to other group
          for (const piece of data.value[groupId]) {
            const copy = {
              ...piece,
              groupId: otherGroupId,
              x: (piece.index.x - base.index.x) * pieceSize.value.width,
              y: (piece.index.y - base.index.y) * pieceSize.value.height,
            };

            data.value[otherGroupId].push(copy);
          }

          delete data.value[groupId];

          return;
        }
      }
    }
  }
};
</script>

<template>
  <v-stage ref="stage" :config="stageConfig" v-if="image">
    <v-layer ref="layer">
      <GameGroup
        v-for="(datas, groupId) in data"
        :key="groupId"
        :groupId="groupId"
        @dragmove="() => handleDragMove(groupId)"
        @dragend="() => handleDragEnd(groupId)"
        :ref="
          // Not sure but this should get the node back for us?
          (el: any) => {
            groupRefs[groupId] = el?.groupRef?.getNode();
          }
        "
      >
        <GamePiece
          v-for="data in datas"
          :key="data.id"
          :image="image"
          :data="data"
          :ref="
            (el: any) => {
              pieceRefs[data.id] = el?.imageRef?.getNode();
            }
          "
        />
      </GameGroup>
    </v-layer>
  </v-stage>
</template>
