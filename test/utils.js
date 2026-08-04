'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { before, describe, it } = require('node:test');

function runPackage(workspace, stage) {
  const serviceDir = fs.mkdtempSync(path.join(workspace, `.fixture-${stage}-`));
  try {
    fs.cpSync(path.join(__dirname, 'fixture'), serviceDir, { recursive: true });

    const result = spawnSync(
      path.join(workspace, 'node_modules', '.bin', 'serverless'),
      ['package', '--stage', stage],
      { cwd: serviceDir, encoding: 'utf8' }
    );
    if (result.error) {
      throw result.error;
    }
    if (result.status !== 0) {
      throw new Error(
        `'serverless package' failed (stage ${stage}):\n${result.stdout}\n${result.stderr}`
      );
    }

    const template = JSON.parse(
      fs.readFileSync(
        path.join(serviceDir, '.serverless', 'cloudformation-template-update-stack.json'),
        'utf8'
      )
    );
    const functions = Object.values(template.Resources)
      .filter((resource) => resource.Type === 'AWS::Lambda::Function')
      .map((resource) => resource.Properties.FunctionName)
      .sort();

    // v1 and v2 log to stdout, v3+ to stderr.
    return { functions, output: result.stdout + result.stderr };
  } finally {
    fs.rmSync(serviceDir, { recursive: true, force: true });
  }
}

function runTests(name, options) {
  const workspace = path.join(__dirname, name);

  describe(`serverless-disable-functions with ${name}`, options || {}, () => {
    before(() => {
      const result = spawnSync('npm', ['install', '--no-audit', '--no-fund'], {
        cwd: workspace,
        encoding: 'utf8',
      });
      if (result.error) {
        throw result.error;
      }
      if (result.status !== 0) {
        throw new Error(`npm install failed in ${workspace}:\n${result.stdout}\n${result.stderr}`);
      }
    });

    it('keeps enabled functions and removes disabled ones', () => {
      const { functions, output } = runPackage(workspace, 'dev');
      assert.deepEqual(functions, [
        'fixture-dev-alwaysOn',
        'fixture-dev-explicitlyEnabled',
        'fixture-dev-stageToggled',
      ]);
      assert.match(output, /Disabling function: disabled/);
      assert.doesNotMatch(output, /Disabling function: stageToggled/);
    });

    it('removes a stage-toggled function in a stage where it is disabled', () => {
      const { functions, output } = runPackage(workspace, 'prod');
      assert.deepEqual(functions, ['fixture-prod-alwaysOn', 'fixture-prod-explicitlyEnabled']);
      assert.match(output, /Disabling function: disabled/);
      assert.match(output, /Disabling function: stageToggled/);
    });
  });
}

module.exports = { runTests };
