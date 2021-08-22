import { searchNovel, searchUser, getRecentNovelAndCheck, getTodayNovels } from '../linpx';
import { processStaticCmd } from './static_cmd';
import { cancleSubTodayNovels, cancleSubUser, subTodayNovels, subUser } from '../subscribe';
import { getLikeYouReply, getHateYouReply } from './hello_cmd';

interface ICommandProps {
  rowText: string;
  text: string;
  group_id: number;
  user_id: number;
}

export type ICommand = ((props: ICommandProps) => Promise<string | null | false> | string | null | false);

// 命中命令后的回调，命中后只能返回回复字符串或者直接结束
export type IMatchCallback = (commandProps: ICommandProps & { content: string }) => Promise<string | null> | string | null;

// 生成一条由前缀和数字组成的规则
export const matchStartCmd = (ids: string[], callback: IMatchCallback) => {
  return async (commandProps: ICommandProps) => {
    const text = commandProps.text;
    // 匹配所有关键字
    for(let i of ids) {
      // 匹配成功
      if(text.startsWith(i)) {
        // 去掉开头提取内容
        const content = text.replace(i, '').trim();
        return await callback({ ...commandProps, content });
      }
    }
    // 没有任何匹配
    return false;
  };
};

export const matchStartCmdAndCheckHour = (ids: string[],
  callback: (group_id: string, hour: number ) => ReturnType<IMatchCallback>,
  objectName: string,
) => {
  return matchStartCmd(ids, async ({ group_id, content }) => {
    const time = Number(content);
    // 数字检查
    if(Number.isNaN(time)) {
      return `【${objectName}错误】数字不合法`;
    }
    // 整数检查
    if(!Number.isInteger(time)) {
      return `【${objectName}错误】输入时间错误，不为整数`;
    }
    // 0~23检查
    if(time > 23 || time < 0) {
      return `【${objectName}错误】输入时间不在0~23之间`;
    }
    return callback(String(group_id), time );
  });
};

export const CommandList: ICommand[] = [
  // 静态命令
  ({ text }) => processStaticCmd(text),
  // 动态命令
  matchStartCmd(['每日小说', '今日小说'], () => getTodayNovels()),
  matchStartCmd(['最近小说', '看小说'], ({ content }) => getRecentNovelAndCheck(content)),
  // 搜索
  matchStartCmd(['查询小说', '搜索小说'], ({ content }) => searchNovel(content)),
  matchStartCmd(['作者', '查询作者', '搜索作者'], ({ content }) => searchUser(content)),
  // 订阅
  // matchStartCmdAndCheckHour(['订阅小说', '订阅最近小说'], subRecentNovels, '订阅最近小说'),
  // matchStartCmdAndCheckHour(['取消订阅最近小说'], cancleSubRecentNovels, '取消订阅最近小说'),
  matchStartCmdAndCheckHour(['订阅小说', '订阅今日小说', '订阅每日小说'], subTodayNovels, '订阅每日小说'),
  matchStartCmdAndCheckHour(['取消订阅今日小说', '取消订阅每日小说'], cancleSubTodayNovels, '取消订阅每日小说'),
  matchStartCmd(['订阅作者'], ({ content, group_id }) => subUser(String(group_id), content)),
  matchStartCmd(['取消订阅作者'], ({ content, group_id }) => cancleSubUser(String(group_id), content)),
  // 其他
  matchStartCmd(['我喜欢你'], ({ user_id }) => getLikeYouReply(user_id)),
  matchStartCmd(['我讨厌你'], ({ user_id }) => getHateYouReply(user_id)),
];