import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
import './dashboard.html';
import './userinfo.html';

FlowRouter.route('/', {
  action: () => {
    BlazeLayout.render('app', {
      main: 'dashboard'
    });
  },
});

FlowRouter.route('/userinfo.html', {
  action: () => {
    BlazeLayout.render('app', {
      main: 'userinfo'
    });
  },
});

Template.app.onRendered(function () {
  $(document).foundation();
});
