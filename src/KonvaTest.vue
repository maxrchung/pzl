<script setup lang="ts">
interface Props {
  title?: string
}

interface Piece extends Konva.ImageConfig {
  pieceX: number
  pieceY: number
  groupId: string
}

const { title } = defineProps<Props>()

import Konva from 'konva'
import type { IRect, KonvaNodeEvent } from 'konva/lib/types'
import { ref, onMounted, watchEffect } from 'vue'
import { useImage } from 'vue-konva'

const stageSize = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const list = ref<Konva.ShapeConfig[]>([])
const dragItemId = ref<string | null>(null)

const [image] = useImage('/sonic-disturb.jpg')

// Mapping from group to its pieces
const groupMap = ref<{ [groupId: string]: Piece[] }>({})

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
    draggable: true,
    width: pieceWidth,
    height: pieceHeight,
    pieceX: 0,
    pieceY: 0,
  }
  groupMap.value['0'] = [piece0]

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
    draggable: true,
    width: pieceWidth,
    height: pieceHeight,
    pieceX: 1,
    pieceY: 0,
    x: 500,
  }
  groupMap.value['1'] = [piece1]

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
  //   draggable: true,
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
  //   draggable: true,
  //   width: pieceWidth,
  //   height: pieceHeight,
  //   pieceX: 1,
  //   pieceY: 1,
  // }
  // groupMap.value['3'] = [piece3]
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

const handleDragMove = (e: Konva.KonvaEventObject<KonvaNodeEvent.dragmove>, curr: Piece) => {
  console.log('asdf', groupMap.value)

  const target = e.target
  const layer = target.getLayer()

  if (!layer) {
    return
  }

  const currRect = target.getClientRect()
  const currX = curr.pieceX
  const currY = curr.pieceY
  const currPieceId = curr.id
  const currGroupId = curr.groupId

  for (const groupId in groupMap.value) {
    if (groupId === currGroupId) {
      continue
    }

    for (const piece of groupMap.value[groupId]) {
      if (piece.id === currPieceId) {
        continue
      }

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

      console.log(`Curr:  ${currX}, ${currY}`)
      console.log(currPieceId)
      console.log(piece.id)
      if (hasIntersection(currRect, otherRect)) {
        console.log(`Other: ${other?.getAttr('pieceX')}, ${other?.getAttr('pieceY')}`)
        console.log('intersect')

        delete groupMap.value[currGroupId]

        const copy = { ...curr, groupId }
        groupMap.value[groupId].push(copy)

        console.log('aaaaa', groupMap.value)

        return
      }
    }
  }
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
      <v-group v-for="(pieces, groupId) in groupMap" :key="groupId" draggable>
        <v-image
          v-for="piece in pieces"
          :key="piece.id"
          :config="piece"
          @dragend="
            (e: Konva.KonvaEventObject<KonvaNodeEvent.dragmove>) => handleDragMove(e, piece)
          "
        />
      </v-group>
    </v-layer>
  </v-stage>
</template>
