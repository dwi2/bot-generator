import { FoodItems } from '../../../food_items.js';
import { FoodOrders } from '../../../food_orders.js';
import { FoodCustomers } from '../../../food_customers.js';
import { Bots } from '../../../bots.js';
import Line from '/imports/line';

// TODO: refactor, this is duplicated to messageProcessor._composeOrderReply
function getDetail(items) {
  let itemCount = {};
  items.forEach((x) => {
    itemCount[x] = (itemCount[x] || 0) + 1;
  });

  let totalMoney = 0;
  let text = '';
  let readableItems = Object.keys(itemCount).map((foodItemId) => {
    let item = FoodItems.get(foodItemId);
    item.amount = itemCount[foodItemId];
    totalMoney += item.price * itemCount[foodItemId];
    return item;
  });
  return {
    items: readableItems,
    totalMoney: totalMoney
  };
};

export default dataProcessor = {
  process: (botUuid, modelName, query) => {
    if (botUuid && modelName === 'food_orders') {

      let result = FoodOrders.getAllOf(botUuid).map((order) => {
        return {
          customer: FoodCustomers.get(order.customerId),
          detail: getDetail(order.items)
        }
      });
      return result;
    }
  }
};
