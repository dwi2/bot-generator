import { FoodItems } from '../../../food_items.js';
import { FoodOrders } from '../../../food_orders.js';
import { FoodKeywords } from '../../../food_keywords.js';
import { FoodCustomers } from '../../../food_customers.js';
import { FoodCustomerStates } from '../../../food_customer_states.js';
import { Bots } from '../../../bots.js';
import Messages from '/imports/messages';
import Line from '/imports/line';

export default messageProcessor = {
  _print: (botUuid, msgEvent) => {
    console.log(JSON.stringify(msgEvent));
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

  _composeTextMessage: (text) => {
    return {
      type: 'text',
      text: text
    }
  },

  _generateEmptyCarousel: (altText) => {
    return {
      type: 'template',
      altText: altText,
      template: {
        type: 'carousel',
        columns: []
      }
    };
  },

  _composeMenusInArray: (botUuid) => {
    var menus = [];
    var bot = Bots.get(botUuid);
    var foodItems = FoodItems.find({botUuid: botUuid}).fetch();
    var carousel = messageProcessor._generateEmptyCarousel(bot.name);
    foodItems.forEach((foodItem) => {
      if (carousel.template.columns.length >= 5) {
        menus.push(carousel);
        carousel = messageProcessor._generateEmptyCarousel(bot.name);
      }
      let column = {
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
      };
      carousel.template.columns.push(column);
    });
    menus.push(carousel);
    return menus;
  },

  _composeOrderReply: (botUuid, customerId) => {
    var order = FoodOrders.getOngoingOne(botUuid, customerId);
    if (!order.items || order.items.length === 0) {
      // TODO
      return;
    }

    let msgObject = messageProcessor._composeTextMessage('');

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

  _composeConfirmMessage: (botUuid, customerId) => {
    if (!FoodOrders.ongoingOrderHasAnyItem(botUuid, customerId)) {
      return messageProcessor._composeTextMessage('いっらしゃいませ');
    }

    var orderDetail = messageProcessor._composeOrderReply(botUuid, customerId).text;

    return {
      type: 'template',
      altText: `${orderDetail}`,
      template: {
        type: 'confirm',
        text: orderDetail,
        actions: [
          {
            type: 'postback',
            label: 'Yes',
            data: JSON.stringify({action: 'confirm'})
          },
          {
            type: 'postback',
            label: 'Cancel',
            data: JSON.stringify({action: 'cancel'})
          }
        ]
      }
    };
  },

  _sendMessage: (botUuid, customerId, replyToken, msgObject) => {
    var bot = Bots.get(botUuid);
    var httpResult = Messages.replyMessage({
      channelAccessToken: bot.channelAccessToken,
      replyToken: replyToken,
      messages: Array.isArray(msgObject) ? msgObject : [msgObject]
    });
  },

  _getCustomerProfile: (botUuid, customerId) => {
    var bot = Bots.get(botUuid);
    return Line.profile(customerId, bot.channelAccessToken);
  },

  _updateCustomerProfile: (botUuid, customerId) => {
    var customerProfile = FoodCustomers.get(customerId);
    if (!customerProfile) {
      console.log(`we do not have profile of ${customerId}, fetch it from LINE`);
      let lineProfile = messageProcessor._getCustomerProfile(botUuid, customerId);
      FoodCustomers.renew(lineProfile);
    }
  },

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
        case 'confirm':
          FoodOrders.confirm(botUuid, customerId);
          FoodCustomerStates.goToConfirmed(botUuid, customerId);
          messageProcessor._sendMessage(
            botUuid, customerId, replyToken,
            {type: 'text', text: 'ご住所を伺ってよろしいでしょうか'});
          break;
        case 'cancel':
          FoodCustomerStates.goToStandBy(botUuid, customerId);
          break;
      }
      if (data.action === 'add' || data.action === 'remove') {
        let replyMsg = messageProcessor._composeOrderReply(botUuid, customerId);
        messageProcessor._sendMessage(botUuid, customerId, replyToken, replyMsg);
      }
    }
    // TODO
  },

  _handleMessage: (botUuid, customerId, msgBody, replyToken) => {
    // XXX: golden finger!!
    if (messageProcessor._containsWord('food.bot.reset', msgBody)) {
      FoodCustomerStates.goToStandBy(botUuid, customerId);
      return;
    }

    // update customer data if we don't have it
    messageProcessor._updateCustomerProfile(botUuid, customerId);

    // if user is in FoodCustomerStates.STAND_BY and give `keywords` in text message
    if (typeof msgBody.text === 'string' &&
        FoodKeywords.containsKeywords(botUuid, msgBody.text) &&
        FoodCustomerStates.isStandBy(botUuid, customerId)) {
      let menusInArray = messageProcessor._composeMenusInArray(botUuid);
      let instruction = messageProcessor._composeTextMessage(
        'ご注文は以上でよろしいたら、「お会計」や「checkout」などを入れてください');
      menusInArray.push(instruction);
      messageProcessor._sendMessage(botUuid, customerId, replyToken, menusInArray);
      FoodCustomerStates.goToOrdering(botUuid, customerId);
    } else if (FoodCustomerStates.isOrdering(botUuid, customerId)) {
      let billingWords = ['checkout', '会計', '勘定', '終', '完了', '以上', 'とりあえず'];
      var wantToCheckout = messageProcessor._containsWord(billingWords, msgBody);
      if (wantToCheckout) {
        console.log(`${customerId} want to checkout`);
        let confirmMsgObject = messageProcessor._composeConfirmMessage(botUuid, customerId);
        messageProcessor._sendMessage(
          botUuid, customerId, replyToken, confirmMsgObject);
      }
    } else if (FoodCustomerStates.isConfirmed(botUuid, customerId) && msgBody.type === 'location') {
      FoodOrders.storeAddress(botUuid, customerId, msgBody);
      FoodCustomerStates.goToStandBy(botUuid, customerId);
      var thankYouMsg = messageProcessor._composeTextMessage('ありがとうございます');
      messageProcessor._sendMessage(botUuid, customerId, replyToken, thankYouMsg);
    } else {
      console.log(`got no keyword`);
    }
  },

  parse: (botUuid, msgEvent) => {
    var allowedMsgEventTypes = ['message', 'postback', 'follow', 'unfollow'];
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
      let appologizeMsg = messageProcessor._composeTextMessage('申し訳ありませんが、今は営業時間以外');
      messageProcessor._sendMessage(botUuid, customerId, replyToken, appologizeMsg);
      return;
    }

    switch (msgEvent.type) {
      case 'message':
        messageProcessor._handleMessage(botUuid, customerId, msgEvent.message, replyToken);
        break;
      case 'postback':
        messageProcessor._handlePostback(botUuid, customerId, msgEvent.postback, replyToken);
        break;
      case 'follow':
        let keywords = FoodKeywords.getKeywords(botUuid);
        let welcomeMessage = messageProcessor._composeTextMessage(`ご注文は「${keywords.join('」や「')}」を入れてください`);
        messageProcessor._sendMessage(botUuid, customerId, replyToken, welcomeMessage);
        FoodCustomers.renew(messageProcessor._getCustomerProfile(botUuid, customerId));
        break;
      case 'unfollow':
        break;
    }

    return;
  }
};

