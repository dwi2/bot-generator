import { FoodItems } from '../../../food_items.js';
import { FoodOrders } from '../../../food_orders.js';
import { FoodKeywords } from '../../../food_keywords.js';
import { FoodCustomerStates } from '../../../food_customer_states.js';
import { Bots } from '../../../bots.js';
import Messages from '/imports/messages';

export default messageProcessor = {
  _print: (botUuid, msgEvent) => {
    console.log(JSON.stringify(msgEvent));
  },

  _containsBotKeywords: (botUuid, msgBody) => {
    var result = FoodKeywords.findOne({botUuid: botUuid});
    return messageProcessor._containsWord(result.keywords, msgBody);
  },

  _containsWord: (words, msgBody) => {
    if (msgBody.type !== 'text') {
      return false;
    }

    if (Array.isArray(words)) {
      return words.some((word) => {
        return msgBody.text.toLowerCase().indexOf(word.toLowerCase()) > -1;
      });
    } else {
      return msgBody.text.toLowerCase().indexOf(words.toLowerCase()) > -1;
    }
  },

  _composeMenu: (botUuid) => {
    var bot = Bots.get(botUuid);
    var foodItems = FoodItems.find({botUuid: botUuid}).fetch();
    var menu = {
      type: 'template',
      altText: bot.name,
      template: {
        type: 'carousel'
      }
    };

    menu.template.columns = foodItems.map((foodItem) => {
      return {
        thumbnailImageUrl: foodItem.imageUrl,
        title: foodItem.name,
        text: foodItem.price + '円',
        actions: [{
          type: 'postback',
          label: '＋１',
          data: JSON.stringify({action: 'add', itemId: foodItem._id})
        },{
          type: 'postback',
          label: 'ー１',
          data: JSON.stringify({action: 'remove', itemId: foodItem._id})
        }]
        // thumbnailImageUrl
      };
    });
    return menu;
  },

  _composeOrderReply: (botUuid, customerId) => {
    var order = FoodOrders.getOngoingOne(botUuid, customerId);
    if (!order.items || order.items.length === 0) {
      // TODO
      return;
    }

    let msgObject = {
      type: 'text',
      text: ''
    };

    let itemCount = {};
    order.items.forEach((x) => {
      itemCount[x] = (itemCount[x] || 0) + 1;
    });

    let totalMoney = 0;
    Object.keys(itemCount).forEach((foodItemId) => {
      let item = FoodItems.get(foodItemId);
      let subTotal = item.price * itemCount[foodItemId];
      msgObject.text += `${item.name} x${itemCount[foodItemId]} = ${subTotal}円\n`;
      totalMoney += subTotal;
    });
    msgObject.text += `--\n合計${totalMoney}円`;
    return msgObject;
  },

  _sendMessage: (botUuid, customerId, replyToken, msgObject) => {
    var bot = Bots.get(botUuid);
    var httpResult = Messages.replyMessage({
      channelAccessToken: bot.channelAccessToken,
      replyToken: replyToken,
      messages: Array.isArray(msgObject) ? msgObject : [msgObject]
    });
  },

// {"type":"postback","replyToken":"2d4f30e34a5b486cb93041d9d43b9a01",
// "source":{"userId":"U2eba10baf511979f278405d130148750","type":"user"},
// "timestamp":1480243098062,
// "postback":{"data":"{\"action\":\"add\",\"item\":\"FLvTdEovMevEQWLZH\"}"}}
  _handlePostback: (botUuid, customerId, postback, replyToken) => {
    var data = JSON.parse(postback.data);
    if (typeof data !== 'object') {
      return;
    }

    console.log(`data = ${JSON.stringify(data)}`);
    if (FoodCustomerStates.isOrdering(botUuid, customerId)) {
      switch(data.action) {
        case 'add':
          FoodOrders.addItem(botUuid, customerId, data.itemId);
          break;
        case 'remove':
          FoodOrders.removeItem(botUuid, customerId, data.itemId);
          break;
      }
      let replyMsg = messageProcessor._composeOrderReply(botUuid, customerId);
      console.log(JSON.stringify(replyMsg));
      messageProcessor._sendMessage(botUuid, customerId, replyToken, replyMsg);
    }
    // TODO
  },

  _handleMessage: (botUuid, customerId, msgBody, replyToken) => {
    // XXX: golden finger!!
    if (messageProcessor._containsWord('food.bot.reset', msgBody)) {
      FoodCustomerStates.goToStandBy(botUuid, customerId);
      return;
    }

    // if user is in FoodCustomerStates.STAND_BY and give `keywords` in text message
    if (messageProcessor._containsBotKeywords(botUuid, msgBody) &&
        FoodCustomerStates.isStandBy(botUuid, customerId)) {
      let menu = messageProcessor._composeMenu(botUuid);
      console.log(`got keyword, send menu`);
      messageProcessor._sendMessage(botUuid, customerId, replyToken, menu);
      FoodCustomerStates.goToOrdering(botUuid, customerId);
    } else if (FoodCustomerStates.isOrdering(botUuid, customerId)) {
      let billingWords = ['checkout', '会計', '勘定', '終', '完了', '以上', 'とりあえず'];
      var wantToCheckout = messageProcessor._containsWord(billingWords, msgBody);
      if (wantToCheckout) {
        console.log(`${customerId} want to checkout`);
        // TODO: print all orders and confirm button
      }
    } else {
      console.log(`got no keyword`);
    }
  },

  parse: (botUuid, msgEvent) => {
    var allowedMsgEventTypes = ['message', 'postback'];
    messageProcessor._print(botUuid, msgEvent);

    // discard message if we are receiving it from group or others
    if (allowedMsgEventTypes.indexOf(msgEvent.type) < 0 || !msgEvent.replyToken || !msgEvent.source ||
        msgEvent.source.type !== 'user') {
      return;
    }

    let customerId = msgEvent.source.userId;
    let replyToken = msgEvent.replyToken;

    // discard message if the bot is turned off
    if (!Bots.isOn(botUuid)) {
      console.warn(`${botUuid} is off or non-existed`);
      messageProcessor._sendMessage(botUuid, customerId, replyToken, {
        type: 'text',
        text: '申し訳ありませんが、今は営業時間以外'
      });
      return;
    }

    switch (msgEvent.type) {
      case 'message':
        messageProcessor._handleMessage(botUuid, customerId, msgEvent.message, replyToken);
        break;
      case 'postback':
        messageProcessor._handlePostback(botUuid, customerId, msgEvent.postback, replyToken);
        break;
    }

    return;
  }
};

