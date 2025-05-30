<script setup lang="ts">
interface Props {
  title?: string
}

const { title } = defineProps<Props>()

import Konva from 'konva'
import type { KonvaNodeEvent } from 'konva/lib/types'
import { ref, onMounted, computed, watch, watchEffect } from 'vue'
import { useImage } from 'vue-konva'

const stageSize = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const list = ref<Konva.ShapeConfig[]>([])
const dragItemId = ref<string | null>(null)

const [image] = useImage('/sonic-disturb.jpg')
const pieces = ref<Konva.ImageConfig[]>([])

watchEffect(() => {
  console.log(image)
  console.log(image.value?.width)

  const width = image.value?.width
  const height = image.value?.height

  if (!image.value || !width || !height) {
    return
  }

  const isWidthLarger = width >= height
  const ratio = width / height

  const imageWidth = 300
  const pieceWidth = isWidthLarger ? imageWidth : imageWidth * ratio
  const pieceHeight = isWidthLarger ? imageWidth / ratio : imageWidth

  pieces.value.push({
    id: '0',
    image: image.value,
    crop: {
      height: height / 2,
      width: width / 2,
      x: 0,
      y: 0,
    },
    draggable: true,
    width: pieceWidth,
    height: pieceHeight,
  })

  pieces.value.push({
    id: '1',
    image: image.value,
    crop: {
      height: height / 2,
      width: width / 2,
      x: width / 2,
      y: 0,
    },
    draggable: true,
    width: pieceWidth,
    height: pieceHeight,
  })

  pieces.value.push({
    id: '2',
    image: image.value,
    crop: {
      height: height / 2,
      width: width / 2,
      x: 0,
      y: height / 2,
    },
    draggable: true,
    width: pieceWidth,
    height: pieceHeight,
  })

  pieces.value.push({
    id: '3',
    image: image.value,
    crop: {
      height: height / 2,
      width: width / 2,
      x: width / 2,
      y: height / 2,
    },
    draggable: true,
    width: pieceWidth,
    height: pieceHeight,
  })
})

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
      <v-image v-for="piece in pieces" :key="piece.id" :config="piece" />

      <v-image
        v-if="image"
        :config="{
          x: 50,
          y: 50,
          image,
          width: 106,
          height: 118,
          draggable: true,
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
