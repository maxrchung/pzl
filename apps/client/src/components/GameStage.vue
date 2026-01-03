<script setup lang="ts">
import { ref, watch } from 'vue';
import { useStore } from '../store';
import { SCALE_MAX, SCALE_MIN, SCALE_TICK } from '../constants';
import { Stage, StageConfig } from 'konva/lib/Stage';
import { STAGE_LENGTH } from '@pzl/shared';
import { useWindowSize } from '../useWindowSize';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import { getCenter, getDistance } from '../vector';

const stageRef = ref<Stage | null>(null);
defineExpose({ stageRef });

// By default Konva prevent some events when node is dragging. It improve the
// performance and work well for 95% of cases. We need to enable all events on
// Konva, even when we are dragging a node so it triggers touchmove correctly.
// There's no typing for window.Konva so just ignoring it with any.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Konva.hitOnDragEnabled = true;

const calculateStageScale = () =>
  Math.min(window.innerWidth, window.innerHeight) / STAGE_LENGTH;

const calculateStagePosition = () => ({
  x: window.innerWidth / 2 - (STAGE_LENGTH / 2) * calculateStageScale(),
  y: window.innerHeight / 2 - (STAGE_LENGTH / 2) * calculateStageScale(),
});

const { windowWidth, windowHeight } = useWindowSize();

const initialStageConfig: StageConfig = {
  width: windowWidth.value,
  height: windowHeight.value,
  draggable: true,
  x: calculateStagePosition().x,
  y: calculateStagePosition().y,
  scale: {
    x: calculateStageScale(),
    y: calculateStageScale(),
  },
};

// When window size changes, update stage
watch([windowWidth, windowHeight], ([windowWidth, windowHeight]) => {
  const stage = stageRef.value;
  if (!stage) return;

  stage.width(windowWidth);
  stage.height(windowHeight);
});

// Ionno but seems to work https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html
const stageWheel = (event: KonvaEventObject<WheelEvent>) => {
  event.evt.preventDefault();

  const stage = event.target.getStage();
  if (!stage) return;

  const pointer = stage.getPointerPosition();
  if (!pointer) return;

  const deltaY = event.evt.deltaY;
  if (deltaY === 0) return;

  const stageScale = stage.scaleX();
  const scale =
    event.evt.deltaY > 0 ? stageScale / SCALE_TICK : stageScale * SCALE_TICK;
  if (scale < SCALE_MIN || scale > SCALE_MAX) return;

  // Stage position to pointer with old scaled coordinates
  const toPointer = {
    x: (pointer.x - stage.x()) / stageScale,
    y: (pointer.y - stage.y()) / stageScale,
  };

  // With the pointer as the center point, determine new position
  stage.position({
    x: pointer.x - toPointer.x * scale,
    y: pointer.y - toPointer.y * scale,
  });

  // Make sure this is at the end so old value doesn't mess things up
  stage.scale({ x: scale, y: scale });
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
  if (!stage) return;

  // Restore dragging if it was suspended by multi-touch
  if (touch1 && !touch2 && !stage.isDragging() && isDragSuspended) {
    stage.startDrag();
    isDragSuspended = false;
  }

  // If we're not pinching, we're done here
  if (!touch2) return;

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

  const stageScale = stage.scaleX();

  // Stage position to pointer with old scaled coordinates
  const toCenter = {
    x: (center.x - stage.position().x) / stageScale,
    y: (center.y - stage.position().y) / stageScale,
  };

  const scale = stageScale * (distance / lastDistance);
  stage.scale({ x: scale, y: scale });

  // calculate new position of the stage
  const dx = center.x - lastCenter.x;
  const dy = center.y - lastCenter.y;

  stage.position({
    x: center.x - toCenter.x * scale + dx,
    y: center.y - toCenter.y * scale + dy,
  });

  lastDistance = distance;
  lastCenter = center;
};

const stageTouchEnd = () => {
  lastDistance = 0;
  lastCenter = null;
};

const stageDragEnd = () => {
  isDragSuspended = false;
};

const store = useStore();

// When game updates, reset stage
watch(
  () => store.game,
  () => {
    const stage = stageRef.value;
    if (!stage) return;

    const scale = calculateStageScale();
    stage.scale({ x: scale, y: scale });

    const position = calculateStagePosition();
    stage.position(position);
  },
);
</script>

<template>
  <main>
    <v-stage
      :config="initialStageConfig"
      @wheel="stageWheel"
      @touchmove="stageTouchMove"
      @touchend="stageTouchEnd"
      @dragend="stageDragEnd"
      :ref="
        // Not sure but this should get the node back for us?
        (el: any) => {
          stageRef = el?.getNode();
        }
      "
    >
      <v-layer>
        <slot />
      </v-layer>
    </v-stage>
  </main>
</template>
