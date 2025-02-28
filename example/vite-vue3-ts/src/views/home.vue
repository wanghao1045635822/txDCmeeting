<template>
  <pre-conference-view
    :user-info="userInfo"
    :room-id="givenRoomId"
    :enable-scheduled-conference="true"
    @on-create-room="handleCreateRoom"
    @on-enter-room="handleEnterRoom"
    @on-logout="handleLogOut"
    @on-update-user-name="handleUpdateUserName"
  ></pre-conference-view>
</template>

<script setup lang="ts">
import { PreConferenceView, conference, RoomEvent, LanguageOption, ThemeOption ,FeatureButton} from '@tencentcloud/roomkit-web-vue3';
import { getBasicInfo } from '@/config/basic-info-config';
import router from '@/router';
import { useRoute } from 'vue-router';
import { Ref, ref, reactive, onMounted, onUnmounted } from 'vue';
import i18n from '../locales/index';
import { getLanguage, getTheme } from  '../utils/utils';
import {webcloseui} from "@/utils/UEmethod";

const route = useRoute();
const { roomId } = route.query;
const givenRoomId: Ref<string> = ref((roomId) as string);

const userInfo = reactive({
  userId: '',
  userName: '',
  avatarUrl: '',
});


function setTUIRoomData(action: string, roomOption: Record<string, any>) {
  sessionStorage.setItem('tuiRoom-roomInfo', JSON.stringify({
    action,
    ...roomOption,
  }));
}

async function checkRoomExistWhenCreateRoom(roomId: string) {
  let isRoomExist = false;
  const tim = conference.getRoomEngine()?.getTIM();
  try {
    await tim?.searchGroupByID(roomId);
    isRoomExist = true;
  } catch (error: any) {
    // room does not exist
  }
  return isRoomExist;
}

/**
 * Generate room number when creating a room
**/
async function generateRoomId(): Promise<string> {
  const roomId = String(Math.ceil(Math.random() * 1000000));
  const isRoomExist = await checkRoomExistWhenCreateRoom(String(roomId));
  if (isRoomExist) {
    return await generateRoomId();
  }
  return roomId;
}

/**
 * Processing Click [Create Room]
**/
async function handleCreateRoom(roomOption: Record<string, any>) {
  setTUIRoomData('createRoom', roomOption);
  const roomId = await generateRoomId();
  router.push({
    path: 'room',
    query: {
      roomId,
    },
  });
}

/**
 * Processing Click [Enter Room]
**/
async function handleEnterRoom(roomOption: Record<string, any>) {
  setTUIRoomData('enterRoom', roomOption);
  router.push({
    path: 'room',
    query: {
      roomId: roomOption.roomId,
    },
  });
}

function handleUpdateUserName(userName: string) {
  try {
    const currentUserInfo = JSON.parse(sessionStorage.getItem('tuiRoom-userInfo') as string);
    currentUserInfo.userName = userName;
    sessionStorage.setItem('tuiRoom-userInfo', JSON.stringify(currentUserInfo));
  } catch (error) {
    console.log('sessionStorage error', error);
  }
}

/**
 * Processing users click [Logout Login] in the upper left corner of the page
**/
async function handleLogOut() {
/**
 * The accessor handles the logout method
**/
  webcloseui();
}

async function handleInit() {
  sessionStorage.removeItem('tuiRoom-roomInfo');
  sessionStorage.removeItem('tuiRoom-userInfo');
  conference.setLanguage(getLanguage() as LanguageOption);
  conference.setTheme(getTheme() as ThemeOption);
  const currentUserInfo = getBasicInfo();
  if (!currentUserInfo) {
    return;
  }
  sessionStorage.setItem('tuiRoom-userInfo', JSON.stringify(currentUserInfo));
  userInfo.userId = currentUserInfo.userId;
  userInfo.userName = currentUserInfo.userName;
  userInfo.avatarUrl = currentUserInfo.avatarUrl;
  const { userId, sdkAppId, userSig, userName, avatarUrl } = currentUserInfo;
  await conference.login({ sdkAppId, userId, userSig });
  await conference.setSelfInfo({ userName, avatarUrl });
}

const changeLanguage = (language: LanguageOption) => {
  i18n.global.locale.value = language;
  localStorage.setItem('tuiRoom-language', language);
};
const changeTheme = (theme: ThemeOption) => {
  localStorage.setItem('tuiRoom-currentTheme', theme);
};
//   hideFeatureButton
//   隐藏应用程序中的特定功能按钮。调用此函数并传入适当的 FeatureButton 枚举值后，相应的按钮将从用户界面中隐藏。
conference.hideFeatureButton(FeatureButton.SwitchTheme);//换肤
conference.hideFeatureButton(FeatureButton.SwitchLanguage);//语言
// 初始化设置语言
conference.setLanguage('zh-CN');
// 设置界面主题。
conference.setTheme('DARK');
conference.setParticipants([
  { userId: 'user_00001', userName: '盖伟',  avatarUrl: '' },
  { userId: 'user_00002', userName: '高志伟',  avatarUrl: '' },
  { userId: 'user_00003', userName: '韩申申',  avatarUrl: '' },
  { userId: 'user_00004', userName: '李帅朋',  avatarUrl: '' },
  { userId: 'user_00005', userName: '牛农恳',  avatarUrl: '' },
  { userId: 'user_00006', userName: '贾文泽',  avatarUrl: '' },
  { userId: 'user_00007', userName: '徐国雄',  avatarUrl: '' },
  { userId: 'user_00008', userName: '赵磊',  avatarUrl: '' },
  { userId: 'user_00009', userName: '钟广荣',  avatarUrl: '' },
  { userId: 'user_00010', userName: '周同斌',  avatarUrl: '' },
  { userId: 'user_00011', userName: '沈智杰',  avatarUrl: '' },
  { userId: 'user_00012', userName: '王浩',  avatarUrl: '' },
]);
onMounted(() => {
  conference.on(RoomEvent.LANGUAGE_CHANGED, changeLanguage);
  conference.on(RoomEvent.THEME_CHANGED, changeTheme);

});

onUnmounted(() => {
  conference.off(RoomEvent.LANGUAGE_CHANGED, changeLanguage);
  conference.off(RoomEvent.THEME_CHANGED, changeTheme);
});

handleInit();

</script>

<style lang="scss" scoped>
  :deep(.logo-container .svg-icon){
    display: none;
  }
</style>
