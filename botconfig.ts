import { isDev } from "./app";

/**
 * 机器人的QQ号
 * 需要填写开发环境和线上环境两个，因为相同设备无法同时登陆两个，且机器人开发最好区分线上开发环境
 * 所以需要两个QQ号，一个用于线上运行，一个用于实际开发
 */
export const diuQQNumber = isDev ? 114514/* 开发环境QQ号 */ : 1919180/* 线上环境QQ号 */;

/**
 * LINPX前端的IP地址，用于QQ内直接点开
 * 如果ip被QQ游览器封禁，这里可能需要动态更换
 */
export const LINPX_IP = 'http://207.148.112.158';

/**
 * LINPX前端的域名，用于游览器内打开
 */
export const LINPX_LINK = 'https://linpx.linpicio.com';

/**
 * LINPX后端地址，用于向后端发起请求
 */
export const LINPX_BACKEND = 'https://linpxapi.linpicio.com';

/**
 * mongodb数据库的地址
 * 格式类似于【mongodb://用户名:密码@地址:端口】
 */
export const DATABASE_URL = '';