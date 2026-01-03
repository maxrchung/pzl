<script setup lang="ts">
import {
  Edge,
  Game,
  HOME_IMAGE_SIZE,
  HOME_IMAGE_URL,
  PieceConfig,
} from '@pzl/shared';
import PzlIcon from '../components/PzlIcon.vue';
import { useStore } from '../store';
import { useImage } from 'vue-konva';
import GameStage from '../components/GameStage.vue';
import GameGroup from '../components/GameGroup.vue';
import GamePiece from '../components/GamePiece.vue';
import { GroupConfig } from 'konva/lib/Group';
import { ref } from 'vue';
import { Image } from 'konva/lib/shapes/Image';
import { hasSnap } from '../snap';
import { Stage } from 'konva/lib/Stage';

const store = useStore();
store.leaveLobby();

const [image] = useImage(HOME_IMAGE_URL);

const stageRef = ref<Stage | null>(null);
const leftRef = ref<Image | null>(null);
const rightRef = ref<Image | null>(null);

const game: Game = {
  resetTime: Date.now(),
  imageKey: '',
  imageUrl: HOME_IMAGE_URL,
  imageSize: HOME_IMAGE_SIZE,
  sides: { columns: 2, rows: 1 },
  cropSize: { height: 100, width: 100 },
  pieceSize: { height: 200, width: 200 },
  pieceConfigs: {},
  groupConfigs: {},
  edge: Edge.JigsawTab,
  tabLength: 200 / 4,
};

const leftGroup: GroupConfig = {
  x: Math.random() * 600 + 200,
  y: Math.random() * 600 + 200,
  draggable: true,
};

const leftPiece: PieceConfig = {
  id: 'left',
  groupId: 'left',
  index: { x: 0, y: 0 },
  edges: {
    top: Edge.None,
    right: Edge.JigsawBlank,
    bottom: Edge.None,
    left: Edge.None,
  },
};

const rightGroup: GroupConfig = {
  x: Math.random() * 600 + 200,
  y: Math.random() * 600 + 200,
  draggable: true,
};

const rightPiece: PieceConfig = {
  id: 'right',
  groupId: 'right',
  index: { x: 1, y: 0 },
  edges: {
    top: Edge.None,
    right: Edge.None,
    bottom: Edge.None,
    left: Edge.JigsawTab,
  },
};

const groupDragEnd = () => {
  if (!leftRef.value || !rightRef.value || !stageRef.value) return;

  const tabLength = game.tabLength * stageRef.value.scaleX();
  const leftRect = leftRef.value.getClientRect();
  const rightRect = rightRef.value.getClientRect();

  if (hasSnap(leftRect, 0, 0, rightRect, 1, 0, tabLength)) {
    store.createLobby();
  }
};
</script>

<template>
  <GameStage
    v-if="image"
    :ref="
      (el: any) => {
        stageRef = el?.stageRef;
      }
    "
  >
    <GameGroup :groupConfig="leftGroup" @dragend="groupDragEnd">
      <GamePiece
        :image="image"
        :pieceConfig="leftPiece"
        :game="game"
        :ref="
          (el: any) => {
            leftRef = el?.pieceRef?.getNode();
          }
        "
      />
    </GameGroup>

    <GameGroup :groupConfig="rightGroup" @dragend="groupDragEnd">
      <GamePiece
        :image="image"
        :pieceConfig="rightPiece"
        :game="game"
        :ref="
          (el: any) => {
            rightRef = el?.pieceRef?.getNode();
          }
        "
      />
    </GameGroup>
  </GameStage>

  <div
    class="pointer-events-none fixed top-1/2 left-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2 bg-transparent transition select-none"
  >
    <div class="flex items-center gap-1">
      <PzlIcon class="size-6 rotate-180" />

      <!-- Translate a bit to center better -->
      <h1 class="-translate-y-0.5 text-2xl">pzl</h1>
    </div>

    <p class="px-3 text-center">
      Multiplayer online real-time co-op no-talking custom jigsaw puzzle web
      game
    </p>
  </div>
</template>
