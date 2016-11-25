import { Meteor } from 'meteor/meteor';

const handler = (options) => {
  try {
    // XXX: Remove this line after development.
    console.log(options.body);

    // TODO: Implement mail service handler
  } catch (exception) {
    throw new Meteor.Error('500', `[mailHandler.handler] ${exception}`);
  }
};

export const mailHandler = (options) => handler(options);
