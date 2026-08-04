'use strict';

const { runTests } = require('./utils');

// serverless v4 refuses to run without an account; skip rather than fail when no key is
// available (e.g. on fork PRs, where repository secrets are withheld).
runTests('serverless-v4', {
  skip: process.env.SERVERLESS_ACCESS_KEY ? false : 'SERVERLESS_ACCESS_KEY is not set',
});
