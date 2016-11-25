import { Meteor } from 'meteor/meteor';

export const ChannelSettings = {
  get: (uuid) => {
    let settings = Meteor.settings.channels[uuid];
    if (!settings) {
      throw new Meteor.Error('500',
        `Unable to locate channel settings for ${uuid} channel`);
    }
    return settings;
  }
};
