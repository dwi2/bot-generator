import { foodHandler } from './providers/food';
import { mailHandler } from './providers/mail';

const providers = {
  food: foodHandler,
  mail: mailHandler
};

const handler = ({provider, data}, promise) => {
  try {
    const targetProvider = providers[provider];
    if (targetProvider) {
      targetProvider({ body: data.body });
      promise.resolve(`Handled ${provider} data: ${data.body}`);
    } else {
      throw new Error(`No ${provider} provider available`);
    }
  } catch(exception) {
    promise.reject(`[webhookHandler.handler] ${exception}`);
  }
};

export const serviceResolver = (options) =>
new Promise((resolve, reject) => handler(options, { resolve, reject }));
