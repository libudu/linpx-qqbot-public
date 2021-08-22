import { LINPX_IP, LINPX_LINK } from "../../botconfig";
import { filterEmpty, proxyImg } from "../../util";
import { requestNovels } from "./request";
import { INovelProfile, IUserInfo } from "./types";

// 获取小说模板
export const getNovelProfileShortText = ({ id, title, userName, tags, length }: INovelProfile) => {
  return filterEmpty(`
    《${title}》  ${length}字
    作者：${userName}
    标签：${tags.slice(0, 8).join(' ')}
    链接：${LINPX_IP}/pn/${id}
  `)
};

// 获取小说详细模板
export const getNovelProfileText = ({ id, title, tags, userName, createDate, desc, length }: INovelProfile) => {
  const date = new Date(createDate);
  return filterEmpty(`
    《${title}》  ${length}字
    作者：${userName}
    标签：${tags.slice(0, 8).join(' ')}
    发布时间：${date.toLocaleDateString('zh')} ${date.toLocaleTimeString('zh', { hour12: false })}
    简介：${desc.slice(0, 50)}${desc.length > 50 ? '......' : ''}
    链接1(直接点开)：\n${LINPX_IP}/pn/${id}
    链接2(游览器打开)：\n${LINPX_LINK}/pn/${id}`
  );
};

export const getUserText = async ({ id, name, comment, tags, imageUrl, novels }: IUserInfo) => {
  const novelProfiles = await requestNovels(novels.reverse().slice(0, 3));
  const mainTagText = tags.length ? tags.slice(0, 8).map(tag => tag.tag).join(' ') : '无';
  const novelText = novelProfiles.length === 0 ? '无' :
    '\n' + novelProfiles.map(({ id, title, tags, length }, index) => filterEmpty(`
      ${index + 1}、《${title}》 ${length}字
      标签：${tags.slice(0, 5).join(' ')}
      链接：${LINPX_IP}/pn/${id}
    `)).join('\n\n');
  return filterEmpty(`
    作者：${name}(id:${id})
    [CQ:image,file=${proxyImg(imageUrl)}]
    简介：${comment.slice(0, 50)}${comment.length > 50 ? '......' : ''}
    主要标签：${mainTagText}
    主页链接：${LINPX_IP}/pu/${id}

    最近小说：${novelText}
  `);
};