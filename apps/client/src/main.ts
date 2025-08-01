import { createApp } from 'vue';
import App from './App.vue';
import VueKonva from 'vue-konva';
import { createPinia } from 'pinia';

createApp(App).use(VueKonva).use(createPinia()).mount('#app');
