import { DEFAULT_TEXT, DEVELOPER_TEXT, HELP_TEXT, LINPX_TEXT } from './static_text';

interface IPreloadCmd {
  cmd: string | string[];
  reply: string;
}

const ProloadCmdList: IPreloadCmd[] = [
  {
    cmd: ['你好', '你好呀', '你好啊'],
    reply: '你好呀',
  },
  {
    cmd: '世界上最帅的猫是谁',
    reply: '那还用问，当然是林彼丢啦',
  },
  {
    cmd: ['命令', '指令', '全部命令', '帮助'],
    reply: HELP_TEXT,
  },
  {
    cmd: ['鸣谢', '开发者'],
    reply: DEVELOPER_TEXT,
  },
  {
    cmd: 'block code the beast',
    reply: '[CQ:image,file=./data/image/block_code_the_beast.png]',
  },
  {
    cmd: 'block code 999',
    reply: '[CQ:image,file=./data/image/block_code_999.png]',
  },
  {
    cmd: 'linpx',
    reply: LINPX_TEXT,
  },
  {
    cmd: '',
    reply: DEFAULT_TEXT,
  }
];

export const StaticCmdMap: { [cmd: string]: Omit<IPreloadCmd, 'cmd'> } = {};

// 将命令列表拍平为命令字典
ProloadCmdList.forEach(preloadCmd => {
  const cmd = preloadCmd.cmd;
  if(Array.isArray(cmd)) {
    cmd.forEach(c => StaticCmdMap[c] = preloadCmd);
  } else {
    StaticCmdMap[cmd] = preloadCmd
  }
});

export const processStaticCmd = (cmd: string): string | false => {
  const actionInfo = StaticCmdMap[cmd];
  // 存在命令
  if(actionInfo) {
    return actionInfo.reply;
  }
  return false;
};