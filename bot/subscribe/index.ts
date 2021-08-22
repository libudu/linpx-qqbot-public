import { diuQQNumber } from "../../botconfig";
import { BotData } from "../../model";
import { IBotGroup } from "../../model/types";
import { filterEmpty } from "../../util";
import { client } from "../client";
import { requestFavUsers } from "../linpx/request";
import './schedule';

// 退群自动清除所有订阅记录
client.on('notice.group.decrease', ({ group_id, user_id }) => {
  if(user_id === diuQQNumber) {
    BotData.botGroup.deleteById(String(group_id));
  }
});

// 获取群聊对象信息
const getGroupData = async (id: string): Promise<IBotGroup> => {
  return await BotData.botGroup.findById(id) || { id, recentNovels: {}, todayNovels: {}, followUsers: {} };
};

const FieldMap = {
  recentNovels: '最近小说',
  todayNovels: '每日小说',
};
type FieldKey = keyof typeof FieldMap;

// 基础函数：生成某个字段的订阅记录
const getSubRecords = (data: IBotGroup, fieldName: FieldKey) => {
  const field = data[fieldName];
  const objectName = FieldMap[fieldName];
  if(!field || Object.keys(field).length === 0) return `当前已无${objectName}订阅记录`;
  return filterEmpty(`
    全部订阅记录：${Object.keys(field).map(time => `${time}点`).join(' ')}
  `);
};

// 基础函数：新增订阅项的小时
export const newGroupSubscribeHour = async (
  groupId: string,
  time: number,
  field: FieldKey,
) => {
  const fieldName = FieldMap[field];
  const group: IBotGroup = await getGroupData(groupId);
  if(!group[field]) {
    group[field] = {};
  }
  const groupField = group[field] as { [time: number]: true };
  // 已有记录
  if(groupField[time]) {
    return filterEmpty(`
      【订阅${fieldName}】${time}点的订阅记录已存在
      ${getSubRecords(group, field)}
      回复【小小丢 取消订阅${fieldName} + 0~23】取消指定时间点的订阅
    `);
  }
  // 没有记录
  groupField[time] = true;
  BotData.botGroup.insert(group);
  return filterEmpty(`
    【订阅${fieldName}】已新建${time}点的${fieldName}推送
    ${getSubRecords(group, field)}
    回复【小小丢 取消订阅${fieldName} + 0~23】取消指定时间点的订阅
  `);
};

// 订阅最近小说
export const subRecentNovels = async (groupId: string, time: number) => {
  return newGroupSubscribeHour(groupId, time, 'recentNovels');
};

// 订阅今日小说
export const subTodayNovels = async (groupId: string, time: number) => {
  return newGroupSubscribeHour(groupId, time, 'todayNovels');
};

// 基础函数：取消订阅
export const removeGroupSubscribeHour = async (
  groupId: string,
  time: number,
  field: FieldKey,
) => {
  const group = await BotData.botGroup.findById(groupId);
  const fieldName = FieldMap[field];
  if(group?.[field]?.[time]) {
    delete group?.[field]?.[time];
    BotData.botGroup.insert(group);
    return filterEmpty(`
      【取消订阅${fieldName}】已取消${time}点的订阅
      ${getSubRecords(group, field)}
    `);
  }
  return `【取消订阅${fieldName}】之前没有${time}点的订阅记录，无法取消`;
};

// 取消订阅最近小说
export const cancleSubRecentNovels = async (groupId: string, time: number) => {
  return removeGroupSubscribeHour(groupId, time, 'recentNovels');
};

// 取消订阅每日小说
export const cancleSubTodayNovels = async (groupId: string, time: number) => {
  return removeGroupSubscribeHour(groupId, time, 'todayNovels');
};

// 订阅作者
const getSubGroupUserRecords = (group: IBotGroup) => {
  if(!group.followUsers || Object.keys(group.followUsers).length === 0) {
    return '当前没有订阅作者记录';
  }
  const userList = Object.entries(group.followUsers);
  return filterEmpty(`
    当前共订阅${userList.length}位作者：
    ${userList.map(([id, name]) => `${name}(id:${id})`).join('\n')}
  `);
};

const addFollowUser = async (groupId: string, userId: string, userName: string) => {
  const group = await getGroupData(groupId);
  if(!group.followUsers) {
    group.followUsers = {};
  }
  const followUsers = group.followUsers;
  if(followUsers[userId]) {
    return filterEmpty(`
      【订阅作者】当前已存在【${userName}】(id:${userId})的订阅记录

      ${getSubGroupUserRecords(group)}
      取消订阅请回复【小小丢 取消订阅作者 + 作者id】
    `);
  }
  followUsers[userId] = userName;
  await BotData.botGroup.insert(group);
  return filterEmpty(`
    【订阅作者成功】已订阅作者【${userName}】(id:${userId})

    ${getSubGroupUserRecords(group)}
    取消订阅请回复【小小丢 取消订阅作者 + 作者id】
  `);
};

export const subUser = async (groupId: string, content: string) => {
  if(!content) {
    return '【订阅作者失败】作者id/名称不可为空';
  }
  const favUserList = await requestFavUsers();
  // 是数字
  if(Number.isInteger(Number(content))) {
    const userById = favUserList.find(user => user.id === content);
    if(userById) {
      const { id, name } = userById;
      return addFollowUser(groupId, id, name);
    }
    return `【订阅作者失败】输入用户id【${content}】不在推荐作者中`;
  }
  // 是关键词
  const userList = favUserList.filter(({ name }) => name.includes(content));
  if(userList.length == 0) {
    return `【订阅作者失败】没有搜索到【${content}】相关的站内作者`;
  }
  if(userList.length == 1) {
    const { id, name } = userList[0];
    return addFollowUser(groupId, id, name);
  }
  return filterEmpty(`
    【订阅作者】共有${userList.length}个包含【${content}】的站内作者
    ${userList.slice(0, 10).map(({ name }) => name).join('、')}${userList.length > 10 ? '...' : ''}
    请使用更具体的关键字重新订阅
  `);
};

export const cancleSubUser = async (groupId: string, userId: string) => {
  if(Number.isNaN(Number(userId)) || !userId) {
    return '【取消订阅作者失败】仅支持输入作者id';
  }
  const group = await getGroupData(groupId);
  if(!group.followUsers?.[userId]) {
    return `【取消订阅作者失败】没有id为【${userId}】的作者订阅记录`;
  }
  const name = group.followUsers?.[userId];
  delete group.followUsers[userId];
  await BotData.botGroup.insert(group);
  return filterEmpty(`
    【取消订阅作者成功】已取消【${name}】(id:${userId})的订阅记录
    ${getSubGroupUserRecords(group)}
  `);
};

// todo: 订阅榜单