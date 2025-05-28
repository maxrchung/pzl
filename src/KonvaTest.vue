<script setup lang="ts">
interface Props {
  title?: string
}

const { title } = defineProps<Props>()

import Konva from 'konva'
import type { KonvaNodeEvent } from 'konva/lib/types'
import { ref, onMounted } from 'vue'
import { useImage } from 'vue-konva'

const stageSize = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const list = ref<Konva.ShapeConfig[]>([])
const dragItemId = ref<string | null>(null)

const [image] = useImage('/sonic-disturb.jpg')

const handleDragStart = (e: Konva.KonvaEventObject<KonvaNodeEvent.dragstart>) => {
  // save drag element:
  dragItemId.value = e.target.id()
  // move current element to the top:
  const item = list.value.find((i) => i.id === dragItemId.value)

  if (!item) {
    return
  }

  const index = list.value.indexOf(item)
  list.value.splice(index, 1)
  list.value.push(item)
}

const handleDragEnd = () => {
  dragItemId.value = null
}

onMounted(() => {
  for (let n = 0; n < 30; n++) {
    list.value.push({
      id: Math.round(Math.random() * 10000).toString(),
      x: Math.random() * stageSize.width,
      y: Math.random() * stageSize.height,
      rotation: Math.random() * 180,
      scaleX: Math.random(),
      scaleY: Math.random(),
    })
  }
})
</script>

<template>
  <v-stage
    ref="stage"
    :config="stageSize"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    draggable="true"
  >
    <v-layer ref="layer">
      <v-image
        v-if="image"
        :config="{
          x: 50,
          y: 50,
          image,
          width: 106,
          height: 118,
        }"
      />

      <v-star
        v-for="item in list"
        :key="item.id"
        :config="{
          x: item.x,
          y: item.y,
          rotation: item.rotation,
          id: item.id,
          numPoints: 5,
          innerRadius: 30,
          outerRadius: 50,
          fill: '#89b717',
          opacity: 0.8,
          draggable: true,
          scaleX: dragItemId === item.id ? (item.scale ?? 1 * 1.2) : item.scale,
          scaleY: dragItemId === item.id ? (item.scale ?? 1 * 1.2) : item.scale,
          shadowColor: 'black',
          shadowBlur: 10,
          shadowOffsetX: dragItemId === item.id ? 15 : 5,
          shadowOffsetY: dragItemId === item.id ? 15 : 5,
          shadowOpacity: 0.6,
        }"
      />
    </v-layer>
  </v-stage>
</template>
