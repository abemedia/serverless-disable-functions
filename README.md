# serverless-disable-functions

A simple serverless plugin to disable functions.

## Install

```sh
yarn add --dev serverless-disable-functions
```

or

```sh
npm install --save-dev serverless-disable-functions
```

Add the plugin to your serverless.yml file:

```yaml
plugins:
  - serverless-disable-functions
```

## Usage

Add the parameter `enabled: false` to a function to disable it.
This allows you to enable/disable functions by stage like so:

```yaml
service: hello-service
provider: aws
custom:
  hello_enabled:
    dev: true
    prod: false

functions:
  hello:
    handler: handler.hello
    enabled: ${self:custom.hello_enabled.${opt:stage}}
```
