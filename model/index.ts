import { MongoClient } from 'mongodb';
import { DATABASE_URL } from '../botconfig';
import LinpxCollection from './LinpxCollection';
import { IBotGroup } from './types';

const mongodb = new MongoClient(DATABASE_URL);

interface IBotData {
  botGroup: LinpxCollection<IBotGroup>;
}

// @ts-ignore
export const BotData: IBotData = {};

export const initDatabase = async () => {
  await mongodb.connect();
  console.log('数据库连接成功');
  const qqbotdb = mongodb.db('qqbot');
  const botGroupCol = qqbotdb.collection('botGroup');
  BotData['botGroup'] = new LinpxCollection<IBotGroup>(botGroupCol);
}
initDatabase();