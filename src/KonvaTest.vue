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

const stageSize = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const imageLength = 200

// We don't know what the width/height will be exactly until the image loads
let imageWidth = imageLength
let imageHeight = imageLength

const getInitialPosition = () => {
  const x = Math.random() * (stageSize.width - imageWidth)
  const y = Math.random() * (stageSize.height - imageHeight)

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

  const isWidthLarger = width >= height
  const ratio = width / height

  imageWidth = isWidthLarger ? imageLength : imageLength * ratio
  imageHeight = isWidthLarger ? imageLength / ratio : imageLength

  const piece0 = {
    id: '0',
    groupId: '0',
    image: image.value,
    crop: {
      height: height / 2,
      width: width / 2,
      x: 0,
      y: 0,
    },
    width: imageWidth,
    height: imageHeight,
    pieceX: 0,
    pieceY: 0,
  }
  pieces.value['0'] = [piece0]
  configs.value['0'] = getInitialPosition()

  const piece1 = {
    id: '1',
    groupId: '1',
    image: image.value,
    crop: {
      height: height / 2,
      width: width / 2,
      x: width / 2,
      y: 0,
    },
    width: imageWidth,
    height: imageHeight,
    pieceX: 1,
    pieceY: 0,
  }
  pieces.value['1'] = [piece1]
  configs.value['1'] = getInitialPosition()

  // const piece2 = {
  //   id: '2',
  //   groupId: '2',
  //   image: image.value,
  //   crop: {
  //     height: height / 2,
  //     width: width / 2,
  //     x: 0,
  //     y: height / 2,
  //   },
  //   width: pieceWidth,
  //   height: pieceHeight,
  //   pieceX: 0,
  //   pieceY: 1,
  // }
  // groupMap.value['2'] = [piece2]

  // const piece3 = {
  //   id: '3',
  //   groupId: '3',
  //   image: image.value,
  //   crop: {
  //     height: height / 2,
  //     width: width / 2,
  //     x: width / 2,
  //     y: height / 2,
  //   },
  //   width: pieceWidth,
  //   height: pieceHeight,
  //   pieceX: 1,
  //   pieceY: 1,
  // }
  // groupMap.value['3'] = [piece3]
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
        const isAdjacentX = Math.abs(currX - otherX) < 1
        const isAdjacentY = Math.abs(currY - otherY) < 1

        // Only do collision test if pieces are directly adjacent
        if (!isAdjacentX && !isAdjacentY) continue

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
              x: (piece.pieceX - base.pieceX) * imageWidth,
              y: (piece.pieceY - base.pieceY) * imageHeight,
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
  <v-stage ref="stage" :config="stageSize">
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
