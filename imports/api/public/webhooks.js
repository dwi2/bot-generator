import bodyParser from 'body-parser';
import { Picker } from 'meteor/meteorhacks:picker';

Picker.middleware(bodyParser.json());
Picker.middleware(bodyParser.urlencoded({ extended: false }));

let POST = Picker.filter(function(request, response) {
  return request.method == 'POST';
});

POST.route('/api/webhooks/:_uuid', function(params, request, response, next) {
  let data = {
    params: params,
    query: params.query,
    body: request.body
  };

  // XXX: Debugging webhook, to be removed.
  // _uuid is used to identify each bot services.
  console.log(data.params._uuid);
  console.log(data.body);

  response.end();
});
