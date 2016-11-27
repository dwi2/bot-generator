import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const FoodCustomerStates = new Mongo.Collection('food_customer_states');

// no record in DB means user is in STAND_BY state
FoodCustomerStates.STAND_BY = 1;
FoodCustomerStates.ORDERING = 2;
FoodCustomerStates.CONFIRMED = 3;
FoodCustomerStates.WAITING_FOR_FOOD = 4;

FoodCustomerStates._updateStateOf = (botUuid, customerId, state) => {
  if (botUuid && customerId && typeof state === 'number') {
    console.log(`set state of ${customerId} to ${state}`);
    FoodCustomerStates.upsert({
      botUuid: botUuid,
      customerId: customerId
    },
    {
      $set: {state: state}
    });
  }
};

FoodCustomerStates._getStateOf = (botUuid, customerId) => {
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
};

FoodCustomerStates.isInState = (botUuid, customerId, expectedState) => {
  var state = FoodCustomerStates._getStateOf(botUuid, customerId);
  return state === expectedState;
};

FoodCustomerStates.isStandBy = (botUuid, customerId) => {
  return FoodCustomerStates.isInState(botUuid, customerId, FoodCustomerStates.STAND_BY);
};

FoodCustomerStates.isOrdering = (botUuid, customerId) => {
  return FoodCustomerStates.isInState(botUuid, customerId, FoodCustomerStates.ORDERING);
};

FoodCustomerStates.isConfirmed = (botUuid, customerId) => {
  return FoodCustomerStates.isInState(botUuid, customerId, FoodCustomerStates.CONFIRMED);
};

FoodCustomerStates.isWaitingForFood = (botUuid, customerId) => {
  return FoodCustomerStates.isInState(botUuid, customerId, FoodCustomerStates.WAITING_FOR_FOOD);
};

FoodCustomerStates.goToStandBy = (botUuid, customerId) => {
  // XXX: forcefully to fo back to stand by state without checking
  FoodCustomerStates._updateStateOf(botUuid, customerId, FoodCustomerStates.STAND_BY);
};

FoodCustomerStates.goToOrdering = (botUuid, customerId) => {
  var currentState = FoodCustomerStates._getStateOf(botUuid, customerId);
  if (currentState !== FoodCustomerStates.STAND_BY) {
    console.warn(`Unexpecting state transition: bot = ${botUuid}, customer = ${customerId}`);
    return;
  }
  FoodCustomerStates._updateStateOf(botUuid, customerId, FoodCustomerStates.ORDERING);
};

FoodCustomerStates.goToConfirmed = (botUuid, customerId) => {
  var currentState = FoodCustomerStates._getStateOf(botUuid, customerId);
  if (currentState !== FoodCustomerStates.ORDERING) {
    console.warn(`Unexpecting state transition: bot = ${botUuid}, customer = ${customerId}`);
    return;
  }
  FoodCustomerStates._updateStateOf(botUuid, customerId, FoodCustomerStates.CONFIRMED);
};


