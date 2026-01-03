<script setup lang="ts">
import { computed, ref } from 'vue';
import { GroupConfig } from 'konva/lib/Group';

interface Props {
  groupConfig: GroupConfig;
}

const { groupConfig } = defineProps<Props>();

const group = computed(() => ({
  ...groupConfig,
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
