import { HTTP } from 'meteor/http';

let templateMessage = (options) => {
  let replyEndpoint = 'https://api.line.me/v2/bot/message/push';

  let channelAccessToken = options.channelAccessToken;
  let messages = options.messages;
  let userid = options.userid;

  HTTP.post(replyEndpoint, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}`
    },
    data: {
      to: userid,
      messages: messages
    }
  });
};

export default templateMessage;
