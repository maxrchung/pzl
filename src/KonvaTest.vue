<script setup lang="ts">
interface Piece extends Konva.ImageConfig {
  pieceX: number
  pieceY: number
  groupId: string
}

import Konva from 'konva'
import type { GroupConfig } from 'konva/lib/Group'
import type { IRect, KonvaNodeEvent } from 'konva/lib/types'
import { ref, watchEffect } from 'vue'
import { useImage } from 'vue-konva'

const stageConfig = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const sides = 4

// We don't know what the width/height will be exactly until the image loads
let pieceWidth = 100
let pieceHeight = 100

const getInitialPosition = () => {
  const x = Math.random() * (stageConfig.width - pieceWidth)
  const y = Math.random() * (stageConfig.height - pieceHeight)

  return { x, y }
}

const [image] = useImage('/sonic-disturb.jpg')

// Mapping from group to its pieces
const pieces = ref<{ [groupId: string]: Piece[] }>({})
const configs = ref<{ [groupId: string]: GroupConfig }>({})

watchEffect(() => {
  const width = image.value?.width
  const height = image.value?.height

  if (!image.value || !width || !height) {
    return
  }

  const imageWidth = width / sides
  const imageHeight = height / sides

  const pieceLength = Math.min(stageConfig.width, stageConfig.height) / sides

  const isWidthLarger = width >= height
  const ratio = width / height

  pieceWidth = isWidthLarger ? pieceLength : pieceLength * ratio
  pieceHeight = isWidthLarger ? pieceLength / ratio : pieceLength

  let id = 0

  for (let i = 0; i < sides; ++i) {
    for (let j = 0; j < sides; ++j) {
      const stringId = (id++).toString()

      const piece = {
        id: stringId,
        groupId: stringId,
        image: image.value,
        crop: {
          height: imageHeight,
          width: imageWidth,
          x: j * imageWidth,
          y: i * imageHeight,
        },
        width: pieceWidth,
        height: pieceHeight,
        pieceX: j,
        pieceY: i,
      }
      pieces.value[stringId] = [piece]
      configs.value[stringId] = getInitialPosition()
    }
  }
})

/** Simple box collision */
const hasIntersection = (a: IRect, b: IRect) => {
  if (!a.x || !a.y || !a.width || !a.height || !b.x || !b.y || !b.width || !b.height) {
    return
  }

  return !(
    b.x > a.x + a.width ||
    b.x + b.width < a.x ||
    b.y > a.y + a.height ||
    b.y + b.height < a.y
  )
}

const handleDragEnd = (
  e: Konva.KonvaEventObject<KonvaNodeEvent.dragend>,
  groupId: string | number,
) => {
  const target = e.target
  const layer = target.getLayer()

  if (!layer) {
    return
  }

  for (const piece of pieces.value[groupId]) {
    const rect = target.getClientRect()
    const currX = piece.pieceX
    const currY = piece.pieceY

    for (const otherGroupId in pieces.value) {
      if (otherGroupId === groupId) {
        continue
      }

      for (const piece of pieces.value[otherGroupId]) {
        const otherX = piece.pieceX
        const otherY = piece.pieceY
        const diffX = Math.abs(currX - otherX)
        const diffY = Math.abs(currY - otherY)

        // Only do collision test if pieces are directly adjacent
        if (diffX > 1 || diffY > 1 || (diffX === 1 && diffY === 1)) continue

        const other = layer?.findOne(`#${piece.id}`)

        if (!other) {
          continue
        }

        const otherRect = other?.getClientRect()

        if (hasIntersection(rect, otherRect)) {
          console.log('intersect')

          const base = pieces.value[otherGroupId][0]

          // Move all pieces to other group
          for (const piece of pieces.value[groupId]) {
            const copy = {
              ...piece,
              groupId: otherGroupId,
              x: (piece.pieceX - base.pieceX) * pieceWidth,
              y: (piece.pieceY - base.pieceY) * pieceHeight,
            }

            pieces.value[otherGroupId].push(copy)
          }

          delete pieces.value[groupId]

          return
        }
      }
    }
  }
}
</script>

<template>
  <v-stage ref="stage" :config="stageConfig">
    <v-layer ref="layer">
      <v-group
        v-for="(pieces, groupId) in pieces"
        :key="groupId"
        :draggable="true"
        :config="configs[groupId]"
        @dragend="(e: Konva.KonvaEventObject<KonvaNodeEvent.dragend>) => handleDragEnd(e, groupId)"
      >
        <v-image v-for="piece in pieces" :key="piece.id" :config="piece" />
      </v-group>
    </v-layer>
  </v-stage>
</template>
