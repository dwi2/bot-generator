import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const FoodItems = new Mongo.Collection('food_items');

if (Meteor.isServer) {
  Meteor.publish('foodItems', function findFoodItems() {
    return FoodItems.find({});
  });
}

// id: uuid
// name: string
// price: number
// image_url: string
// bot_uuid: uuid
Meteor.methods({
  'foodItems.insert'(name, price, botUuid, imageUrl) {
    check(name, String);
    check(price, Number);
    if (imageUrl) {
      check(imageUrl, String);// TODO: validation check
    }

    // Make sure the user is logged in before inserting a task
    // if (! this.userId) {
    //   throw new Meteor.Error('not-authorized');
    // }

    FoodItems.insert({
      name,
      price,
      botUuid,
      imageUrl,
      createdAt: new Date(),
    });
  },

  'foodItems.remove'(id) {
    FoodItems.remove(id);
  },

  'foodItems.update'(id, name, price, imageUrl) {
    FoodItems.update({_id: id}, )
  }
});
