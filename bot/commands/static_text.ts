import { LINPX_IP, LINPX_LINK } from "../../botconfig";
import { filterEmpty } from "../../util";
import { linpxGroupNumber } from "../client";

export const HELP_TEXT = filterEmpty(`
  ----小小丢命令一览表----
  （除订阅外，其他功能私聊小小丢也可以得到回复）

  👀 速览功能 👀
  【小小丢 每日小说/今日小说】24h内更新的小说
  【小小丢 最近小说/看小说】最近1~5条小说
  【小小丢 最近小说2】最近6~10条小说，依此类推最大200

  🔎 搜索功能 🔎
  【小小丢 查询小说/搜索小说 + id/关键词】获取小说简介和链接
  【小小丢 作者/搜索作者 + id/名称】获取作者介绍和最近小说

  🕛 订阅功能 🕛
  【小小丢 订阅小说/订阅每日小说 + 0~23】在指定整点发送每日小说
  【小小丢 订阅作者 + id】当作者发布新小说时（5分钟内）将收到推送

  ➕ 其他 ➕
  【小小丢 开发者/鸣谢/赞助】查看LINPX及机器人的开发者相关信息
  【小小丢 帮助/命令/指令】查看小小丢的全部命令
`);

export const DEFAULT_TEXT = filterEmpty(`
  你好呀~输入【小小丢 帮助】查看小小丢的全部命令
`);
 
export const DEVELOPER_TEXT = filterEmpty(`
  机器人开发者：林彼丢
  LINPX站长：林彼丢
  设计：apoto5
  协助：V.C
  顾问：空狼
  感谢QQ机器人框架OICQ

  LINPX项目开源链接：https://github.com/libudu/linpx-web
  LINPX官方QQ群：${linpxGroupNumber}
  爱发电赞助链接：https://afdian.net/@LINPX
  你的支持是我们前进的最大动力！
`);

export const LINPX_TEXT = filterEmpty(`
  LINPX是一个可以用来方便看兽文的网站
  链接1(直接点开)：${LINPX_IP}
  链接2(游览器打开)：${LINPX_LINK}
`);