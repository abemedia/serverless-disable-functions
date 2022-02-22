'use strict';

const providers = [
  'aws',
  'azure',
  'aliyun',
  'cloudflare',
  'fn',
  'google',
  'knative',
  'kubeless',
  'openwhisk',
  'spotinst',
  'tencent',
];

class ServerlessDisableFunctionPlugin {
  constructor(serverless) {
    this.serverless = serverless;

    // Add a validation for each of the standard providers
    providers.forEach((provider) => {
      serverless.configSchemaHandler.defineFunctionProperties(provider, {
        properties: {
          enabled: { type: 'boolean' },
        },
      });
    });
    this.hooks = { 'before:package:initialize': this.run.bind(this) };
  }

  run() {
    Object.entries(this.serverless.service.functions).forEach(([key, func]) => {
      if (func.enabled !== undefined && !func.enabled) {
        this.serverless.cli.log('Disabling function: ' + key);
        delete this.serverless.service.functions[key];
      }
    });
  }
}

module.exports = ServerlessDisableFunctionPlugin;
