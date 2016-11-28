import bodyParser from 'body-parser';
import { Picker } from 'meteor/meteorhacks:picker';
import { serviceResolver } from './serviceResolver';

Picker.middleware(bodyParser.json());
Picker.middleware(bodyParser.urlencoded({ extended: false }));

let POST = Picker.filter(function(request, response) {
  return request.method === 'POST';
});

let GET = Picker.filter(function(request, response) {
  return request.method === 'GET';
});

POST.route('/api/webhooks/:_provider/:_uuid', function(params, request, response, next) {
  let provider = params._provider;
  let data = {
    params: params,
    query: params.query,
    body: request.body
  };

  serviceResolver({ provider, data })
  .then((result) => {
    response.statusCode = 200;
    response.end(result);
  })
  .catch((error) => {
    console.warn(error);
    response.statusCode = 500;
    response.end(error);
  });
});

GET.route('/api/data/:_provider/:_uuid/:_model', function(params, request, response, next) {
  let provider = params._provider;
  let data = {
    params: params,
    query: params.query,
    modelName: params._model
  };

  serviceResolver({ provider, data })
  .then((result) => {
    response.statusCode = 200;
    response.end(JSON.stringify(result));
  })
  .catch((error) => {
    console.warn(error);
    response.statusCode = 500;
    response.end(error);
  });
});
