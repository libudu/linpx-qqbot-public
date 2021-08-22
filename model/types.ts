export const Array2Map = <T extends { id: string }>(dataList: T[]) => {
  const dataMap: Record<string, T> = {};
  dataList.forEach(data => dataMap[data.id] = data);
  return dataMap;
}

export interface IBotGroup {
  // 群号
  id: string;
  // 推送最近小说
  recentNovels?: {
    [time: number]: true,
  };
  todayNovels?: {
    [time: number]: true,
  };
  followUsers?: {
    [id: string]: string,
  };
}