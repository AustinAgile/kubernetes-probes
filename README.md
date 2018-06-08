# kubernetes-probes
Library for an express listener on specified port to expose an http probe endpoint that kubelet can use to check container status.
Both readiness and liveness probes are supported.
This library supports a model whereby an app could have several asynchronous aspects that define readiness or liveness.
You define one or more functions for each aspect of readiness or liveness.
When probed (readiness or liveness), kubernetes-probes calls the appropriate one or more defined functions.


## Usage
In this examplet here is one liveness function and two readiness functions.

```javascript
var k8sProbes = require('kubernetes-probes');
k8sProbes.addLivenessFunction(ready);
k8sProbes.addReadinessFunction(alive, "ready 1");
k8sProbes.addReadinessFunction(alive, "ready 2");
k8sProbes.listen(80);
//
// Liveness function
var alive = function(cb) {
    cb(true, "I am alive.");
};
//
// Readiness function #1
var ready1 = function(cb) {
    cb(true, "I am ready.");
};
//
// Readiness function #2
var ready2 = function(cb) {
    cb(true, "I am ready.");
};
```

## Dependencies
* Express

## API
  * `addReadinessFunction(alive, name)`
    * `alive` - [REQUIRED] - function(cb).
       Called by kubernetes-probes when kubernetes requests a liveness probe.
       If this function is not defined, kubernetes-probes response will be "liveness function undefined." with status 400.
      * `cb` - [REQUIRED] - function(isAlive, message).
        Called to return liveness state to kubernetes-probes.
        * `isAlive` - [REQUIRED] - boolean.
          TRUE indicates alive, response status is 200.
          FALSE indicates not alive, response status is 400.
        * `message` - [OPTIONAL] - string.
          returned in response to probe.
          * default if `isAlive` TRUE - "alive".
          * default if `isAlive` FALSE - "dead".
    * `name` - [OPTIONAL] - string.
      Name of this particular aspect of being ready. Default is "All".
  * `addLivenessFunction(ready, name)`
    * `ready` - [REQUIRED] - function(cb).
       Called by kubernetes-probes when kubernetes requests a readiness probe.
       If this function is not defined, kubernetes-probes response will be "readiness function undefined." with status 400.
      * `cb` - [REQUIRED] - function(isReady, message).
        Called to return liveness state to kubernetes-probes.
        * `isReady` - [REQUIRED] - boolean.
          TRUE indicates ready, response status is 200.
          FALSE indicates not ready, response status is 400.
        * `message` - [OPTIONAL] - string.
          returned in response to probe.
          * default if `isAlive` TRUE - "ready".
          * default if `isAlive` FALSE - "not ready".
    * `name` - [OPTIONAL] - string.
      Name of this particular aspect of being lively. Default is "All".
  * `listen(port)`
    * `port` - [REQUIRED] - integer.
      kubernetes-probes will start listening on this port.


