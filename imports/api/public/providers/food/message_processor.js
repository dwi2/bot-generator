import { FoodItems } from '../../../food_items.js';
import { FoodOrders } from '../../../food_orders.js';
import { FoodKeywords } from '../../../food_keywords.js';
import { FoodCustomerStates } from '../../../food_customer_states.js';

export default messageProcessor = {
  _print: (botUuid, msgEvent) => {
    console.log(JSON.stringify(msgEvent));
    // Object.keys(msgEvent).forEach((prop) => {
    //   if (typeof msgEvent[prop] === 'object') {
    //     console.log(`${prop}=${JSON.stringify(msgEvent[prop])}`);
    //   } else {
    //     console.log(`${prop}=${msgEvent[prop]}`);
    //   }
    // });
  },

  _getUserState: (botUuid, customerId) => {
    var result = FoodCustomerStates.findOne({botUuid: botUuid, customerId: customerId});
    if (!result) {
      FoodCustomerStates.insert({
        botUuid: botUuid,
        customerId: customerId,
        state: FoodCustomerStates.STAND_BY
      });
      return FoodCustomerStates.STAND_BY;
    }
    return result.state;
  },

  _recvKeywordMessage: (botUuid, customerId, msgBody) => {
    if (msgBody.type !== 'text') {
      return false;
    }

    var result = FoodKeywords.findOne({botUuid: botUuid});
    if (result.keywords && result.keywords.length > 0) {
      return result.keywords.some((keyword) => {
        return msgBody.text.indexOf(keyword) > -1;
      });
    }
    return false;
  },

  _composeMenu: () => {

  },

  parse: (botUuid, msgEvent) => {
    messageProcessor._print(botUuid, msgEvent);

    // discard if we are receiving message from group or others
    if (msgEvent.type !== 'message' || !msgEvent.replyToken || !msgEvent.source ||
        msgEvent.source.type !== 'user') {
      return;
    }

    let customerId = msgEvent.source.userId;
    let msgBody = msgEvent.message;

    let userState = messageProcessor._getUserState(botUuid, customerId);

    console.log(`${customerId} in ${userState}`);

    // if user is in FoodCustomerStates.STAND_BY and give `keywords` in text message
    if (messageProcessor._recvKeywordMessage(botUuid, customerId, msgBody) &&
        userState === FoodCustomerStates.STAND_BY) {
      console.log(`got keyword, send menu`);
    } else {
      console.log(`got no keyword`);
    }

    if (msgEvent.replyToken) {
      return {
        replyToken: msgEvent.replyToken,
        timestamp: msgEvent.timestamp
      };
    }
    return;
  }
};

