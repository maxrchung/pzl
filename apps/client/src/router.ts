import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import SecretView from './views/SecretView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/secret', component: SecretView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
