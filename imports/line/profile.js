import { HTTP } from 'meteor/http';

let profile = (lineUserId, channelAccessToken) => {
  let endpoint = `https://api.line.me/v2/bot/profile/${lineUserId}`;
  if (!channelAccessToken) {
    return;
  }

  let result = HTTP.get(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}`
    }
  });

  // TODO error handling?
  return result.data;
};

export default profile;