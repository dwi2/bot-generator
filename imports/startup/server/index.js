import '../../api/public/webhooks.js';
import { FoodItems } from '../../api/food_items.js';

Meteor.startup(() => {

  const FOOD_BOT_UUID = '8AAF3B7E-9EE7-4ED3-A7EE-6958C67A3E15';
  // XXX: insert some test data
  if (!FoodItems.findOne()) {
    FoodItems.insert({
      name: '鉄火巻一人前２本',
      price: 1000,
      botUuid: FOOD_BOT_UUID
    });

    FoodItems.insert({
      name: 'とろ巻',
      price: 1800,
      botUuid: FOOD_BOT_UUID
    });

    FoodItems.insert({
      name: 'いなり',
      price: 500,
      botUuid: FOOD_BOT_UUID
    });


  }
});
