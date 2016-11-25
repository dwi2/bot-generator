import { Meteor } from 'meteor/meteor';
import messageProcessor from './message_processor';

var replyTokens = {};

const handler = (options) => {
  try {
    // console.log(options.params._uuid);
    // var settings = utils.ChannelSettings.get(options.params._uuid);

    var msgEvents = options.body.events;
    msgEvents.forEach((evt) => {
      let botUuid = options.params._uuid;
      let tokenObject = messageProcessor.parse(botUuid, evt);
      replyTokens[botUuid] = tokenObject;
    });

  } catch (exception) {
    throw new Meteor.Error('500', `[foodHandler.handler] ${exception}`);
  }
};

export const foodHandler = (options) => handler(options);
