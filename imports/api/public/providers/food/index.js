import { Meteor } from 'meteor/meteor';
import messageProcessor from './message_processor';
import dataProcessor from './data_processor';

const handler = (options) => {
  try {
    if (!options.body && options.modelName) {
      return dataProcessor.process(options.params._uuid, options.modelName, options.query);
    } else if (options.body) {
      let msgEvents = options.body.events;
      msgEvents.forEach((evt) => {
        let botUuid = options.params._uuid;
        messageProcessor.parse(botUuid, evt);
      });
    }
  } catch (exception) {
    throw new Meteor.Error('500', `[foodHandler.handler] ${exception}`);
  }
};

export const foodHandler = (options) => handler(options);
