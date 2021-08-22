import schedule from 'node-schedule';
import { isDev } from '../../app';
import { BotData } from '../../model';
import { filterEmpty } from '../../util';
import { client } from '../client';
import { getTodayNovels } from '../linpx';
import { requestRecentNovels } from '../linpx/request';
import { INovelProfile } from '../linpx/types';
import { getNovelProfileShortText, getNovelProfileText } from '../linpx/util';

// 推送每日小说
const pushTodayNovels = async (date: Date) => {
  // 对齐为+8中国时间
  let hour = date.getHours() + (480 + date.getTimezoneOffset()) / 60;
  // 修正过长过短时间
  if(hour >= 24) hour -= 24;
  if(hour < 0) hour += 24;

  const groups = await BotData.botGroup.findAll();
  if(groups.length > 0) {
    // 每日小说文案
    const todayNovelReply = await getTodayNovels() + '\n（本条消息由订阅推送发送）';
    // 遍历每个群的每个订阅
    groups.forEach(async ({ id, todayNovels }) => {
      // 推送每日小说
      if(todayNovels && Object.keys(todayNovels).some(targetTime => Number(targetTime) === hour)) {
        client.sendGroupMsg(Number(id), todayNovelReply);
      }
    })
  }
};

// 推送新发布的小说
const pushNewNovels = async () => {
  // 获取最近小说，收集5分钟内的新发布的小说
  // 因为小说比较少，不考虑5分钟内发布小说超过10条的情况
  const novels = await requestRecentNovels();
  // 5分钟内的小说
  const newNovels = novels.filter(({ createDate }) =>  (Date.now() - (new Date(createDate)).getTime()) < 5 * 60 * 1000);
  const userNovelMap: Record<string, INovelProfile[]> = {};
  newNovels.forEach(novel => {
    if(!userNovelMap[novel.userId]) {
      userNovelMap[novel.userId] = []; 
    }
    userNovelMap[novel.userId].push(novel);
  });
  // 遍历每个群聊
  const groups = await BotData.botGroup.findAll();
  groups.forEach(({ followUsers, id }) => {
    if(followUsers) {
      const users = Object.entries(followUsers);
      if(users.length === 0) return;
      // 单个群聊中每个关注的作者
      users.forEach(([ userId, userName ]) => {
        const novels = userNovelMap[userId];
        if(!novels) return;
        // 向订阅了该作者的群聊发通知
        const text = filterEmpty(`
          ${userName}发布了新小说，快来看看⑧！

          ${
            novels.length == 1
            ? getNovelProfileText(novels[0])
            : novels.map((novel, index) => `${index + 1}、` + getNovelProfileShortText(novel)).join('\n\n')
          }
        `);
        client.sendGroupMsg(Number(id), text);
      });
    }
  });
};

// 初始化订阅的计时任务
const initSchedule = () => {
  if(isDev) {
    console.log('测试环境下不进行订阅轮询');
  } else {
    console.log('订阅轮询初始化');

    // 每小时轮询，
    schedule.scheduleJob({ rule: '1 0 * * * *', tz: 'Asia/Chongqing' }, pushTodayNovels);

    // 每5分钟轮询新小说
    schedule.scheduleJob({ rule: '0 */5 * * * *'}, pushNewNovels)
  }
}; 
initSchedule();