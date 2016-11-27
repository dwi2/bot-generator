import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const Bots = new Mongo.Collection('bots');

Bots.isOn = (botUuid) => {
  var bot = Bots.get(botUuid);
  return bot ? bot.on : false;
};

Bots.get = (botUuid) => {
  return Bots.findOne({botUuid: botUuid});
};
