import { Meteor } from 'meteor/meteor';


Meteor.startup(() => {
  // code to run on server at startup
  var bodyParser = Meteor.npmRequire('body-parser');
  Picker.middleware(bodyParser.json());

  Picker.route('/webhook', function(params, req, res, next) {
    console.log(req.body);
    res.end();
  });
});
