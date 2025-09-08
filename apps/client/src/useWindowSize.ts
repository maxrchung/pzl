import { ref, onMounted, onUnmounted } from 'vue';

export function useWindowSize() {
  const windowWidth = ref(window.innerWidth);
  const windowHeight = ref(window.innerHeight);

  const resize = () => {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
  };

  onMounted(() => window.addEventListener('resize', resize));
  onUnmounted(() => window.removeEventListener('resize', resize));

  return { windowWidth, windowHeight };
}
