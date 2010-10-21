// import libraries
var http = require('http');
var url = require('url');
var EventEngine = require('./EventEngine.js').EventEngine;

this.EventEngineHttpServer = http.createServer(function() {
    
    EventEngine.observe('serverEvent', onServerEvent);

    function textResponse(response, text, responseCode) {
        responseCode = responseCode || 200;

        response.writeHead(responseCode, {
            'Content-Type': 'text/plain',
            'Content-Length': text.length
        });
        response.end(text);
    }

    function jsonResponse(response, json, responseCode) {
        responseCode = responseCode || 200;
        if (typeof(json) !== 'string') {
            json = JSON.stringify(object);
        }

        response.writeHead(responseCode, {
            'Content-Type': 'application/json',
            'Content-Length': json.length
        });
        response.end(json);
    }

    function notifyClients() {
        var now = (new Date()).getTime();
        for (clientId in clientsById) { // TODO: add "hasOwnProperty" check
            var client = clientsById[clientId];
            if (client.response) {
                var newEvents = getEventsBetween(client.lastUpdated, now);
                jsonResponse(client.response, newEvents);
                client.response = null;
                for (var i = 0, n = newEvents.length; i < n; i += 1) {
                    newEvents[i].numClientsToNotify -= 1;
                }
            }
        }
        cleanupEvents();
    }

    function onServerEvent(event) {
        event.numClientsToNotify = clients.length;
        event.serverTime = (new Date()).getTime();
        events.push(event);

        notifyClients();
    }

    function cleanupEvents() {
        // TODO uncomment when ready to test more
        /*
        while (events.length > 0 && events[0].numClientsToNotify === 0) {
            events.shift();
        }
*/
    }

    function getEventsBetween(minTime, maxTime) {
        var result = [];
        var i = 0;
        while (i < events.length && events[i].serverTime < minTime) {
            i += 1;
        }
        while (events[i].serverTime < maxTime) {
            result.push(events[i]);
        }
        return result;
    }

    return function(request, response) {
        var urlInfo = url.parse(request.url, true);
        var queryParams = urlInfo.query;

        switch (urlInfo.pathname) {
        case '/ajax/send':
            var event = {
                name: queryParams.en, // use short query params so URL remains short
                data: queryParams.dt  
            };
            jsonResponse(response, {success:true});
            EventEngine.fire(event);
            break;
        case '/ajax/recv':
            // check nonce to prevent a client from pretending to be another client
            var clientId = queryParams.id;
            var nonce = queryParams.nc;
            var client = clientsById[clientId];
            //if (client.nonce == nonce) { // TODO: uncomment once we want to test security
            client.response = response;
            //}
            break;
        default:
            textResponse(response, 'Invalid command');
        }
    }
}());