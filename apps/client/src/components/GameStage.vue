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
import { Vector2d } from 'konva/lib/types';
import { getCenter, getDistance } from '../vector';

// By default Konva prevent some events when node is dragging. It improve the
// performance and work well for 95% of cases. We need to enable all events on
// Konva, even when we are dragging a node so it triggers touchmove correctly.
// There's no typing for window.Konva so just ignoring it with any.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Konva.hitOnDragEnabled = true;

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

// Ionno but seems to work https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html
const stageWheel = (event: KonvaEventObject<WheelEvent>) => {
  event.evt.preventDefault();

  const stage = event.target.getStage();
  if (!stage) {
    return;
  }

  const pointer = stage.getPointerPosition();
  if (!pointer) {
    return;
  }

  const deltaY = event.evt.deltaY;
  if (deltaY === 0) {
    return;
  }

  const scale =
    event.evt.deltaY > 0
      ? stageScale.value / SCALE_TICK
      : stageScale.value * SCALE_TICK;

  if (scale < SCALE_MIN || scale > SCALE_MAX) {
    return;
  }

  // Stage position to pointer with old scaled coordinates
  const toPointer = {
    x: (pointer.x - stage.x()) / stageScale.value,
    y: (pointer.y - stage.y()) / stageScale.value,
  };

  // With the pointer as the center point, determine new position
  stagePosition.x = pointer.x - toPointer.x * scale;
  stagePosition.y = pointer.y - toPointer.y * scale;

  // Make sure this is at the end so old value doesn't mess things up
  stageScale.value = scale;
};

// Helper variables for touch detection
let lastCenter: Vector2d | null = null;
let lastDistance = 0;

/**
 * This variable keeps track of stage specific dragging. Without this, you
 * cannot drag a puzzle piece as the touch would fall through and get trapped in
 * the stage touch handler.
 */
let isDragSuspended = false;

// Pinch zoom yolo I think https://konvajs.org/docs/sandbox/Multi-touch_Scale_Stage.html
const stageTouchMove = (event: KonvaEventObject<TouchEvent>) => {
  event.evt.preventDefault();

  const touch1 = event.evt.touches[0];
  const touch2 = event.evt.touches[1];
  const stage = event.target.getStage();

  if (!stage) {
    return;
  }

  // Restore dragging if it was suspended by multi-touch
  if (touch1 && !touch2 && !stage.isDragging() && isDragSuspended) {
    stage.startDrag();
    isDragSuspended = false;
  }

  // If we're not pinching, we're done here
  if (!touch2) {
    return;
  }

  if (stage.isDragging()) {
    stage.stopDrag();
    isDragSuspended = true;
  }

  const v1 = { x: touch1.clientX, y: touch1.clientY };
  const v2 = { x: touch2.clientX, y: touch2.clientY };
  const center = getCenter(v1, v2);
  if (!lastCenter) lastCenter = center;
  const distance = getDistance(v1, v2);
  if (!lastDistance) lastDistance = distance;

  // Stage position to pointer with old scaled coordinates
  const toCenter = {
    x: (center.x - stagePosition.x) / stageScale.value,
    y: (center.y - stagePosition.y) / stageScale.value,
  };

  const scale = stageScale.value * (distance / lastDistance);
  stageScale.value = scale;

  // calculate new position of the stage
  const dx = center.x - lastCenter.x;
  const dy = center.y - lastCenter.y;

  stagePosition.x = center.x - toCenter.x * scale + dx;
  stagePosition.y = center.y - toCenter.y * scale + dy;

  lastDistance = distance;
  lastCenter = center;
};

const stageTouchEnd = () => {
  lastDistance = 0;
  lastCenter = null;
};

const stageDragEnd = (event: KonvaEventObject<DragEvent>) => {
  isDragSuspended = false;

  const stage = event.target.getStage();
  if (!stage) {
    return;
  }

  // Ensure stage position is synchronized
  stagePosition.x = stage.x();
  stagePosition.y = stage.y();
};

const store = useStore();
const isConnected = computed(() => store.isConnected);
const imageUrl = computed(() => store.game.imageUrl);
const [image] = useImage(imageUrl);
const data = computed(() => store.game.data);

const groupRefs: Record<string, Group | null> = {};
const pieceRefs: Record<string, Image | null> = {};

let lastThrottle = 0;
const groupDragMove = (groupId: string, force: boolean = false) => {
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

const groupDragEnd = (groupId: string) => {
  // Ensure end position is updated
  groupDragMove(groupId, true);

  // It's possible for weird data update situations for this to happen. For
  // example, two players take the same piece and one person snaps it. The
  // second person will be out of sync and potentially end up in a stuck piece
  // situation as iterating over undefined throws an exception.
  if (!data.value[groupId]) {
    return;
  }

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
</script>

<template>
  <v-stage
    :config="stageConfig"
    v-if="image && isConnected"
    @wheel="stageWheel"
    @touchmove="stageTouchMove"
    @touchend="stageTouchEnd"
    @dragend="stageDragEnd"
  >
    <v-layer ref="layer">
      <GameGroup
        v-for="(datas, groupId) in data"
        :key="groupId"
        :groupId="groupId"
        @dragmove="() => groupDragMove(groupId)"
        @dragend="() => groupDragEnd(groupId)"
        :ref="
          // Not sure but this should get the node back for us?
          (el: any) => (groupRefs[groupId] = el?.groupRef?.getNode())
        "
      >
        <GamePiece
          v-for="data in datas"
          :key="data.id"
          :image="image"
          :data="data"
          :ref="(el: any) => (pieceRefs[data.id] = el?.imageRef?.getNode())"
        />
      </GameGroup>
    </v-layer>
  </v-stage>
</template>
