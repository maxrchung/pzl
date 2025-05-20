<script setup lang="ts">
import { ref, watch } from 'vue'
import BlogPost from './BlogPost.vue'
import KonvaTest from './KonvaTest.vue'

const list = ref(['pee', 'poo', 'ew', 'cool'])
const showList = true
const count = ref(0)

const input = ref('')
const checks = ref([])

const click = () => {
  count.value++
}

const question = ref('')
const loading = ref(false)
const answer = ref('')

watch(question, async (newQuestion) => {
  if (!newQuestion.includes('?')) return

  loading.value = true
  answer.value = ''

  const res = await fetch('https://yesno.wtf/api')
  answer.value = (await res.json()).answer

  loading.value = false
})

const lol = 'lol'
const emitted = ref('')

const handleEmit = (title: string) => {
  emitted.value = title
}
</script>

<template>
  <ul v-if="showList">
    <li v-for="item of list" :key="item">
      {{ item }}
    </li>
  </ul>

  <button @click="click">{{ count }}</button>

  <p>Message: {{ input }}</p>
  <input v-model="input" placeholder="edit me" />

  <p>Checks: {{ checks }}</p>

  <input type="checkbox" id="jack" value="Jack" v-model="checks" />
  <label for="jack">Jack</label>

  <input type="checkbox" id="john" value="John" v-model="checks" />
  <label for="john">John</label>

  <input type="checkbox" id="mike" value="Mike" v-model="checks" />
  <label for="mike">Mike</label>

  <p>
    Ask a yes/no question:
    <input v-model="question" :disabled="loading" />
  </p>
  <p>{{ answer }}</p>

  <BlogPost :title="lol" @emit="handleEmit">Poo</BlogPost>
  <BlogPost title="Blog 2" @emit="handleEmit" />
  <BlogPost title="Blog 3" @emit="handleEmit" />

  <p>Emitted: {{ emitted }}</p>

  <KonvaTest />
</template>
