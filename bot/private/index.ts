import { ICommand, matchStartCmd, IMatchCallback } from "../commands";
import { getHateYouReply, getLikeYouReply } from "../commands/hello_cmd";
import { processStaticCmd } from "../commands/static_cmd";
import { getRecentNovelAndCheck, getTodayNovels, searchNovel, searchUser } from "../linpx";
import { addUserField, deleteUserField, followUser, unfollowUser } from "./linpx_admin";

// 提取出id和field并注入
export const matchStartCmdAndExtractMap = (ids: string[],
  callback: (id: number, field: string ) => ReturnType<IMatchCallback>,
) => {
  return matchStartCmd(ids, async ({ content }) => {
    const [ id, field ] = content.split(' ');
    if(Number.isNaN(Number(id)) || !id) {
      return 'id不是数字';
    }
    if(!field) {
      return 'field不能为空';
    }
    return callback(Number(id), field.trim());
  });
};

// 提取id
export const matchStartCmdAndCheckId = (
  ids: string[],
  callback: (id: number) => ReturnType<IMatchCallback>,
) => {
  return matchStartCmd(ids, async ({ content }) => {
    const id = Number(content);
    if(!content || Number.isNaN(Number(id))) {
      return 'id不是数字';
    }
    return callback(id);
  });
};

export const PrivateCommandList: ICommand[] = [
  // 静态命令
  ({ text }) => processStaticCmd(text),
  // 动态命令
  matchStartCmd(['每日小说', '今日小说'], () => getTodayNovels()),
  matchStartCmd(['最近小说', '看小说'], ({ content }) => getRecentNovelAndCheck(content)),
  // 搜索
  matchStartCmd(['查询小说', '搜索小说'], ({ content }) => searchNovel(content)),
  matchStartCmd(['作者', '查询作者', '搜索作者'], ({ content }) => searchUser(content)),
  // 其他
  matchStartCmd(['我喜欢你'], ({ user_id }) => getLikeYouReply(user_id)),
  matchStartCmd(['我讨厌你'], ({ user_id }) => getHateYouReply(user_id)),
  // 管理员拦截器
  ({ user_id }) => {
    if(user_id !== 3127966867) {
      return null;
    }
    return false;
  },
  // 管理员命令，开源版中省略
];