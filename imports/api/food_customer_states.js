import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const FoodCustomerStates = new Mongo.Collection('food_customer_states');

// no record in DB means user is in STAND_BY state
FoodCustomerStates.STAND_BY = 1;
FoodCustomerStates.ORDERING = 2;
FoodCustomerStates.CONFIRM = 3;
FoodCustomerStates.LOC = 4;
