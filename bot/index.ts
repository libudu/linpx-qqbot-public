import { isDev } from '../app';
import { client } from './client';
import { CommandList } from './commands';
import { PrivateCommandList } from './private';

const CMD_HEADER = isDev ? '测试丢' : '小小丢';
console.log('当前命令前缀：', CMD_HEADER);

// 处理群消息
client.on('message.group', async (data) => {
  const { group_id, raw_message, user_id } = data;
  let text = raw_message.trim();
  // 每条消息以小小丢为前缀
  if(text.startsWith(CMD_HEADER)) {
    text = text.replace(CMD_HEADER,  '').trim().toLowerCase();
    for(const command of CommandList) {
      const result = await command({ rowText: raw_message, text, user_id, group_id });
      // 匹配错误，尝试下一个匹配
      if(result === false) {
        continue;
      }
      // 执行结束，不再匹配
      if(result === null) {
        return;
      }
      // 是字符串，回复
      if(typeof result === 'string') {
        client.sendGroupMsg(group_id, result);
        return;
      }
    }
  }
});

// 处理私聊消息
client.on('message.private', async (data) => {
  const { raw_message, user_id } = data;
  let text = raw_message.trim();
  if(text.startsWith(CMD_HEADER)) {
    text = text.replace(CMD_HEADER,  '').trim();
  }
  for(const command of PrivateCommandList) {
    const result = await command({ rowText: raw_message, text, user_id, group_id: -1 });
    // 匹配错误，尝试下一个匹配
    if(result === false) {
      continue;
    }
    // 执行结束，不再匹配
    if(result === null) {
      return;
    }
    // 是字符串，回复
    if(typeof result === 'string') {
      client.sendPrivateMsg(user_id, result);
      return;
    }
  }
});