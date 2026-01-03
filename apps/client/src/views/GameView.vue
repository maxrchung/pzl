<script setup lang="ts">
import { useRoute } from 'vue-router';
import GameStage from '../components/GameStage.vue';
import GameGroup from '../components/GameGroup.vue';
import GamePiece from '../components/GamePiece.vue';
import { useStore } from '../store';
import { computed, ref, watchEffect } from 'vue';
import { Group } from 'konva/lib/Group';
import { Image } from 'konva/lib/shapes/Image';
import { THROTTLE_DELAY_IN_MS } from '../constants';
import { hasSnap } from '../snap';
import { useImage } from 'vue-konva';
import { Stage } from 'konva/lib/Stage';

const route = useRoute();
const store = useStore();
const isConnected = computed(() => store.isConnected);

// Reload whenever path changes, e.g. new lobby
watchEffect(() => {
  store.emptyGame();
  store.joinLobby(route.params.id as string);
});

const stageRef = ref<Stage | null>(null);
const groupRefs: Record<string, Group | null> = {};
const pieceRefs: Record<string, Image | null> = {};

const groupConfigs = computed(() => store.game.groupConfigs);
const pieceConfigs = computed(() => store.game.pieceConfigs);

const imageUrl = computed(() => store.game.imageUrl);
const [image] = useImage(imageUrl);

let lastThrottle = 0;
const groupDragMove = (groupId: string, force: boolean = false) => {
  const now = Date.now();
  if (!force && now < lastThrottle + THROTTLE_DELAY_IN_MS) return;
  lastThrottle = now + THROTTLE_DELAY_IN_MS;

  const group = groupRefs[groupId];
  if (!group) return;

  store.moveGroup(groupId, group.position());
};

const groupDragEnd = (groupId: string) => {
  // Ensure end position is updated
  groupDragMove(groupId, true);

  const stage = stageRef.value;
  if (!stage) return;

  // Since we're comparing snap in actual rect sizes, we need to normalize tab
  // length so that it takes stage scale into account
  const tabLength = store.game.tabLength * stage.scaleX();

  // It's possible in weird data update situations for this to happen. For
  // example, two players take the same piece and one person snaps it. The
  // second person will be out of sync and potentially end up in a stuck piece
  // situation as iterating over undefined throws an exception.
  const pieces = pieceConfigs.value[groupId];
  if (!pieces) return;

  for (const piece of pieces) {
    if (!piece) continue;

    const curr = pieceRefs[piece.id];
    if (!curr) continue;

    const currRect = curr.getClientRect();
    const currX = piece.index.x;
    const currY = piece.index.y;

    for (const otherGroupId in pieceConfigs.value) {
      if (otherGroupId === groupId) continue;

      for (const piece of pieceConfigs.value[otherGroupId]) {
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

        if (
          hasSnap(currRect, currX, currY, otherRect, otherX, otherY, tabLength)
        ) {
          store.snapGroup(groupId, otherGroupId);
          return;
        }
      }
    }
  }
};
</script>

<template>
  <GameStage
    v-if="image && isConnected"
    :ref="
      (el: any) => {
        stageRef = el?.stageRef;
      }
    "
  >
    <GameGroup
      v-for="(pieces, groupId) in pieceConfigs"
      :key="groupId"
      :groupConfig="groupConfigs[groupId]"
      @dragmove="() => groupDragMove(groupId)"
      @dragend="() => groupDragEnd(groupId)"
      :ref="
        // Not sure but this should get the node back for us?
        (el: any) => {
          groupRefs[groupId] = el?.groupRef?.getNode();
        }
      "
    >
      <GamePiece
        v-for="piece in pieces"
        :key="piece.id"
        :image="image"
        :pieceConfig="piece"
        :game="store.game"
        :ref="
          (el: any) => {
            pieceRefs[piece.id] = el?.pieceRef?.getNode();
          }
        "
      />
    </GameGroup>
  </GameStage>
</template>
