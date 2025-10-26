<script setup lang="ts">
import { useStore } from '../store';

const store = useStore();
store.leaveLobby();

const handleClick = () => {
  store.createLobby();
};
</script>

<template>
  <div>
    <h2>Welcome to pzl!</h2>

    <p>
      This is a multiplayer online co-op custom jigsaw puzzle web game. Create a
      new lobby to get started:
    </p>

    <button @click="handleClick">Create new lobby</button>
  </div>
</template>
