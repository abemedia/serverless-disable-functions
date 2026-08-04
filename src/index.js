'use strict';

class ServerlessDisableFunctionPlugin {
  constructor(serverless, _options, utils) {
    this.serverless = serverless;

    if (utils && utils.log) {
      // v3+ passes a logging interface to the plugin constructor.
      this.log = utils.log.notice.bind(utils.log);
    } else {
      // v1 and v2 expose the legacy CLI logger.
      this.log = serverless.cli.log.bind(serverless.cli);
    }

    // defineFunctionProperties only exists since v2; older versions leave `enabled` unvalidated.
    const schema = serverless.configSchemaHandler;
    if (schema && typeof schema.defineFunctionProperties === 'function') {
      schema.defineFunctionProperties(serverless.service.provider.name, {
        properties: { enabled: { type: 'boolean' } },
      });
    }

    this.hooks = { 'before:package:initialize': this.run.bind(this) };
  }

  run() {
    const functions = this.serverless.service.functions;
    Object.keys(functions).forEach((name) => {
      const fn = functions[name];
      if (fn.enabled !== undefined && !fn.enabled) {
        this.log(`Disabling function: ${name}`);
        delete functions[name];
      }
    });
  }
}

module.exports = ServerlessDisableFunctionPlugin;
