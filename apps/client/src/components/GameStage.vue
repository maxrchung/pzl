<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useImage } from 'vue-konva';
import { useStore } from '../store';
import { Group } from 'konva/lib/Group';
import { Image } from 'konva/lib/shapes/Image';
import GamePiece from './GamePiece.vue';
import GameGroup from './GameGroup.vue';
import {
  SCALE_MAX,
  SCALE_MIN,
  SCALE_TICK,
  THROTTLE_DELAY_IN_MS,
} from '../constants';
import { hasSnap } from '../snap';
import { StageConfig } from 'konva/lib/Stage';
import { STAGE_LENGTH } from '@pzl/shared';
import { useWindowSize } from '../useWindowSize';
import { KonvaEventObject } from 'konva/lib/Node';

const stageScale = ref(
  Math.min(window.innerWidth, window.innerHeight) / STAGE_LENGTH,
);
const stagePosition = reactive({
  x: window.innerWidth / 2 - (STAGE_LENGTH / 2) * stageScale.value,
  y: window.innerHeight / 2 - (STAGE_LENGTH / 2) * stageScale.value,
});

const { windowWidth, windowHeight } = useWindowSize();
const stageConfig = computed(
  (): StageConfig => ({
    width: windowWidth.value,
    height: windowHeight.value,
    draggable: true,
    x: stagePosition.x,
    y: stagePosition.y,
    scale: {
      x: stageScale.value,
      y: stageScale.value,
    },
  }),
);

const store = useStore();
const isConnected = computed(() => store.isConnected);
const imageUrl = computed(() => store.game.imageUrl);
const [image] = useImage(imageUrl);
const data = computed(() => store.game.data);

const groupRefs: Record<string, Group | null> = {};
const pieceRefs: Record<string, Image | null> = {};

let lastThrottle = 0;
const handleDragMove = (groupId: string, force: boolean = false) => {
  const now = Date.now();
  if (!force && now < lastThrottle + THROTTLE_DELAY_IN_MS) {
    return;
  }

  const group = groupRefs[groupId];
  if (!group) {
    return;
  }

  lastThrottle = now + THROTTLE_DELAY_IN_MS;

  store.moveGroup(groupId, group.position());
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
          store.snapGroup(groupId, otherGroupId);

          return;
        }
      }
    }
  }
};

// Ionno but seems to work https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html
const handleWheel = (event: KonvaEventObject<WheelEvent>) => {
  const stage = event.target.getStage();
  if (!stage) {
    return;
  }

  const pointer = stage.getPointerPosition();
  if (!pointer) {
    return;
  }

  // Position to pointer with old scaled coordinates
  const positionToPointer = {
    x: (pointer.x - stage.x()) / stageScale.value,
    y: (pointer.y - stage.y()) / stageScale.value,
  };

  const newScale =
    event.evt.deltaY > 0
      ? stageScale.value / SCALE_TICK
      : stageScale.value * SCALE_TICK;

  if (newScale < SCALE_MIN || newScale > SCALE_MAX) {
    return;
  }

  stageScale.value = newScale;

  // With the pointer as the center point, determine new position
  stagePosition.x = pointer.x - positionToPointer.x * newScale;
  stagePosition.y = pointer.y - positionToPointer.y * newScale;
};
</script>

<template>
  <v-stage
    :config="stageConfig"
    v-if="image && isConnected"
    @wheel="handleWheel"
  >
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
