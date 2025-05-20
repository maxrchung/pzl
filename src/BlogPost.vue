<script setup lang="ts">
interface Props {
  title: string
}

const { title } = defineProps<Props>()

interface Emits {
  emit: [title: string]
}

const emit = defineEmits<Emits>()
</script>

<template>
  <div>
    <h2>Title: {{ title }}</h2>
    <p><slot /></p>
    <button @click="emit('emit', title)">Emit</button>
  </div>
</template>
