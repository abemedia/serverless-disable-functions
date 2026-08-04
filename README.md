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
Add the parameter `disabled: true` to an event to disable it.
This allows you to enable/disable functions/events by stage like so:

```yaml
service: hello-service
provider: aws
custom:
  hello_event_disabled:
    dev: true
    qa: true
    prod: false
  hello_enabled:
    dev: true
    qa: false
    prod: false

functions:
  hello:
    handler: handler.hello
    enabled: ${self:custom.hello_enabled.${opt:stage}}
    events:
      - sns:
        displayName: test event
        disabled: ${self:custom.hello_event_disabled.${opt:stage}}
```
