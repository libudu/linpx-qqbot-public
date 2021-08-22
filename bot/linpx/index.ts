import { LINPX_IP } from '../../botconfig';
import { filterEmpty } from '../../util';
import { linpxRequest, requestFavUsers, requestNovels, requestRecentNovels } from './request';
import { IAnalyseTag, INovelProfile, IUserInfo } from './types';
import { getNovelProfileShortText, getNovelProfileText, getUserText } from './util';

export const getTodayNovels = async () => {
  const novels = await requestRecentNovels();
  const todayNovels = novels.filter(({ createDate }) => {
    return Date.now() - (new Date(createDate)).getTime() < 24 * 60 * 60 * 1000;
  });
  if(todayNovels.length) {
    return filterEmpty(`
      -----LINPX今日小说-----
      ${todayNovels.slice(0, 5).map((novel, index) => `${1 + index}、${getNovelProfileShortText(novel)}`).join('\n\n')}
  
      ${
        todayNovels.length > 5
        ? `仅展示部分小说，全部结果请查看${LINPX_IP}/pixiv/recent/novels`
        : `更多小说请查看：${LINPX_IP}/pixiv/recent/novels`
      }
    `);
  }
  // 今天没有新文
  return filterEmpty(`
    -----LINPX今日小说-----
    今日还没有作者产粮喵~

    可以回复【小小丢 最近小说】查看前些天的小说
    还可以上LINPX阅读更多小说${LINPX_IP}
  `)
};

export const getRecentNovelAndCheck = async (content: string) => {
  const index = Number(content);
  if(Number.isNaN(index)) {
    return '【查看最近小说错误】数字不合法';
  };
  return getRecentNovels(index);
};

export const getRecentNovels = async (index: number) => {
  index = Math.min(Math.max(0, index - 1), 200);

  // 计算当前页数
  const page = 1 + Math.floor(index / 2);
  const res = await requestRecentNovels(page);
  // 当前对应的小说序号
  const start = 1 + 5 * index;
  // 内容
  const offset = index % 2 * 5;
  const novels = res.slice(0 + offset, 5 + offset);
  const text = filterEmpty(`
    -----LINPX最近小说${start}~${start + 4}----
    ${novels.map((novel, index) => `${start+index}、${getNovelProfileShortText(novel)}`).join('\n\n')}

    全部小说请上：${LINPX_IP}
    查看更多可以回复【小小丢 最近小说${index+2}】
  `);
  return text;
};

export const searchNovel = async (content: string) => {
  if(!content) {
    return '【搜索小说错误】搜索关键词不能为空';
  }

  const SEARCH_HEADER = '----小小丢查询小说结果----';
  const id = Number(content);
  // 搜索id
  if(!Number.isNaN(id)) {
    const novel = (await requestNovels([content]))[0];
    if(novel) {
      return filterEmpty(`
        ${SEARCH_HEADER}
        ${getNovelProfileText(novel)}
      `);
    }
    return `【搜索小说错误】未搜索到id为${id}的小说`;
  }
  
  // 搜索关键字
  if(content.length > 20) {
    return '【搜索小说错误】关键词过长';
  }

  // 先搜tag
  const tagResponse = await linpxRequest<IAnalyseTag>('/analyse/tags');
  const tags = tagResponse.data;
  // 3篇以上的tag才进入统计
  const matchTag = tags.find((tag) => tag.tagName === content);
  const idList = matchTag?.novels;
  if(idList) {
    const total = idList.length;
    const novels = await requestNovels(idList.slice(0, 3));
    return filterEmpty(`
      ${SEARCH_HEADER}
      匹配到站内tag，共${total}篇【${content}】相关小说
  
      ${novels.map((novel, index) => `${index + 1}、${getNovelProfileShortText(novel)}`).join('\n\n')}
      ${total > 3 ? `\n全部结果请点击${LINPX_IP}/search?word=${encodeURIComponent(content)}` : ''}
    `);
  }
  
  const { total, novels }: { total: number, novels: INovelProfile[]}
  = (await linpxRequest(`/pixiv/search/novel/${encodeURIComponent(content)}`));
  if(total === 0) {
    return `【搜索小说错误】没有搜索到【${content}】为关键词的小说`;
  }
  if(total === 1) {
    return filterEmpty(`
      ${SEARCH_HEADER}
      ${getNovelProfileText(novels[0])}
    `);
  }
  return filterEmpty(`
    ${SEARCH_HEADER}
    未匹配到站内tag，使用全局搜索，共${total}篇【${content}】相关小说

    ${novels.slice(0, 3).map((novel, index) => `${index + 1}、${getNovelProfileShortText(novel)}`).join('\n\n')}
    ${total > 3 ? `\n全部结果请点击${LINPX_IP}/search?word=${encodeURIComponent(content)}` : ''}
  `);
};

export const searchUser = async (content: string) => {
  if(!content) {
    return '【搜索作者错误】搜索作者的id或关键词不能为空';
  }

  const SEARCH_HEADER = '----小小丢查询作者结果----';
  const id = Number(content);
  // 搜索id
  if(!Number.isNaN(id)) {
    const user = (await linpxRequest<IUserInfo>(`/pixiv/user/${id}`));
    if(user) {
      return filterEmpty(`
        ${SEARCH_HEADER}
        ${await getUserText(user)}
      `);
    }
    return `【搜索作者错误】未搜索到id为${id}的作者`;
  }
  
  // 搜索关键字
  if(content.length > 20) {
    return '【搜索作者错误】关键词过长';
  }

  const favUsers = await requestFavUsers();
  const userList = favUsers.filter(({ name }) => name.includes(content));
  if(userList.length == 0) {
    return filterEmpty(`
      【搜索作者】没有搜索到【${content}】相关的站内作者
      查看全部推荐作者：${LINPX_IP}/pixiv/fav/user
    `);
  }
  if(userList.length == 1) {
    const userId = userList[0].id;
    const user = (await linpxRequest<IUserInfo>(`/pixiv/user/${userId}`));
    return filterEmpty(`
      ${SEARCH_HEADER}
      ${await getUserText(user)}
    `);
  }
  return filterEmpty(`
    ${SEARCH_HEADER}
    搜索到${userList.length}个结果
    ${userList.slice(0, 10).map(({ name }) => name).join('、')}${userList.length > 10 ? '...' : ''}
    请使用更具体的关键字重新搜索
  `);
};