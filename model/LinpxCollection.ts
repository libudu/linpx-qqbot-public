import { Collection } from 'mongodb';
import { Array2Map } from './types';

type Addition<T> = T & { _id: string };

export default class LinpxCollection<T extends { id: string }> {
  collection: Collection;

  constructor(collection: Collection) {
    this.collection = collection;
  }

  // 插入时附加_id和时间戳_time
  insert = (data: T) => {
    const newData: Addition<T> = { ...data, _id: data.id };
    return this.collection.replaceOne({ _id: data.id }, newData, { upsert: true });
  }

  insertMany = async (dataList: T[]) => {
    if(dataList.length === 0) return;
    const idList = dataList.map(data => data.id);
    const newDataList: Addition<T>[] = dataList.map(data => ({
      ...data,
      _id: data.id,
    }));
    // 先删除已存在的
    await this.collection.deleteMany({ _id: { $in: idList }});
    // 再全部插入更新
    return this.collection.insertMany(newDataList);
  }

  // 查询时需要判断是否过期，过期则返回空
  findById = (id: string):Promise<T | null> => {
    return this.collection.findOne({ _id: id });
  }

  findByIdList = async (idList: string[]):Promise<{
    result: Record<string, T>,
    left: string[] | null,
  }> => {
    const dataList:Addition<T>[] = await this.collection.find({_id: { $in: idList }}).toArray();
    const result: Record<string, T> = Array2Map(dataList);
    // 所有id都找到了
    if(dataList.length === idList.length) return {
      result,
      left: null,
    }
    // 有id没找到
    return {
      result,
      left: idList.filter((id) => !result[id]),
    };
  }

  findAll = (): Promise<T[]> => {
    return this.collection.find({}).toArray();
  }

  deleteById = (id: string) => {
    return this.collection.deleteOne({ _id: id });
  }

  deleteByIdList = (idList: string) => {
    return this.collection.deleteMany({ _id: { $in: idList }});
  }
}