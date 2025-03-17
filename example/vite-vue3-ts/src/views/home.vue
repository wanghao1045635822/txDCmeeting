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
import { Ref, ref, reactive,onBeforeMount, onMounted, onUnmounted,watch } from 'vue';
import i18n from '../locales/index';
import { getLanguage, getTheme } from  '../utils/utils';
import * as Proto from "../proto/office_pb.js";
import { jsCallUE, toFsString,webcloseui } from "@/utils/UEmethod";
import MsgId from "@/proto/msgid_pb.js";
import { useFriendStore } from "@/store"
import EventBus from "@/utils/EventBus";
const route = useRoute();
const { roomId } = route.query;
const givenRoomId: Ref<string> = ref((roomId) as string);

const userInfo = reactive({
  userId: '',
  userName: '',
  avatarUrl: '',
});

const friendStore = useFriendStore();

let personnelList: any = ref([]);

// 监听人员列表变化
watch(
  () => friendStore.friendList,
  (newVal, oldVal) => {
    console.log("friendList changed:", newVal);
    personnelList.value = newVal;
    console.log("%c friendList:=======================", "color: #52d10a;", friendStore.friendList);
    // 获取好友列表，并将结果存储在会话存储中。
    conference.setParticipants(personnelList.value);
  },
  {
    deep: true, // 开启深度监听
    immediate: true
  }
);

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
conference.setLanguage(getLanguage() as LanguageOption);
// 设置界面主题。
conference.setTheme('DARK');


// // 获取好友列表，并将结果存储在会话存储中。
// console.log(friendStore.friendList,'好友列表')
// conference.setParticipants(friendStore.friendList);


// 请求获得办公人员列表
const getOfficeWorkerList = (data) => {
  console.log(MsgId.C2S_GET_OFFICE_WORKER_LIST_REQ,'获得办公人员列表Id');
  // 请求获得办公人员
  let InfoReq = new Proto.default.C2SGetOfficeWorkerListReq();
  InfoReq.setSceneid(3001);
  InfoReq.setScenekey(0);
  // 序列化
  const bytes = InfoReq.serializeBinary();

  console.log("请求获得办公人员列表 data:", bytes);

  // 反序列化
  const userDeserialized = Proto.default.C2SGetOfficeWorkerListReq.deserializeBinary(bytes);
  console.log("Deserialized data:", userDeserialized.toObject());
  console.log(JSON.stringify(userDeserialized.toObject()));

  jsCallUE(MsgId.C2S_GET_OFFICE_WORKER_LIST_REQ,bytes);
};

function init() {
  // 获得办公人员列表
  getOfficeWorkerList();
}

onBeforeMount(() => {
  init();
});

onMounted(() => {
  conference.on(RoomEvent.LANGUAGE_CHANGED, changeLanguage);
  conference.on(RoomEvent.THEME_CHANGED, changeTheme);
  // 初始化设置语言
  conference.setLanguage('zh-CN');

  EventBus.on("getOfficeWorkerListFun", (data) => {
    // getMeetingRoomList();
    console.log(data, "传来的会议时间");

  });



});

onUnmounted(() => {
  conference.off(RoomEvent.LANGUAGE_CHANGED, changeLanguage);
  conference.off(RoomEvent.THEME_CHANGED, changeTheme);
  EventBus.off("getOfficeWorkerListFun");
});

handleInit();

</script>

<style lang="scss" scoped>
  :deep(.logo-container .svg-icon){
    display: none;
  }
</style>
