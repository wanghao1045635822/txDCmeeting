<template>
  <conference-main-view display-mode="permanent"></conference-main-view>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { ConferenceMainView, conference, RoomEvent, LanguageOption, ThemeOption } from '@tencentcloud/roomkit-web-vue3';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import router from '@/router';
import i18n, { useI18n } from '../locales/index';
import { getLanguage, getTheme } from  '../utils/utils';
import {useFriendStore} from "@/store";
const friendStore = useFriendStore();
const { t } = useI18n();
// console.log("%c friend列表:", "color: #52d10a;", friendStore.friendList);
// conference.setParticipants([
//   { userId: 'user_00001', userName: '盖伟',  avatarUrl: '' },
//   { userId: 'user_00002', userName: '高志伟',  avatarUrl: '' },
//   { userId: 'user_00003', userName: '韩申申',  avatarUrl: '' },
//   { userId: 'user_00004', userName: '李帅朋',  avatarUrl: '' },
//   { userId: 'user_00005', userName: '牛农恳',  avatarUrl: '' },
//   { userId: 'user_00006', userName: '贾文泽',  avatarUrl: '' },
//   { userId: 'user_00007', userName: '徐国雄',  avatarUrl: '' },
//   { userId: 'user_00008', userName: '赵磊',  avatarUrl: '' },
//   { userId: 'user_00009', userName: '钟广荣',  avatarUrl: '' },
//   { userId: 'user_00010', userName: '周同斌',  avatarUrl: '' },
//   { userId: 'user_00011', userName: '沈智杰',  avatarUrl: '' },
//   { userId: 'user_00012', userName: '王浩',  avatarUrl: '' },
// ]);
const route = useRoute();
const roomInfo = sessionStorage.getItem('tuiRoom-roomInfo');
const userInfo = sessionStorage.getItem('tuiRoom-userInfo');
const roomId = String(route.query.roomId);
conference.setLanguage(getLanguage() as LanguageOption);
conference.setTheme(getTheme() as ThemeOption);

let isMaster = false;
let isExpectedJump = false;

if (!roomId) {
  router.push({ path: 'home' });
} else if (!roomInfo) {
  router.push({ path: 'home', query: { roomId } });
}
onMounted(async () => {
  const { action, isSeatEnabled, roomParam, hasCreated } = JSON.parse(roomInfo as string);
  const { sdkAppId, userId, userSig, userName, avatarUrl } = JSON.parse(userInfo as string);
  if (action === 'createRoom') {
    isMaster = true;
  }
  try {
    await conference.login({ sdkAppId, userId, userSig });
    await conference.setSelfInfo({ userName, avatarUrl });
    if (action === 'createRoom' && !hasCreated) {
      await conference.start(roomId, {
        roomName: `${userName || userId}${t('Quick Conference')}`,
        isSeatEnabled,
        ...roomParam,
      });
      const newRoomInfo = { action, roomId, roomName: roomId, isSeatEnabled, roomParam, hasCreated: true };
      sessionStorage.setItem('tuiRoom-roomInfo', JSON.stringify(newRoomInfo));
    } else {
      await conference.join(roomId, roomParam);
    }
  } catch (error: any) {
    sessionStorage.removeItem('tuiRoom-currentUserInfo');
  }
});

onBeforeRouteLeave((to: any, from: any, next: any) => {
  if (!isExpectedJump) {
    const message = isMaster
      ? t('This action causes the room to be disbanded, does it continue?')
      : t('This action causes the room to be exited, does it continue?');
    if (window.confirm(message)) {
      if (isMaster) {
        conference?.dismiss();
      } else {
        conference?.leave();
      }
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

const backToPage = (page:string, shouldClearUserInfo: boolean) => {
  sessionStorage.removeItem('tuiRoom-roomInfo');
  shouldClearUserInfo && sessionStorage.removeItem('tuiRoom-currentUserInfo');
  goToPage(page);
};
const backToHome = () => backToPage('home', false);
const backToHomeAndClearUserInfo = () => backToPage('home', true);
const changeLanguage = (language: LanguageOption) => {
  i18n.global.locale.value = language;
  localStorage.setItem('tuiRoom-language', language);
};
const changeTheme = (theme: ThemeOption) => {
  localStorage.setItem('tuiRoom-currentTheme', theme);
};
conference.on(RoomEvent.ROOM_DISMISS, backToHome);
conference.on(RoomEvent.ROOM_LEAVE, backToHome);
conference.on(RoomEvent.KICKED_OUT, backToHome);
conference.on(RoomEvent.ROOM_ERROR, backToHome);
conference.on(RoomEvent.KICKED_OFFLINE, backToHome);
conference.on(RoomEvent.USER_SIG_EXPIRED, backToHomeAndClearUserInfo);
conference.on(RoomEvent.USER_LOGOUT, backToHomeAndClearUserInfo);
conference.on(RoomEvent.LANGUAGE_CHANGED, changeLanguage);
conference.on(RoomEvent.THEME_CHANGED, changeTheme);
// await trtc.startLocalVideo({ view: 'local-video' });
// await trtc.updateLocalVideo({ publish: true });
// 初始化设置语言
conference.setLanguage(getLanguage() as LanguageOption);
// 设置界面主题。
conference.setTheme('DARK');
onUnmounted(() => {
  conference.off(RoomEvent.ROOM_DISMISS, backToHome);
  conference.off(RoomEvent.ROOM_LEAVE, backToHome);
  conference.off(RoomEvent.KICKED_OUT, backToHome);
  conference.off(RoomEvent.ROOM_ERROR, backToHome);
  conference.off(RoomEvent.KICKED_OFFLINE, backToHome);
  conference.off(RoomEvent.USER_SIG_EXPIRED, backToHomeAndClearUserInfo);
  conference.off(RoomEvent.USER_LOGOUT, backToHomeAndClearUserInfo);
  conference.off(RoomEvent.LANGUAGE_CHANGED, changeLanguage);
  conference.off(RoomEvent.THEME_CHANGED, changeTheme);
});

const goToPage = (routePath: string) => {
  isExpectedJump = true;
  router.replace({ path: routePath });
};
</script>

<style lang="scss">
#app {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: 'PingFang SC';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
