import { Meteor } from 'meteor/meteor';
import messageProcessor from './message_processor';

const handler = (options) => {
  try {
    // console.log(options.params._uuid);
    // var settings = utils.ChannelSettings.get(options.params._uuid);

    var msgEvents = options.body.events;
    msgEvents.forEach((evt) => {
      let botUuid = options.params._uuid;
      messageProcessor.parse(botUuid, evt);
    });

  } catch (exception) {
    throw new Meteor.Error('500', `[foodHandler.handler] ${exception}`);
  }
};

export const foodHandler = (options) => handler(options);
