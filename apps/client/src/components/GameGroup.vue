<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from '../store';

interface Props {
  groupId: string;
}

const { groupId } = defineProps<Props>();

const store = useStore();
const group = computed(() => ({
  ...store.game.groupConfigs[groupId],
  draggable: true,
}));

const groupRef = ref();
defineExpose({ groupRef });
</script>

<template>
  <v-group ref="groupRef" :config="group">
    <slot />
  </v-group>
</template>
