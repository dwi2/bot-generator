import { Meteor } from 'meteor/meteor';
import * as utils from '/imports/utils';
import Messages from '/imports/messages';
import MailMessageHandler from './message';

const handler = (options) => {
  try {
    let uuid = options.params._uuid;
    let settings = utils.ChannelSettings.get(uuid);

    options.body.events.forEach((event) => {
      let userid = event.source.userId;
      let replyOptions = {
        channelAccessToken: settings.channelAccessToken,
        replyToken: event.replyToken
      };

      MailMessageHandler.process({
        uuid: uuid,
        userid: userid,
        event: event,
        replyOptions: replyOptions
      });
    });

  } catch (exception) {
    throw new Meteor.Error('500', `[mailHandler.handler] ${exception}`);
  }
};

export const mailHandler = (options) => handler(options);
