import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import GameView from './views/GameView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/:id', component: GameView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const id = to.params.id;
  document.title = id ? `pzl 🧩 ${id}` : 'pzl';
  next();
});

export default router;
