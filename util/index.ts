import { LINPX_BACKEND } from "../botconfig";

export const filterEmpty = (text: string) => {
  return text.trim().split('\n').map(line => line.trim()).join('\n');
}

export function proxyImg(url: string | undefined) {
  if (url && !url.startsWith(LINPX_BACKEND)) {
    url = `${LINPX_BACKEND}/proxy/pximg?url=${url}`;
  }
  return url || '';
}