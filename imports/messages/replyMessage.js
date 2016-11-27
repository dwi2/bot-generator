import { HTTP } from 'meteor/http';

let replyMessage = (options) => {
  let replyEndpoint = 'https://api.line.me/v2/bot/message/reply';

  let channelAccessToken = options.channelAccessToken;
  let replyToken = options.replyToken;
  let messages = options.messages;

  if (replyToken === '00000000000000000000000000000000' ||
      replyToken === 'ffffffffffffffffffffffffffffffff') {
    // Early return on channel webhook verification messages.
    return;
  }

  return HTTP.post(replyEndpoint, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${channelAccessToken}`
    },
    data: {
      replyToken: replyToken,
      messages: messages
    }
  });
};

export default replyMessage;
