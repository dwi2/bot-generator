import { foodHandler } from './providers/food';
import { mailHandler } from './providers/mail';

const providers = {
  food: foodHandler,
  mail: mailHandler
};

const handler = ({provider, data}, promise) => {
  try {
    const targetServiceProvider = providers[provider];
    if (targetServiceProvider) {
      var result = targetServiceProvider(data) || `Handled request with ${provider} handler`;
      promise.resolve(result);
    } else {
      throw new Error(`No ${provider} handler available`);
    }
  } catch(exception) {
    promise.reject(`[webhookHandler.handler] ${exception}`);
  }
};

export const serviceResolver = (options) =>
new Promise((resolve, reject) => handler(options, { resolve, reject }));
