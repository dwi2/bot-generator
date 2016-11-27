import '../../api/public/webhooks.js';
import * as utils from '/imports/utils';
import { FoodItems } from '../../api/food_items.js';
import { FoodOrders } from '../../api/food_orders.js';
import { FoodKeywords } from '../../api/food_keywords.js';
import { FoodCustomerStates } from '../../api/food_customer_states.js';
import { Bots } from '../../api/bots.js';

Meteor.startup(() => {

  // XXX: insert some fake data
  const SUSHI_BOT_UUID = '8AAF3B7E-9EE7-4ED3-A7EE-6958C67A3E15';
  FoodItems.remove({});
  FoodOrders.remove({});
  FoodKeywords.remove({});
  FoodCustomerStates.remove({});
  Bots.remove({});
  // Don't delete record of FoodCustomers because it is fetched from LINE

  var settings = utils.ChannelSettings.get(SUSHI_BOT_UUID);
  var foodItemsData = [
    {
      name: 'カッパ巻',
      price: 500,
      imageUrl: 'https://dl.dropboxusercontent.com/u/19608428/images/kappamaki.png',
      botUuid: SUSHI_BOT_UUID
    },
    {
      name: '鉄火巻一人前２本',
      price: 1000,
      imageUrl: 'https://dl.dropboxusercontent.com/u/19608428/images/tekkamaki.jpg',
      botUuid: SUSHI_BOT_UUID
    },
    {
      name: 'とろ巻',
      price: 1800,
      imageUrl: 'https://dl.dropboxusercontent.com/u/19608428/images/toromaki.jpg',
      botUuid: SUSHI_BOT_UUID
    },
    {
      name: 'いなり',
      price: 500,
      imageUrl: 'https://dl.dropboxusercontent.com/u/19608428/images/inarisushi.jpg',
      botUuid: SUSHI_BOT_UUID
    }
  ];

  var foodKeywordsData = [
    {
      keywords: ['寿司', 'すし', 'sushi'],
      botUuid: SUSHI_BOT_UUID
    }
  ];


  Bots.upsert({
    botUuid: SUSHI_BOT_UUID
  },
  {
    on: true,
    botUuid: SUSHI_BOT_UUID,
    name: 'LFK出前寿司や',
    channelAccessToken: settings.channelAccessToken
  });

  foodItemsData.forEach((data) => {
    FoodItems.insert(data);
  });

  foodKeywordsData.forEach((data) => {
    FoodKeywords.insert(data);
  });

});
