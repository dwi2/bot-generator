import Messages from '/imports/messages';
import { MailMessageConfig } from './config';

let _MailMessages = new Mongo.Collection('mailMessages');
let _RedeliveryItems = new Mongo.Collection('redeliveryItems');

let _StateManager = {
  nextState: (uuid, userid, currState) => {
    if (currState == MailMessageConfig.State.CONFIRM) {
      _StateManager.moveState(uuid, userid, MailMessageConfig.State.STANDBY);
      return;
    }
    _StateManager.moveState(uuid, userid, currState + 1);
  },
  prevState: (uuid, userid, currState) => {
    if (currState === MailMessageConfig.State.STANDBY) { return; }
    _StateManager.moveState(uuid, userid, currState - 1);
  },
  moveState: (uuid, userid, targetState) => {
    let modifier = { updateTime: Date.now(), state: targetState };
    _MailMessages.update({ uuid: uuid, userid: userid }, { $set: modifier });
  }
};

let _retrieveMessageState = (uuid, userid, message) => {
  let result = _MailMessages.findOne({ uuid: uuid, userid: userid });
  if (!result) {
    _MailMessages.insert({
      uuid: uuid,
      userid: userid,
      updateTime: Date.now(),
      state: MailMessageConfig.State.STANDBY
    });
    return MailMessageConfig.State.STANDBY;
  } else {
    let modifier = { updateTime: Date.now() };
    if ((Date.now() - result.updateTime) > MailMessageConfig.Timeout) {
      modifier.state = MailMessageConfig.State.STANDBY;
    }
    _MailMessages.update({ uuid: uuid }, { $set: modifier });
    return (modifier.state || result.state);
  }
};

let _validateMessage = (uuid, userid, event, reply) => {
  let valid = true;
  let state = _retrieveMessageState(uuid, userid, event.message);
  let trackingNumber = 0;
  switch (state) {
    case MailMessageConfig.State.STANDBY:
      reply({
        type: 'text',
        rawMessages: ['Hi, please give me your devivery tracking number.']
      });
      _StateManager.nextState(uuid, userid, state);
      break;
    case MailMessageConfig.State.RECEIVING_ORDER:
      if (!event.message.text) { return; }
      let trackingNumber = event.message.text;
      let validTrackingNumber =
        (event.message.type !== 'text' || !/\d{10}/.test(trackingNumber))
        ? false : true;
      if (validTrackingNumber) {
        _RedeliveryItems.insert({
          uuid: uuid,
          userid: userid,
          updateTime: Date.now(),
          status: 'requesting',
          trackingNumber: trackingNumber
        });
        let templateMessage = _generateCarouselTemplateMessage({
          columns: ['11/28', '11/29', '11/30'],
          actions: ['9:00-12:00', '12:00-18:00', '18:00-21:00'],
          data: { trackingNumber: trackingNumber }
        });
        reply({
          userid: userid,
          type: 'carousel',
          messages: templateMessage
        });
        _StateManager.nextState(uuid, userid, state);
      } else {
        reply({
          type: 'text',
          rawMessages: ['Please provide delivery tracking number in 10 digits.']
        });
      }
      break;
    case MailMessageConfig.State.RECEIVING_TIME:
      let rcvTimePostback = JSON.parse(event.postback.data);
      let date = rcvTimePostback.delivery_date;
      let time = rcvTimePostback.delivery_time;
      let rcvTrackingNumber = rcvTimePostback.tracking_number;
      if (valid) {
        _RedeliveryItems.update(
          { uuid: uuid, userid: userid, trackingNumber: rcvTrackingNumber },
          { $set: { delivery_date: date, delivery_time: time, updateTime: Date.now() } }
        );
        let templateMessage = _genrtateConfirmTemplateMessage({
          trackingNumber: rcvTrackingNumber, date: date, time: time
        });
        reply({
          userid: userid,
          type: 'confirm',
          messages: templateMessage
        })
        _StateManager.nextState(uuid, userid, state);
      } else {
        // Should be nothing.
      }
    break;
    case MailMessageConfig.State.CONFIRM:
      let confirmPostback = JSON.parse(event.postback.data);
      let confirmAction = confirmPostback.action;
      if (confirmAction === 'confirm') {
        _RedeliveryItems.update(
          { uuid: uuid, userid: userid, trackingNumber: rcvTrackingNumber },
          { $set: { status: 'confirmed' } }
        );
        reply({
          type: 'text',
          rawMessages: ['Thank you for using bot re-delivery service.']
        });
        _StateManager.nextState(uuid, userid, state);
      } else {
        _RedeliveryItems.update(
          { uuid: uuid, userid: userid, trackingNumber: rcvTrackingNumber },
          { $set: { status: 'cancelled' } }
        );
        reply({
          type: 'text',
          rawMessages: ['Request cancelled.']
        });
        _StateManager.nextState(uuid, userid, state);
      }
    break;
  }
};

let _genrtateConfirmTemplateMessage = (options) => {
  return [{
    type: 'template',
    altText: 'This is a confirm template for confirming re-delivery time',
    template: {
      type: 'confirm',
      text: `Tracking number ${options.trackingNumber} will re-deliver on ${options.date} ${options.time}`,
      actions: [{
        type: 'postback',
        label: 'Confirm',
        data: JSON.stringify({
          action: 'confirm',
          type: 're-delivery'
        })
      },{
        type: 'postback',
        label: 'Cancel',
        data: JSON.stringify({
          action: 'cancel',
          type: 're-delivery'
        })
      }]
    }
  }];
};

let _generateCarouselTemplateMessage = (options) => {
  let trackingNumber = options.data.trackingNumber;
  let columns = [];
  options.columns.forEach((column) => {
    let columnActions = [];
    options.actions.forEach((action) => {
      columnActions.push({
        type: 'postback',
        data: JSON.stringify({
          action: 'request',
          type: 're-delivery',
          delivery_date: column,
          delivery_time: action,
          tracking_number: trackingNumber,
          status: 'requsting'
        }),
        label: `${action}`
      });
    });
    columns.push({
      title: `${column}`,
      text: `Choose a re-delivery time.`,
      actions: columnActions,
    });
  });
  let result = [{
    type: 'template',
    altText: 'This is a carousel template for choosing re-delivery time',
    template: {
      type: 'carousel',
      columns: columns
    }
  }];
  return result;
};

let _MailMessageProcessor = ({uuid, userid, event, replyOptions}) => {
  _validateMessage(uuid, userid, event, (options) => {
    options.replyOptions = replyOptions;
    _MailMessageReply(options);
  });
};

let _MailMessageReply = (options) => {
  switch (options.type) {
    case 'text':
      let rawMessages = options.rawMessages;
      let replyMessages = [];
      rawMessages.forEach((rawMessage) => {
        replyMessages.push({type: 'text', text: rawMessage})
      });
      Messages.replyMessage({
        channelAccessToken: options.replyOptions.channelAccessToken,
        replyToken: options.replyOptions.replyToken,
        messages: replyMessages
      });
      break;
    case 'carousel':
    case 'confirm':
      Messages.replyMessage({
        channelAccessToken: options.replyOptions.channelAccessToken,
        replyToken: options.replyOptions.replyToken,
        messages: options.messages
      });
      break;
    default:
      break;
  }
};

export default MailMessageHandler = {
  process: _MailMessageProcessor,
  reply: _MailMessageReply
};
