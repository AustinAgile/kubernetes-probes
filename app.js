'use strict';

const express = require('express');
var async = require('async');

var readinessFunctions = [];
var livenessFunctions = [];
var readinessState = false;
var livenessState = false;

module.exports = {
	setReadiness: function(ready) {readinessState = ready;},
	setLiveness: function(alive) {livenessState = alive;},
	addReadinessFunction: function(readinessFunction, name) {
		if (!name) {name = "All";}
		readinessFunctions.push(function(cb) {
			readinessFunction(function(ready, message) {
				if (ready) {
					if (message == null) {
						message = "ready";
					}
					var result = {};
					result[name] = message;
					cb(null, result);
				} else {
					if (message == null) {
						message = "not ready";
					}
					var result = {};
					result[name] = message;
					cb(true, result);
				}
			});
		});
	},
	addLivenessFunction: function(livenessFunction, name) {
		if (!name) {name = "All";}
		livenessFunctions.push(function(cb) {
			livenessFunction(function(alive, message) {
				if (alive) {
					if (message == null) {
						message = "lively";
					}
					var result = {};
					result[name] = message;
					cb(null, result);
				} else {
					if (message == null) {
						message = "not lively";
					}
					var result = {};
					result[name] = message;
					cb(true, result);
				}
			});
		});
	},
	listen: function (port) {
		//var self = this;
		const app = express();
		app.set('etag', false);
		app.set('x-powered-by', false);

		app.get('/probes/readiness', function (req, res) {
			console.log("Received readiness probe.");
			if (readinessFunctions.length > 0) {
				async.parallel(readinessFunctions, function(err, results) {
					if (err) {
						res.status(400);
						res.send(JSON.stringify(results));
					} else {
						res.header("Content-Type", "text/plain");
						res.status(200);
						res.send(JSON.stringify(results));
					}
				});
			} else {
				if (readinessState == true) {
					res.header("Content-Type", "text/plain");
					res.status(200);
					res.send("ready");
				}else {
					res.header("Content-Type", "text/plain");
					res.status(400);
					res.send("not ready");
				}
			}
		});

		app.get('/probes/liveness', function (req, res) {
			console.log("Received liveness probe.");
			if (livenessFunctions.length > 0) {
				async.parallel(livenessFunctions, function(err, results) {
					if (err) {
						res.status(400);
						res.send(JSON.stringify(results));
					} else {
						res.header("Content-Type", "text/plain");
						res.status(200);
						res.send(JSON.stringify(results));
					}
				});
			} else {
				if (livenessState == true) {
					res.header("Content-Type", "text/plain");
					res.status(200);
					res.send("alive");
				}else {
					res.header("Content-Type", "text/plain");
					res.status(400);
					res.send("not alive");
				}
			}
		});

		app.listen(port, function () {
			console.log("kubernetes-probes listening on " + port);
		});
	}
};
