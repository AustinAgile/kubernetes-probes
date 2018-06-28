# kubernetes-probes
Library for an express listener on specified port to expose an http probe endpoint that kubelet can use to check container status.
Both readiness and liveness probes are supported.
This library supports a model whereby an app could have several asynchronous aspects that define readiness or liveness.
You define one or more functions for each aspect of readiness or liveness.
When probed (readiness or liveness), _kubernetes-probes_ calls the appropriate one or more defined functions.

Use of this library infers your app is implementing both (all) probes.
If _kubernetes-probes_ gets a probe and there are no functions defined for that type of probe,
the response will be negative, i.e., a status code of 400.
This will indicate to kubernetes that the app is not ready/lively.

## Usage
In this example readiness and liveness are being set.

```javascript
var k8sProbes = require('kubernetes-probes');
k8sProbes.setReadiness(true);
k8sProbes.setLiveness(true);
k8sProbes.listen(80);
```

In this example there is one liveness function and two readiness functions.

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
* Async

## API
  * `addReadinessFunction(alive, name)`
    * `alive` - [REQUIRED] - function(cb).
       Called by _kubernetes-probes_ when kubernetes requests a liveness probe.
       If this function is not defined, _kubernetes-probes_ response will be "liveness function undefined." with status 400.
      * `cb` - [REQUIRED] - function(isAlive, message).
        Called to return liveness state to _kubernetes-probes_.
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
       Called by _kubernetes-probes_ when kubernetes requests a readiness probe.
       If this function is not defined, _kubernetes-probes_ response will be "readiness function undefined." with status 400.
      * `cb` - [REQUIRED] - function(isReady, message).
        Called to return liveness state to _kubernetes-probes_.
        * `isReady` - [REQUIRED] - boolean.
          TRUE indicates ready, response status is 200.
          FALSE indicates not ready, response status is 400.
        * `message` - [OPTIONAL] - string.
          returned in response to probe.
          * default if `isAlive` TRUE - "ready".
          * default if `isAlive` FALSE - "not ready".
    * `name` - [OPTIONAL] - string.
      Name of this particular aspect of being lively. Default is "All".
  * `setReadiness(ready)`
    * `ready` - [REQUIRED] - boolean.
       If this function has been called, and `addReadinessFunction()` has not been called,
       then the most recent value of `ready` will be used to respond to a readiness probe.
  * `setLiveness(alive)`
    * `alive` - [REQUIRED] - boolean.
       If this function has been called, and `addLivenessFunction()` has not been called,
       then the most recent value of `alive` will be used to respond to a liveness probe.
  * `listen(port)`
    * `port` - [REQUIRED] - integer.
      _kubernetes-probes_ will start listening on this port.


