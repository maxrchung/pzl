<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from '../store';

interface Props {
  groupId: string;
}

const { groupId } = defineProps<Props>();

const groupRef = ref();

const store = useStore();
const config = computed(() => ({
  ...store.game.configs[groupId],
  draggable: true,
}));

defineExpose({ groupRef });
</script>

<template>
  <v-group ref="groupRef" :key="groupId" :config="config">
    <slot />
  </v-group>
</template>
