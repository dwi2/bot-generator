import '../../api/public/webhooks.js';
import { FoodItems } from '../../api/food_items.js';
import { FoodOrders } from '../../api/food_orders.js';
import { FoodKeywords } from '../../api/food_keywords.js';
import { FoodCustomerStates } from '../../api/food_customer_states.js';

Meteor.startup(() => {

  // XXX: insert some fake data
  const SUSHI_BOT_UUID = '8AAF3B7E-9EE7-4ED3-A7EE-6958C67A3E15';
  FoodItems.remove({});
  FoodOrders.remove({});
  FoodKeywords.remove({});
  FoodCustomerStates.remove({});

  var foodItemsData = [
    {
      name: '鉄火巻一人前２本',
      price: 1000,
      botUuid: SUSHI_BOT_UUID
    },
    {
      name: 'とろ巻',
      price: 1800,
      botUuid: SUSHI_BOT_UUID
    },
    {
      name: 'いなり',
      price: 500,
      botUuid: SUSHI_BOT_UUID
    }
  ];

  var foodKeywordsData = [
    {
      keywords: ['寿司', 'すし', 'sushi'],
      botUuid: SUSHI_BOT_UUID
    }
  ];

  foodItemsData.forEach((data) => {
    FoodItems.insert(data);
  });

  foodKeywordsData.forEach((data) => {
    FoodKeywords.insert(data);
  });

});
