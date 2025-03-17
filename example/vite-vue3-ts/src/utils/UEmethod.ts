/**
 * create 2024-11-11 18:23:42 By wanghao
 * 全局方法封装
 * */
import {userInfo} from "../config/basic-info-config";
import {useUserStore, useFriendStore} from "../store/index";

import { setActivePinia, createPinia } from 'pinia';

// 确保有活跃的 Pinia 实例
setActivePinia(createPinia());

const userStore = useUserStore();
const friendStore = useFriendStore();

import MsgId from "../proto/msgid_pb.js";

import * as office_pb from "../proto/office_pb.js";
import EventBus from "./EventBus";

// 数据转化：Uint8Array 转换为 JavaScript 字符串（FsString）
export const toFsString = (data) => {
    // 将 Uint8Array 转换为 JavaScript 字符串
    return new TextDecoder().decode(data);

    // return String.fromCharCode.apply(null, data);
};

// js 将序列化的proto 转成16进制编码
function bufferToHex(buffer) {
    let hex = "";
    for (let i = 0; i < buffer.length; i++) {
        // 将每个字节转换为16进制，并确保每个字节的16进制表示为两位
        hex += buffer[i].toString(16).padStart(2, "0");
    }
    return hex;
}

// js 将16进制编码 转成序列化的proto
function hexToBuffer(hex) {
    if (hex.length % 2 !== 0) {
        throw new Error("Invalid hex string length");
    }

    const buffer = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        buffer[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return buffer;
}

// js调用UE
export const jsCallUE = (id, data) => {
    try {
        // alert("调用UE里的函数");
        // console.log('================请求ue的id====================:',id);
        console.log("%c ================请求ue的id====================:", "color: #FFA500;", id);
        ue.ueobj.webreqmsg(id.toString(), bufferToHex(data)).then(() => {
            // alert('调用了UE里的函数!');
        });
    } catch (e) {
        console.error("ReferenceError: ue is not defined");
        // console.log('%cReferenceError: ue is not defined', 'font-weight: bold; font-size: 12px; color: red');
    }
};

// 提供给UE的方法
window.uemsgack = function (id, data) {

    // console.log('=========================ue返回的参数id====================:',id);
    console.log("%c ================ue返回的参数id====================:", "color: #52d10a;", id);
    switch (id) {
        //   获得办公人员列表结果 2209
        case MsgId.S2C_GET_OFFICE_WORKER_LIST_ACK:
            const S2CGetOfficeWorkerListAckData = office_pb.default.S2CGetOfficeWorkerListAck.deserializeBinary(hexToBuffer(data));
            let dataWorker = S2CGetOfficeWorkerListAckData.toObject();
            console.log("%c 2209返回参数:", "color: #52d10a;", dataWorker);
            if(dataWorker.errcode === 0){
              let friendList = dataWorker.infosList.map(item => {
                return {
                  userId: 'user_'+item.roleId,
                  userName: item.realName,
                  avatarUrl: item.icon,
                  // roleId: item.roleid,
                  // roleName: item.rolename,
                  // roleType: item.roletype,
                  // roleLevel: item.rolelevel,
                  // roleLevelName: item.rolelevelname,
                  // roleLevelIcon: item.rolelevelicon,
                  // roleLevelIconUrl:item.roleleveliconurl,
                }
              });
              console.log("%c friendList:", "color: #52d10a;", friendList);
              friendStore.updateFriendListInfo(friendList);
              EventBus.emit('getOfficeWorkerListFun', friendList)
            }
            break;
    }
};




// 调用UE的webgetaccountinfo方法获取用户信息
export const webgetaccountinfo = () => {
    try {
        // alert("调用UE里的 webuploadfile 函数");
        ue.ueobj.webgetaccountinfo().then(() => {
            // alert('调用了UE里的函数!');
        });
    } catch (e) {
        console.error("ReferenceError: ue1 is not defined");
        // console.log('%cReferenceError: ue is not defined', 'font-weight: bold; font-size: 12px; color: red');
    }
};

// 获取用户信息
webgetaccountinfo();


// ue返回的角色信息
window.uesetroleInfo =async function (data) {
    console.log("%c ================ue返回的角色信息====================:", "color: #52d10a;", data);
    // userStore.updateRoleInfo(data);
    userInfo.userId = 'user_'+data.role_id;
    userInfo.userName = data.role_name;
    // userInfo.avatarUrl = data.userId;
    // 如果您需要自定义昵称或头像，可以使用如下接口进行更新：由于用户隐私限制，昵称和头像更新可能会有延迟。如您需要更高的实时性，可以使用会中修改昵称功能。
    // await TUIRoomEngine.setSelfInfo({ userName: 'jack', avatarUrl: 'http://xxx' });
};


// 预览功能
export const webpreviewroom = (levelname) => {
    console.log(levelname)
    try {
        ue.ueobj.webpreviewroom(levelname).then(() => {
            // alert('调用了UE里的函数!');
        });
    } catch (e) {
        console.error("ReferenceError: ue is not defined");
        // console.log('%cReferenceError: ue is not defined', 'font-weight: bold; font-size: 12px; color: red');
    }
};


// 调用UE的webattendmeeting进入会议方法
export const webattendmeeting = (meetingid) => {
    try {
        // alert("调用UE里的 webuploadfile 函数");
        ue.ueobj.webattendmeeting(meetingid).then(() => {
            // alert('调用了UE里的函数!');
        });
    } catch (e) {
        console.error("ReferenceError: ue is not defined");
        // console.log('%cReferenceError: ue is not defined', 'font-weight: bold; font-size: 12px; color: red');
    }
};




// 调用UE的webcloseui退出会议方法
export const webcloseui = () => {
    try {
        // alert("调用UE里的 webuploadfile 函数");
        ue.ueobj.webcloseui().then(() => {
            // alert('调用了UE里的函数!');
        });
    } catch (e) {
        console.error("ReferenceError: ue is not defined");
        // console.log('%cReferenceError: ue is not defined', 'font-weight: bold; font-size: 12px; color: red');
    }
};
