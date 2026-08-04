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

    // Add validation for events.  We use disabled here because enabled has existing meanings.
    Object.entries(
      serverless.configSchemaHandler.schema.properties.functions.patternProperties
    ).forEach(([, obj]) => {
      Object.entries(obj.properties.events.items.anyOf).forEach(([, item]) => {
        if (item.required == '__schemaWorkaround__') {
          // Must be skipped, or we fail.
          return;
        }
        serverless.configSchemaHandler.defineFunctionEventProperties(
          serverless.service.provider.name,
          item.required[0],
          {
            properties: {
              disabled: { type: `boolean` },
            },
          }
        );
      });
    });
    this.hooks = { 'before:package:initialize': this.run.bind(this) };
  }

  run() {
    Object.entries(this.serverless.service.functions).forEach(([key, func]) => {
      if (func.enabled !== undefined && !func.enabled) {
        this.serverless.cli.log('Disabling function: ' + key);
        delete this.serverless.service.functions[key];
      } else {
        Object.entries(func.events).forEach(([i, event]) => {
          Object.entries(event).forEach(([ekey, e]) => {
            if (e.disabled !== undefined && e.disabled) {
              this.serverless.cli.log(`Disabling function '${key}' event '${ekey}'.`);
              delete this.serverless.service.functions[key].events[i][ekey];
            }
          });
        });
      }
    });
  }
}

module.exports = ServerlessDisableFunctionPlugin;
