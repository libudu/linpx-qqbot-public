import axios from "axios";
import { LINPX_BACKEND } from "../../botconfig";
import { INovelProfile } from "./types";

export const linpxRequest = async <T>(path: string) => {
  return (await axios.get<T>(LINPX_BACKEND + path)).data;
}

export const requestNovels = async (ids: string[]) => {
  if(ids.length === 0) return [];
  const query = ids.map(id => `ids[]=${id}&`).join('');
  return linpxRequest<INovelProfile[]>(`/pixiv/novels?${query}`);
};

export const requestRecentNovels = async (page = 0) => {
  return linpxRequest<INovelProfile[]>(`/pixiv/novels/recent?page=${page}`);
};

export const requestFavUsers = async () => {
  return linpxRequest<{ id: string, name: string}[]>('/fav/user');
}