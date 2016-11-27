import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const FoodOrders = new Mongo.Collection('food_orders');

// id: uuid
// items: array
// botUuid:
// customerId
// confirmed: boolean
// location: string or object?

FoodOrders.getOngoingOne = (botUuid, customerId) => {
  var ongoingOrder = FoodOrders.findOne({
    botUuid: botUuid,
    customerId: customerId,
    confirmed: false
  });

  if (!ongoingOrder) {
    FoodOrders.insert({
      botUuid: botUuid,
      customerId: customerId,
      items: [],
      confirmed: false
    });
    ongoingOrder = FoodOrders.findOne({
      botUuid: botUuid,
      customerId: customerId,
      confirmed: false
    });
  }
  return ongoingOrder;
};

FoodOrders.addItem = (botUuid, customerId, foodItemId) => {
  var ongoingOrder = FoodOrders.getOngoingOne(botUuid, customerId);
  ongoingOrder.items.push(foodItemId);
  FoodOrders.update({
    botUuid: botUuid,
    customerId: customerId,
    confirmed: false
  }, {
    $set: {
      items: ongoingOrder.items
    }
  })
};

FoodOrders.removeItem = (botUuid, customerId, foodItemId) => {
  var ongoingOrder = FoodOrders.getOngoingOne(botUuid, customerId);
  var firstIndexOfItem = ongoingOrder.items.indexOf(foodItemId);

  if (firstIndexOfItem > -1) {
    ongoingOrder.items.splice(firstIndexOfItem, 1);
    FoodOrders.update({
      botUuid: botUuid,
      customerId: customerId,
      confirmed: false
    }, {
      $set: {
        items: ongoingOrder.items
      }
    })
  }
};