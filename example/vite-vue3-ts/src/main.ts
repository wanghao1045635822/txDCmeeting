import { createApp } from 'vue';
import App from '@/App.vue';
import router from './router/index';
import store from './store';
import i18n from './locales';
// import VConsole from 'vconsole';
import eruda from 'eruda';
eruda.init();
const app = createApp(App);
app.use(router);
app.use(store);
app.use(i18n);
// app.use(createPinia());
// 初始化 VConsole
// const vconsole = new VConsole();
// app.use(vconsole);
app.mount('#app');
import './utils/UEmethod'
