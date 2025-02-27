import { createPinia } from 'pinia';
import useUserStore from './modules/user';
import useFriendStore from './modules/friend';

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' //引入持久化插件

const pinia = createPinia();

pinia.use(piniaPluginPersistedstate) //将插件添加到 pinia 实例上

export { useUserStore,useFriendStore };
export default pinia;
