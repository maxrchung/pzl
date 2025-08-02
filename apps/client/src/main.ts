import { createApp } from 'vue';
import VueKonva from 'vue-konva';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

createApp(App).use(router).use(VueKonva).use(createPinia()).mount('#app');
