import { Meteor } from 'meteor/meteor';
import * as utils from '/imports/utils';
import Messages from '/imports/messages';

const handler = (options) => {
  try {
    let settings = utils.ChannelSettings.get(options.params._uuid);

    // TODO: Currently reply on all messages, need to reply specific message based on user state.
    Messages.replyMessage({
      channelAccessToken: settings.channelAccessToken,
      replyToken: options.body.events[0].replyToken,
      messages: [
        { 'type': 'text', 'text': 'Hello, user!' },
        { 'type': 'text', 'text': 'How may I help you?' }
      ]
    });
  } catch (exception) {
    throw new Meteor.Error('500', `[mailHandler.handler] ${exception}`);
  }
};

export const mailHandler = (options) => handler(options);
