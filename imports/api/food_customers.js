import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const FoodCustomers = new Mongo.Collection('food_customers');

FoodCustomers.get = (customerId) => {
  return FoodCustomers.findOne({customerId: customerId});
};

FoodCustomers.renew = (lineUserProfile) => {
  if (typeof lineUserProfile === 'object' && lineUserProfile.userId) {
    FoodCustomers.upsert({
      customerId: lineUserProfile.userId
    }, {
      $set: {
        displayName: lineUserProfile.displayName,
        customerId: lineUserProfile.userId,
        pictureUrl: lineUserProfile.pictureUrl,
      }
    });
  }
};
