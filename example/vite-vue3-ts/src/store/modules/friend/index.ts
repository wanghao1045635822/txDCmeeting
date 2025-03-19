import { defineStore } from 'pinia';

const useFriendStore  = defineStore('useMeetingCenterStore', {
  persist: false,//关闭本地存储
  state: () => ({
    // 存储接口数据信息对象
    friendList: [
      // { userId: 'user_00001', userName: '盖伟',  avatarUrl: '' },
      // { userId: 'user_00002', userName: '高志伟',  avatarUrl: '' },
      // { userId: 'user_00003', userName: '韩申申',  avatarUrl: '' },
      // { userId: 'user_00004', userName: '李帅朋',  avatarUrl: '' },
      // { userId: 'user_00005', userName: '牛农恳',  avatarUrl: '' },
      // { userId: 'user_00006', userName: '贾文泽',  avatarUrl: '' },
      // { userId: 'user_00007', userName: '徐国雄',  avatarUrl: '' },
      // { userId: 'user_00008', userName: '赵磊',  avatarUrl: '' },
      // { userId: 'user_00009', userName: '钟广荣',  avatarUrl: '' },
      // { userId: 'user_00010', userName: '周同斌',  avatarUrl: '' },
      // // { userId: 'user_00011', userName: '沈智杰',  avatarUrl: '' },
      // { userId: 'user_00012', userName: '王浩',  avatarUrl: '' },
    ],//好友列表数据
    friendInfo: {},//好友详情信息
    isShowFriendInfo: false,//是否显示好友详情信息
  }),
  getters: {
    getFriendInfo(state) {
      return { ...state };
    },
  },
  actions: {
    // 更新好友列表数据
    updateFriendListInfo(data: any) {
      this.friendList = data;
    },
    // 更新好友详情信息
    updateFriendInfo(data: any) {
      this.friendInfo = data;
    },
    // 更新是否显示好友详情信息
    updateIsShowFriendInfo(data: any) {
      this.isShowFriendInfo = data;
    },
  },
});

export default useFriendStore ;
