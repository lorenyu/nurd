// import libraries
var fs = require('fs')
  , express = require('express')
  , http = require('http')
  , url = require('url')
  , util = require('util')
  , querystring = require('querystring')
  , routes = require('./routes')
  , EventEngine = require('./EventEngine.js').EventEngine
  , less = require('less')
  , path = require('path');

var log = console.log;

var Client = function() {
    // Private class properties and methods
    var nextClientId = 1;

    return function() {

        this.id = nextClientId;
        this.lastUpdated = 0;
        this.response = null;
        nextClientId += 1;
    }
}();

var EventEngineHttpServer = function(app) {
    
    // Private properties and methods

    var clientsById = {};
    var numClients = 0;
    var events = [];
    var numClientsToNotifyByEventId = {};
    var clientTimeout = 10000; // amount of time in milliseconds it takes to timeout a client

    function textResponse(response, text, responseCode) {
        responseCode = responseCode || 200;

        if (!text) {
            text = '[empty]';
        }
        response.writeHead(responseCode, {
            'Content-Type': 'text/plain'
            ,'Content-Length': text.length
        });
        response.end(text);
    }

    function jsonResponse(response, json, responseCode) {
        responseCode = responseCode || 200;
        if (typeof(json) !== 'string') {
            json = JSON.stringify(json);
        }

        response.writeHead(responseCode, {
            'Content-Type': 'application/json',
            'Content-Length': json.length
        });
        response.end(json);
    }

    function notifyClients() {
        //log('notifyClients'); TODO remove
        var now = (new Date()).getTime();
        for (clientId in clientsById) if (clientsById.hasOwnProperty(clientId)) {
            var client = clientsById[clientId];
            //log('client:' + JSON.stringify(client.id)); TODO remove
            if (client.response) {
                var newEvents = getEventsBetween(client.lastUpdated, now);

                // check if newEvents.length > 0 so that we don't constantly sending empty lists of events
                // also check if client.lastUpdated == 0 so we can give the client the clientId immediately
                if (newEvents.length > 0 || client.lastUpdated === 0) {
                    jsonResponse(client.response, {
                        clientId: client.id,
                        events: newEvents
                    });
                    client.lastUpdated = now;
                    client.response = null;
                    for (var i = 0, n = newEvents.length; i < n; i += 1) {
                        numClientsToNotifyByEventId[newEvents[i].id] -= 1;
                    }
                }
            }
        }
        cleanupEvents();
    }

    function notifyClientsAsync() {
        setTimeout(notifyClients, 0);
    }

    function onEvent(event) {
        if (event.name.indexOf('http:') === 0) {
            var eventName = event.name.substring('http:'.length); // strip out "http:" prefix from event name
            EventEngine.fire(eventName, event.data);
        } else if (event.name.indexOf('server:') === 0) {
            onServerEvent(event);
        }
    }

    function onServerEvent(event) {
        numClientsToNotifyByEventId[event.id] = numClients;
        event.serverTime = (new Date()).getTime();
        event.name = 'http:' + event.name;
        events.push(event);

        notifyClientsAsync();
    }

    function cleanupEvents() {
        var now = (new Date()).getTime();
        while (events.length > 0 && (numClientsToNotifyByEventId[events[0].id] === 0 || events[0].serverTime < now - clientTimeout)) {
            delete numClientsToNotifyByEventId[events[0].id];
            events.shift();
        }
    }

    function cleanupClients() {
        var now = (new Date()).getTime(),
            clientId;
        for (clientId in clientsById) if (clientsById.hasOwnProperty(clientId)) {
            var client = clientsById[clientId];

            if ((!client.response) && (client.lastUpdated < now - clientTimeout)) {
                for (var i = 0, n = events.length; i < n; i += 1) {
                    if (events[i].serverTime > client.lastUpdated) {
                        numClientsToNotifyByEventId[events[i].id] -= 1;
                    }
                }
                log('deleting client: ' + clientId);
                delete clientsById[clientId];
                numClients -= 1;
            }
        }
    }


    /*
     * getEventsBetween(minTime, maxTime)
     * ----------------------------------
     * returns events whose serverTime property is > minTime and <= maxTime.
     */
    function getEventsBetween(minTime, maxTime) {
        //log('getEventsBetween:minTime:' + minTime + ',maxTime:' + maxTime);
        var result = [];
        var i = 0;
        var n = events.length;
        while (i < n && events[i].serverTime <= minTime) {
            // log('skipping event:' + JSON.stringify(events[i])); // TODO remove
            i += 1;
        }
        while (i < events.length && events[i].serverTime <= maxTime) {
            // log('adding event:' + JSON.stringify(events[i])); TODO remove
            result.push(events[i]);
            i += 1;
        }
        return result;
    }

    // Public Properties and Methods
    this.close = function(errno) { server.close(errno); };
    this.listen = function(app) {
      app.post('/ajax/send', function(req, res) {
        var eventName = req.body.en
          , eventData = JSON.parse(req.body.dt);
        res.json({success:true});
        EventEngine.fire(eventName, eventData);
      });
      app.get('/ajax/recv', function(req, res) {
        var clientId = req.query.id;
        if (clientId && clientsById.hasOwnProperty(clientId)) {
            var client = clientsById[clientId];
        } else {
            var client = new Client();
            numClients += 1;
            clientsById[client.id] = client;
        }
        client.response = res;
        notifyClientsAsync();
      });
    };

    // Constructor
    EventEngine.observeAll(onEvent);
    setInterval(cleanupClients, clientTimeout);
};

this.Client = Client;
this.EventEngineHttpServer = EventEngineHttpServer;
