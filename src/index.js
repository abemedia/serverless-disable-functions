'use strict';

class ServerlessDisableFunctionPlugin {
  constructor(serverless) {
    this.serverless = serverless;

    // Add validation for functions.
    serverless.configSchemaHandler.defineFunctionProperties(serverless.service.provider.name, {
      properties: {
        enabled: { type: 'boolean' },
      },
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
