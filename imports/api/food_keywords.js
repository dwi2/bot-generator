import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const FoodKeywords = new Mongo.Collection('food_keywords');

FoodKeywords.containsKeywords = (botUuid, text) => {
  var result = FoodKeywords.findOne({botUuid: botUuid});
  if (!result || !result.keywords) {
    return false;
  }

  var words = result.keywords;
  if (Array.isArray(words)) {
    return words.some((word) => {
      return text.toLowerCase().indexOf(word.toLowerCase()) > -1;
    });
  } else {
    return text.toLowerCase().indexOf(words.toLowerCase()) > -1;
  }
};

FoodKeywords.getKeywords = (botUuid) => {
  var result = FoodKeywords.findOne({botUuid: botUuid});
  if (!result || !result.keywords) {
    return [];
  }
  return result.keywords;
};
