import { createClient } from 'oicq';
import { isDev } from '../app';
import { diuQQNumber, LINPX_IP, LINPX_LINK } from '../botconfig';
import { filterEmpty } from '../util';

console.log('是否是测试环境：', isDev);

export const client = createClient(diuQQNumber, {
  platform: 5,
});

// 扫码登录
client.on("system.login.qrcode", function (data) {
  process.stdin.once("data", () => {
    this.login(); //扫码后按回车登录
  });
});

// 登录上线成功
client.on("system.online", async () => {
  console.log('Logged in!');
});

client.login();

// linpx群群号
export const linpxGroupNumber = 576268549;
// linpx欢迎语
const helloWords = "[CQ:face,id=144][CQ:face,id=144][CQ:face,id=144][CQ:face,id=144][CQ:face,id=144][CQ:face,id=144][CQ:face,id=144]\r[CQ:face,id=137]Linpx气氛组[CQ:face,id=137]\r[CQ:face,id=138]热烈    欢迎 [CQ:face,id=138]\r[CQ:face,id=137]Linpx气氛组[CQ:face,id=137]\r[CQ:face,id=144][CQ:face,id=144][CQ:face,id=144][CQ:face,id=144][CQ:face,id=144][CQ:face,id=144][CQ:face,id=144]";
// 自动欢迎新人进群
client.on('notice.group.increase', (data) => {
  const { group_id, user_id } = data;
  if(linpxGroupNumber == group_id && user_id !== diuQQNumber) {
    client.sendGroupMsg(group_id, helloWords);
  }
});

// 自动同意加群
client.on('request.group.invite', (data) => {
  client.setGroupAddRequest(data.flag);
});

// 自动同意加好友
client.on('request.friend.add', (data) => {
  client.setFriendAddRequest(data.flag);
})

// 新入群自动介绍
client.on('notice.group.increase', ({ group_id, user_id }) => {
  // 自己加入了非LINPX群，自动介绍
  if(user_id == diuQQNumber) {
    client.sendGroupMsg(group_id, filterEmpty(`
      大家好~我是小小丢，是林彼丢开发的一个小说与LINPX信息推送的机器人
      主站是：${LINPX_IP}，可以在QQ中直接点开
      也可以在游览器中通过${LINPX_LINK}打开
      发送【小小丢 最近小说】可以查看最近小说
      全部命令可以发送【小小丢 帮助】查看
    `));
  }
})