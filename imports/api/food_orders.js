import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const FoodOrders = new Mongo.Collection('food_orders');

// id: uuid
// items: array
// customer_line_id: string
// confirmed: boolean
// location: string or object?
