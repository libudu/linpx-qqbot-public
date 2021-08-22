export const getLikeYouReply = (user_id: number): string => {
  if(user_id === 3127966867) {
    return '自恋狂guna';
  }
  else if(user_id === 958071022) {
    return '没错，小小丢最喜欢你了💕';
  }
  else {
    const r = Math.random();
    if(r < 0.05) {
      return '小小丢也喜欢你';
    } else {
      return '你是个好人，可惜我们不合适';
    }
  }
};


const hateYouReplyText = [
  '略略略',
  '那我也讨厌你行了⑧',
  '😅',
  '这么说吧，我也挺讨厌我自己的',
  '难人，你成功引起了我的注意~'
];
export const  getHateYouReply = (user_id: number): string => {
  if(user_id === 3127966867) {
    return '你开心就好';
  }
  else if(user_id === 958071022) {
    return '啵啵啵，对不起了啦';
  }
  const r = Math.floor(Math.random() * hateYouReplyText.length);
  return hateYouReplyText[r];
}