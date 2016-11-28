import { HTTP } from 'meteor/http';

let profile = (lineUserId, channelAccessToken) => {
  let endpoint = `https://api.line.me/v2/bot/profile/${lineUserId}`;
  if (!channelAccessToken) {
    return;
  }

  var result;
  try {
    result = HTTP.get(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channelAccessToken}`
      }
    });
  } catch (e) {
    console.warn(e);
    return;
  }

  return result.data;
};

export default profile;
